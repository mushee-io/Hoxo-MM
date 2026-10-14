/** Illustrative prices only. NOT live oracle data or executable market quotes. */
export const ASSETS = {
  BDX: { symbol: 'BDX', name: 'Beldex', price: 0.08, color: '#91e7cf' },
  USDT: { symbol: 'USDT', name: 'Demo dollar', price: 1, color: '#49cb9b' },
  BTC: { symbol: 'BTC', name: 'Bitcoin', price: 68000, color: '#f4a854' },
  ETH: { symbol: 'ETH', name: 'Ethereum', price: 3500, color: '#a7b4ff' },
} as const
export type Asset = keyof typeof ASSETS
export const assetSymbols = Object.keys(ASSETS) as Asset[]
export const priceOf = (asset: Asset) => ASSETS[asset].price
export function displayNumber(value: number, max = 4): string {
  return Number.isFinite(value) ? value.toLocaleString('en-US', { maximumFractionDigits: max }) : '—'
}
export function money(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return '$' + displayNumber(value, Math.abs(value) < 1 ? 4 : 2)
}
export function validAmount(value: number): boolean { return Number.isFinite(value) && value > 0 }
