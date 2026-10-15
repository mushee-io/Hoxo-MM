/**
 * Public Beldex HF22 privacy-token metadata, not balances or trading quotes.
 * The extension's own src/lib/tokenApi.ts documents /get_token_list and
 * /get_token_info. This catalog needs NO address, view key or spend key.
 */
export const PUBLIC_TESTNET_LWS = 'https://lwstestapi.rpcnode.stream'
export const TOKEN_PAGE_LIMIT = 6
export type PublicPrivacyToken = {
  tokenId: string
  ticker: string
  name: string
  decimals: number
  currentSupplyAtomic: string
  maximumSupplyAtomic: string
  owner: string
}
export type TokenCatalogue = {
  network: 'beldex-testnet'
  source: 'official-wallet-configured-testnet-lws'
  query: 'public-token-metadata-only'
  obtainedAt: string
  offset: number
  tokens: PublicPrivacyToken[]
  totalCount: number | null
  partial: boolean
  warning: string
}
export function hexTokenId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-fA-F]{64}$/.test(value)
}
const cleanLabel = (x: unknown, maxLength: number): string =>
  typeof x === 'string' ? x.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, maxLength) : ''
export function parseTokenDescriptor(raw: unknown): PublicPrivacyToken | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Record<string, unknown>
  if (!hexTokenId(p.token_id) || !Number.isInteger(p.decimal_point) ||
    Number(p.decimal_point) < 0 || Number(p.decimal_point) > 18) return null
  const current = p.current_supply
  const maximum = p.total_max_supply
  if (typeof current !== 'string' || !/^\d{1,40}$/.test(current) ||
      typeof maximum !== 'string' || !/^\d{1,40}$/.test(maximum)) return null
  return {
    tokenId: p.token_id.toLowerCase(),
    ticker: cleanLabel(p.ticker, 20),
    name: cleanLabel(p.full_name, 80),
    owner: cleanLabel(p.owner, 128),
    decimals: p.decimal_point as number,
    currentSupplyAtomic: current,
    maximumSupplyAtomic: maximum,
  }
}
export function parseTokenList(raw: unknown): { ids: string[]; totalCount: number | null } | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Record<string, unknown>
  if (!Array.isArray(p.token_ids) || p.token_ids.some(id => !hexTokenId(id))) return null
  const totalCount = Number.isSafeInteger(p.total_count) && Number(p.total_count) >= 0 ? Number(p.total_count) : null
  return { ids: p.token_ids.slice(0, TOKEN_PAGE_LIMIT).map((id: string) => id.toLowerCase()), totalCount }
}
export function formatAtomicAssetBalance(value: string, decimals: number): string {
  if (!/^\d{1,40}$/.test(value) || !Number.isInteger(decimals) || decimals < 0 || decimals > 18) {
    throw new Error('Invalid token amount or precision')
  }
  const scale = 10n ** BigInt(decimals)
  const atomic = BigInt(value)
  const whole = (atomic / scale).toString()
  if (decimals === 0) return whole
  const fractional = (atomic % scale).toString().padStart(decimals, '0').replace(/0+$/, '')
  return fractional ? whole + '.' + fractional : whole
}
export function isTokenCatalogue(raw: unknown): raw is TokenCatalogue {
  if (!raw || typeof raw !== 'object') return false
  const x = raw as Record<string, unknown>
  return x.network === 'beldex-testnet' && x.source === 'official-wallet-configured-testnet-lws' &&
    Array.isArray(x.tokens) && x.tokens.length <= TOKEN_PAGE_LIMIT &&
    x.tokens.every(token => parseTokenDescriptor({
      token_id: token.tokenId, ticker: token.ticker, full_name: token.name,
      decimal_point: token.decimals, current_supply: token.currentSupplyAtomic,
      total_max_supply: token.maximumSupplyAtomic, owner: token.owner,
    })) && typeof x.warning === 'string'
}
