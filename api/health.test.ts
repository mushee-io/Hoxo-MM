import { describe, expect, it, vi } from 'vitest'
import healthHandler from './health'

const res = () => {
  const headers = new Map<string, string>()
  const result: { code: number; body: unknown } = { code: 0, body: null }
  const response = {
    setHeader: (k: string, v: string) => { headers.set(k, v) },
    status: (code: number) => { result.code = code; return response },
    json: (body: unknown) => { result.body = body },
  }
  return { headers, result, response }
}
describe('M2 public HTTP health endpoint', () => {
  it('does not claim the blockchain or DeFi are ready without probing', async () => {
    const x = res()
    await healthHandler({ method: 'GET' }, x.response)
    expect(x.result.code).toBe(200)
    expect(x.result.body).toMatchObject({ status: 'operational', upstream: 'not-checked', productionDeFiEnabled: false, walletKeysStored: false })
    expect(x.headers.get('Cache-Control')).toBe('no-store')
  })
  it('refuses mutations and malformed upstream probe input', async () => {
    const a = res()
    await healthHandler({ method: 'POST' }, a.response)
    expect(a.result.code).toBe(405)
    const b = res()
    await healthHandler({ method: 'GET', query: { probe: ['1', '2'] } }, b.response)
    expect(b.result.code).toBe(400)
  })
  it('probes only the pinned public registry and distinguishes degraded operation', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => JSON.stringify({ token_ids: [], total_count: 0 }) })
    vi.stubGlobal('fetch', fetchMock)
    try {
      const a = res()
      await healthHandler({ method: 'GET', query: { probe: '1' } }, a.response)
      expect(a.result.code).toBe(200)
      expect(a.result.body).toMatchObject({ upstream: 'public-metadata-responsive' })
      const [url, options] = fetchMock.mock.calls[0]
      expect(url).toBe('https://lwstestapi.rpcnode.stream/get_token_list')
      expect(options.redirect).toBe('error')
      fetchMock.mockRejectedValueOnce(new Error('Test upstream outage'))
      const b = res()
      await healthHandler({ method: 'GET', query: { probe: '1' } }, b.response)
      expect(b.result.code).toBe(503)
      expect(b.result.body).toMatchObject({ status: 'degraded', productionDeFiEnabled: false })
    } finally { vi.unstubAllGlobals() }
  })
})
