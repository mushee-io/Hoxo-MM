import { type Asset, validAmount } from './markets'
import { borrowApy, lendingHealth, supplyApy, type LendingBook } from './lend'

/** Pure demo accrual. No real deposits, interest or on-chain debts are created. */
export const YEAR_MS = 365 * 24 * 60 * 60 * 1000
export const MAX_ACCRUAL_MS = 30 * 24 * 60 * 60 * 1000
const ASSETS: Asset[] = ['BDX', 'USDT', 'BTC', 'ETH']

export type AccrualResult = {
  book: LendingBook
  elapsedMs: number
  supplyInterest: Partial<Record<Asset, number>>
  borrowInterest: Partial<Record<Asset, number>>
  healthFactor: number
}

/**
 * Use bounded simple APR, deliberately avoiding unbounded compounding on a
 * stale browser state. Any clock reversal, invalid APR or corrupt balance fails.
 * This is illustrative accounting, not a real lending interest model.
 */
export function accrueDemoInterest(book: LendingBook, elapsedMs: number): AccrualResult {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) throw new Error('Invalid elapsed time')
  if (elapsedMs > MAX_ACCRUAL_MS) throw new Error('Accrual window exceeds 30 days; reconcile before continuing')
  const supplied: LendingBook['supplied'] = {}
  const borrowed: LendingBook['borrowed'] = {}
  const supplyInterest: Partial<Record<Asset, number>> = {}
  const borrowInterest: Partial<Record<Asset, number>> = {}
  for (const asset of ASSETS) {
    const supply = book.supplied[asset] ?? 0
    const debt = book.borrowed[asset] ?? 0
    if (![supply, debt].every(n => Number.isFinite(n) && n >= 0)) throw new Error('Invalid lending balance')
    if (!validAmount(supplyApy[asset]) || !validAmount(borrowApy[asset])) throw new Error('Invalid interest-rate configuration')
    const earned = supply * (supplyApy[asset] / 100) * elapsedMs / YEAR_MS
    const owed = debt * (borrowApy[asset] / 100) * elapsedMs / YEAR_MS
    supplied[asset] = supply + earned
    borrowed[asset] = debt + owed
    supplyInterest[asset] = earned
    borrowInterest[asset] = owed
  }
  const next = { supplied, borrowed }
  return { book: next, elapsedMs, supplyInterest, borrowInterest, healthFactor: lendingHealth(next).healthFactor }
}

/** Annualised simple-interest projection (demo only) with a bounded interval. */
export function projectDemoInterest(book: LendingBook, days: number): AccrualResult {
  if (!Number.isFinite(days) || days < 0 || days > 30) throw new Error('Projection must be between 0 and 30 days')
  return accrueDemoInterest(book, days * 24 * 60 * 60 * 1000)
}
