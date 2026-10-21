import { hexTokenId } from './testnetCatalogue'

/**
 * Wallet-independent PUBLIC metadata bookmarks. No balances or proof of ownership.
 * Saved data consists only of public 64-hex token IDs; no wallet address or keys.
 */
export const PUBLIC_TOKEN_WATCHLIST_KEY = 'hoxo-public-token-watchlist-v1'
export const MAX_PUBLIC_WATCHLIST = 12
export type PublicWatchlistStorage = Pick<Storage, 'getItem' | 'setItem'>
export function normalisePublicTokenId(id: string): string {
  if (!hexTokenId(id)) throw new Error('A public token ID must contain exactly 64 hexadecimal characters')
  return id.toLowerCase()
}
export function readPublicWatchlist(storage: Pick<Storage, 'getItem'>): string[] {
  try {
    const text = storage.getItem(PUBLIC_TOKEN_WATCHLIST_KEY)
    if (text === null) return []
    const ids: unknown = JSON.parse(text)
    if (!Array.isArray(ids) || ids.length > MAX_PUBLIC_WATCHLIST ||
        ids.some(x => !hexTokenId(x)) ||
        new Set(ids.map((x: string) => x.toLowerCase())).size !== ids.length) return []
    return ids.map((id: string) => id.toLowerCase())
  } catch { return [] }
}
export function addPublicWatchlistId(storage: PublicWatchlistStorage, id: string): string[] {
  const normal = normalisePublicTokenId(id)
  const current = readPublicWatchlist(storage)
  if (current.includes(normal)) return current
  if (current.length >= MAX_PUBLIC_WATCHLIST) throw new Error('Public token watchlist limit reached (12)')
  const next = [...current, normal]
  storage.setItem(PUBLIC_TOKEN_WATCHLIST_KEY, JSON.stringify(next))
  return next
}
export function removePublicWatchlistId(storage: PublicWatchlistStorage, id: string): string[] {
  const next = readPublicWatchlist(storage).filter(x => x !== normalisePublicTokenId(id))
  storage.setItem(PUBLIC_TOKEN_WATCHLIST_KEY, JSON.stringify(next))
  return next
}
