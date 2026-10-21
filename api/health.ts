import { PUBLIC_TESTNET_LWS, parseTokenList } from '../src/lib/testnetCatalogue'

type Request = { method?: string; query?: Record<string, string | string[] | undefined> }
type Response = {
  setHeader: (key: string, value: string) => void
  status: (code: number) => Response
  json: (value: unknown) => void
}

/**
 * Read-only readiness of the running HOXO HTTP API.
 * Health != wallet integration, chain transaction confirmation or DeFi settlement.
 * ?probe=1 adds one bounded public-metadata upstream check; no wallet identifiers.
 */
export default async function handler(req: Request, res: Response): Promise<void> {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'GET only' })
    return
  }
  const probe = req.query?.probe
  if (probe !== undefined && probe !== '1') {
    res.status(400).json({ error: 'Only probe=1 is accepted' })
    return
  }
  const base = {
    service: 'hoxo-testnet-api',
    environment: 'beldex-testnet-research',
    productionDeFiEnabled: false,
    walletKeysStored: false,
  }
  if (probe === undefined) {
    res.status(200).json({ ...base, status: 'operational', upstream: 'not-checked' })
    return
  }
  try {
    const response = await fetch(PUBLIC_TESTNET_LWS + '/get_token_list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offset: 0, count: 1 }),
      redirect: 'error',
      signal: AbortSignal.timeout(4000),
    })
    if (!response.ok) throw new Error('Upstream did not respond successfully')
    const body = await response.text()
    if (body.length > 32_000 || !parseTokenList(JSON.parse(body) as unknown)) {
      throw new Error('Unrecognised public token list response')
    }
    res.status(200).json({ ...base, status: 'operational', upstream: 'public-metadata-responsive' })
  } catch {
    res.status(503).json({
      ...base, status: 'degraded', upstream: 'public-metadata-unavailable',
      note: 'Read-only public registry unreachable; financial settlement remains disabled regardless',
    })
  }
}
