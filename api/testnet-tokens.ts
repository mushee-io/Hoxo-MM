import {
  PUBLIC_TESTNET_LWS, TOKEN_PAGE_LIMIT, hexTokenId,
  parseTokenDescriptor, parseTokenList, type PublicPrivacyToken, type TokenCatalogue,
} from '../src/lib/testnetCatalogue'

type RequestLike = { method?: string; query?: Record<string, string | string[] | undefined> }
type ResponseLike = {
  setHeader: (name: string, value: string) => void
  status: (status: number) => ResponseLike
  json: (value: unknown) => void
}
async function publicLwsPost(path: '/get_token_list' | '/get_token_info', body: object): Promise<unknown> {
  // Constant origin/path: user input is never placed in a fetch URL.
  const response = await fetch(PUBLIC_TESTNET_LWS + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(7000),
    redirect: 'error',
  })
  if (!response.ok) throw new Error('Beldex LWS returned HTTP ' + response.status)
  const bytes = await response.text()
  if (bytes.length > 180_000) throw new Error('Token metadata reply exceeded safety limit')
  return JSON.parse(bytes) as unknown
}

/**
 * Vercel Node function: anonymous public testnet asset discovery only.
 * NEVER proxy account balance queries, view keys, signing or transfers.
 */
export default async function handler(req: RequestLike, res: ResponseLike): Promise<void> {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'GET only; no private wallet data accepted' })
    return
  }
  const rawOffset = req.query?.offset
  const offsetText = Array.isArray(rawOffset) ? '' : rawOffset ?? '0'
  if (!/^\d{1,5}$/.test(offsetText) || Number(offsetText) > 10_000) {
    res.status(400).json({ error: 'Invalid catalogue offset' })
    return
  }
  const offset = Number(offsetText)
  try {
    const listReply = parseTokenList(await publicLwsPost('/get_token_list', { offset, count: TOKEN_PAGE_LIMIT }))
    if (!listReply) throw new Error('Unexpected public token registry format')
    const settled = await Promise.allSettled(listReply.ids.map(async (id): Promise<PublicPrivacyToken> => {
      if (!hexTokenId(id)) throw new Error('Invalid token identifier')
      const descriptor = parseTokenDescriptor(await publicLwsPost('/get_token_info', { token_id: id }))
      if (!descriptor || descriptor.tokenId !== id) throw new Error('Unexpected public token descriptor')
      return descriptor
    }))
    const tokens = settled.flatMap(row => row.status === 'fulfilled' ? [row.value] : [])
    const partial = settled.some(row => row.status === 'rejected')
    // No guessed tokens, no fabricated prices, and never an unverified "live".
    const catalogue: TokenCatalogue = {
      network: 'beldex-testnet',
      source: 'official-wallet-configured-testnet-lws',
      query: 'public-token-metadata-only',
      obtainedAt: new Date().toISOString(),
      offset,
      tokens,
      totalCount: listReply.totalCount,
      partial,
      warning: partial
        ? 'Some public token descriptors could not be independently fetched; incomplete results.'
        : 'Public LWS metadata is not a verified personal wallet balance, an executable swap quote or a chain-finality proof.',
    }
    res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=40')
    res.status(200).json(catalogue)
  } catch {
    res.status(503).json({
      network: 'beldex-testnet', available: false,
      error: 'Official testnet light-wallet token catalogue unavailable or incompatible. No data inferred.',
    })
  }
}
