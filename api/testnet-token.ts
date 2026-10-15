import { PUBLIC_TESTNET_LWS, hexTokenId, parseTokenDescriptor } from '../src/lib/testnetCatalogue'

type RequestLike = { method?: string; query?: Record<string, string | string[] | undefined> }
type ResponseLike = {
  setHeader: (name: string, value: string) => void
  status: (n: number) => ResponseLike
  json: (data: unknown) => void
}
/** Public testnet token metadata lookup by exact 64-character asset id. */
export default async function handler(req: RequestLike, res: ResponseLike): Promise<void> {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Only GET public asset metadata is supported' })
    return
  }
  const id = req.query?.id
  if (!hexTokenId(id)) {
    res.status(400).json({ error: 'Provide a full 64-character hexadecimal Beldex Privacy Token ID' })
    return
  }
  try {
    const response = await fetch(PUBLIC_TESTNET_LWS + '/get_token_info', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token_id: id.toLowerCase() }),
      redirect: 'error', signal: AbortSignal.timeout(7000),
    })
    if (!response.ok) throw new Error('Testnet registry unavailable')
    const text = await response.text()
    if (text.length > 20_000) throw new Error('Descriptor exceeds payload limit')
    const asset = parseTokenDescriptor(JSON.parse(text) as unknown)
    if (!asset || asset.tokenId !== id.toLowerCase()) throw new Error('No valid descriptor')
    res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=40')
    res.status(200).json({
      network: 'beldex-testnet', source: 'official-wallet-configured-testnet-lws',
      asset, obtainedAt: new Date().toISOString(),
      note: 'Public token metadata; NOT proof of personal ownership or executable trading liquidity',
    })
  } catch {
    res.status(503).json({ error: 'The Beldex testnet endpoint did not return a valid token descriptor; no identity or balance inferred.' })
  }
}
