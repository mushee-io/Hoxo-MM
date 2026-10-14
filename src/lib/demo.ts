import { type Asset } from './markets'
import { type WalletBalances, type LendingBook, demoBalances, emptyBook } from './lend'
import { type Position } from './perps'
export type Activity = { id: string; label: string; detail: string; date: number; amount?: string }
export type DemoState = { balances: WalletBalances; lending: LendingBook; positions: Position[]; activity: Activity[] }
export function initialState(): DemoState { return { balances: { ...demoBalances }, lending: emptyBook(), positions: [], activity: [] } }
const storageKey = 'hoxo-demo-v1'
export function loadDemo(): DemoState {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return initialState()
    const saved: unknown = JSON.parse(raw)
    if (typeof saved !== 'object' || saved === null) return initialState()
    const data = saved as Partial<DemoState>
    if (!data.balances || !data.lending || !Array.isArray(data.positions) || !Array.isArray(data.activity)) return initialState()
    const validBalances = Object.values(data.balances).every(v => typeof v === 'number' && Number.isFinite(v) && v >= 0)
    const assets: Asset[] = ['BDX', 'USDT', 'BTC', 'ETH']
    if (!validBalances || !assets.every(a => typeof data.balances?.[a] === 'number')) return initialState()
    return { balances: data.balances, lending: data.lending, positions: data.positions.slice(0, 100), activity: data.activity.slice(0, 50) }
  } catch { return initialState() }
}
export function saveDemo(value: DemoState) {
  try { localStorage.setItem(storageKey, JSON.stringify(value)) } catch { /* private browsing */ }
}
export const newId = () => crypto.randomUUID()
