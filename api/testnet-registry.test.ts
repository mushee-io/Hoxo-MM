import { describe, expect, it, vi } from 'vitest'
import tokenHandler from './testnet-token'
import tokensHandler from './testnet-tokens'

const idA = 'a'.repeat(64)
const idB = 'b'.repeat(64)
const descriptor = (id: string) => ({
  token_id: id, ticker: 'TST', full_name: 'Public Test Token',
  owner: 'public-testnet-issuer', current_supply: '123400000000',
  total_max_supply: '500000000000', decimal_point: 9,
})
function mockResponse() {
  const headers = new Map<string, string>()
  const result: { status: number; body: unknown } = { status: 0, body: null }
  const reply = {
    setHeader: (name: string, value: string) => { headers.set(name, value) },
    status: (status: number) => { result.status = status; return reply },
    json: (body: unknown) => { result.body = body },
  }
  return { reply, result, headers }
}
function response(body: unknown, ok = true) {
  return { ok, status: ok ? 200 : 503, text: async () => JSON.stringify(body) }
}
describe('M6 read-only token API tests — mocked public LWS, no wallet secrets', () => {
  it('rejects unsafe methods and invalid token identifiers before network calls', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    try {
      const badMethod = mockResponse()
      await tokensHandler({ method: 'POST', query: { offset: '0' } }, badMethod.reply)
      expect(badMethod.result.status).toBe(405)
      const badOffset = mockResponse()
      await tokensHandler({ method: 'GET', query: { offset: '-1' } }, badOffset.reply)
      expect(badOffset.result.status).toBe(400)
      const badId = mockResponse()
      await tokenHandler({ method: 'GET', query: { id: '../../../view-key' } }, badId.reply)
      expect(badId.result.status).toBe(400)
      expect(fetchMock).not.toHaveBeenCalled()
    } finally { vi.unstubAllGlobals() }
  })
  it('returns verified public testnet token list without private wallet metadata', async () => {
    const fetchMock = vi.fn(async (url: string, init?: { body?: string }) => {
      const body = JSON.parse(init?.body ?? '{}') as Record<string, unknown>
      if (url.endsWith('/get_token_list')) return response({ token_ids: [idA, idB], total_count: 2 })
      if (url.endsWith('/get_token_info') && body.token_id === idA) return response(descriptor(idA))
      if (url.endsWith('/get_token_info') && body.token_id === idB) return response(descriptor(idB))
      return response({}, false)
    })
    vi.stubGlobal('fetch', fetchMock)
    try {
      const x = mockResponse()
      await tokensHandler({ method: 'GET', query: { offset: '0' } }, x.reply)
      expect(x.result.status).toBe(200)
      expect(x.result.body).toMatchObject({ network: 'beldex-testnet', totalCount: 2, partial: false })
      const body = x.result.body as { tokens: Array<{ tokenId: string }> }
      expect(body.tokens.map(z => z.tokenId)).toEqual([idA, idB])
      expect(JSON.stringify(x.result.body)).not.toMatch(/view_key|spend_key|balance/i)
      const requests = fetchMock.mock.calls as Array<[string, { body?: string }]>
      expect(requests.every(([, init]) => !/view_key|spend_key|address/.test(init.body ?? ''))).toBe(true)
    } finally { vi.unstubAllGlobals() }
  })
  it('does not substitute fake asset data when one descriptor lookup fails', async () => {
    const fetchMock = vi.fn(async (url: string, init?: { body?: string }) => {
      const body = JSON.parse(init?.body ?? '{}') as Record<string, unknown>
      if (url.endsWith('/get_token_list')) return response({ token_ids: [idA, idB], total_count: 2 })
      if (body.token_id === idA) return response(descriptor(idA))
      return response({}, false)
    })
    vi.stubGlobal('fetch', fetchMock)
    try {
      const x = mockResponse()
      await tokensHandler({ method: 'GET' }, x.reply)
      expect(x.result.status).toBe(200)
      const parsed = x.result.body as { tokens: Array<{ tokenId: string }>; partial: boolean }
      expect(parsed.partial).toBe(true)
      expect(parsed.tokens.map(z => z.tokenId)).toEqual([idA])
      const y = mockResponse()
      await tokenHandler({ method: 'GET', query: { id: idB } }, y.reply)
      expect(y.result.status).toBe(503)
    } finally { vi.unstubAllGlobals() }
  })
  it('rejects a successful HTTP response containing mismatched asset identity', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(descriptor(idB))))
    try {
      const x = mockResponse()
      await tokenHandler({ method: 'GET', query: { id: idA } }, x.reply)
      expect(x.result.status).toBe(503)
      expect(JSON.stringify(x.result.body)).not.toContain(idB)
    } finally { vi.unstubAllGlobals() }
  })
})
