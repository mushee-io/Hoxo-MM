import { describe, expect, it } from 'vitest'
import { addPublicWatchlistId, readPublicWatchlist, removePublicWatchlistId, PUBLIC_TOKEN_WATCHLIST_KEY, MAX_PUBLIC_WATCHLIST } from './publicAssetWatchlist'

const storage = () => {
  const map = new Map<string, string>()
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => { map.set(key, value) },
  }
}
describe('M8 PUBLIC asset watchlist — never wallet holdings', () => {
  it('keeps only 64-hex public token IDs and handles duplicates', () => {
    const s = storage()
    const id = 'a'.repeat(64)
    expect(addPublicWatchlistId(s, id.toUpperCase())).toEqual([id])
    expect(addPublicWatchlistId(s, id)).toEqual([id])
    expect(s.getItem(PUBLIC_TOKEN_WATCHLIST_KEY)).toBe(JSON.stringify([id]))
    expect(removePublicWatchlistId(s, id)).toEqual([])
    expect(() => addPublicWatchlistId(s, 'wallet view key')).toThrow()
  })
  it('limits storage and rejects malformed cached asset inventories', () => {
    const s = storage()
    for (let i = 0; i < MAX_PUBLIC_WATCHLIST; i++) addPublicWatchlistId(s, i.toString(16).padStart(64, '0'))
    expect(readPublicWatchlist(s)).toHaveLength(MAX_PUBLIC_WATCHLIST)
    expect(() => addPublicWatchlistId(s, 'f'.repeat(64))).toThrow(/limit/)
    s.setItem(PUBLIC_TOKEN_WATCHLIST_KEY, 'bad JSON')
    expect(readPublicWatchlist(s)).toEqual([])
    s.setItem(PUBLIC_TOKEN_WATCHLIST_KEY, JSON.stringify(['a'.repeat(64), 'A'.repeat(64)]))
    expect(readPublicWatchlist(s)).toEqual([])
    s.setItem(PUBLIC_TOKEN_WATCHLIST_KEY, JSON.stringify(['view_key=secret']))
    expect(readPublicWatchlist(s)).toEqual([])
  })
  it('fails without retaining data if browser storage is unavailable', () => {
    const bad = { getItem: () => null, setItem: () => { throw new Error('Browser storage denied') } }
    expect(() => addPublicWatchlistId(bad, 'a'.repeat(64))).toThrow(/denied/)
  })
})
