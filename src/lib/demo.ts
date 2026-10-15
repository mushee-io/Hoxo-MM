import { assetSymbols, validAmount, type Asset } from './markets'
import { type WalletBalances, type LendingBook, demoBalances, emptyBook } from './lend'
import { type Position } from './perps'
import { initialDemoPools, pairKey, type PoolBook } from './swap'

export type Activity = { id: string; label: string; detail: string; date: number; amount?: string }
export type DemoState = {
  balances: WalletBalances
  lending: LendingBook
  positions: Position[]
  activity: Activity[]
  pools: PoolBook
}
export function initialState(): DemoState {
  return { balances: { ...demoBalances }, lending: emptyBook(), positions: [], activity: [], pools: initialDemoPools() }
}
const storageKey = 'hoxo-demo-v1'
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const validNonnegative = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0
const validLedger = (v: unknown): boolean => isRecord(v) && Object.entries(v).every(([asset, amount]) => assetSymbols.includes(asset as Asset) && validNonnegative(amount))
function validPools(v: unknown): v is PoolBook {
  if (!isRecord(v)) return false
  const expected = initialDemoPools()
  return Object.keys(v).length === Object.keys(expected).length && Object.keys(expected).every(key => {
    const pool = v[key]
    return isRecord(pool) && validAmount(pool.reserveA as number) && validAmount(pool.reserveB as number)
  })
}
function validPosition(v: unknown): v is Position {
  if (!isRecord(v)) return false
  return typeof v.id === 'string' && v.id.length > 0 &&
    ['BDX', 'BTC', 'ETH'].includes(v.market as string) &&
    ['long', 'short'].includes(v.side as string) &&
    validAmount(v.entry as number) && validAmount(v.margin as number) &&
    typeof v.leverage === 'number' && Number.isInteger(v.leverage) && v.leverage >= 1 && v.leverage <= 20 &&
    validNonnegative(v.openedAt)
}
function validActivity(v: unknown): v is Activity {
  return isRecord(v) && typeof v.id === 'string' && typeof v.label === 'string' &&
    typeof v.detail === 'string' && validNonnegative(v.date)
}
export function loadDemo(): DemoState {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return initialState()
    const saved: unknown = JSON.parse(raw)
    if (!isRecord(saved)) return initialState()
    const { balances, lending, positions, activity, pools } = saved
    if (!isRecord(balances) || !assetSymbols.every(a => validNonnegative(balances[a]))) return initialState()
    if (!isRecord(lending) || !validLedger(lending.supplied) || !validLedger(lending.borrowed)) return initialState()
    if (!Array.isArray(positions) || !positions.every(validPosition)) return initialState()
    if (!Array.isArray(activity) || !activity.every(validActivity)) return initialState()
    // Transparently migrate v1 browser simulations that predate mutable pools.
    if (pools !== undefined && !validPools(pools)) return initialState()
    return {
      balances: Object.fromEntries(assetSymbols.map(a => [a, balances[a]])) as WalletBalances,
      lending: lending as LendingBook,
      positions: positions.slice(0, 100),
      activity: activity.slice(0, 50),
      pools: pools === undefined ? initialDemoPools() : pools,
    }
  } catch { return initialState() }
}
export function saveDemo(value: DemoState) {
  try { localStorage.setItem(storageKey, JSON.stringify(value)) } catch { /* private browsing */ }
}
export const newId = () => crypto.randomUUID()
