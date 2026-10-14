import { type Asset, priceOf, validAmount } from './markets'
export type WalletBalances = Record<Asset, number>
export type LendingBook = { supplied: Partial<Record<Asset, number>>; borrowed: Partial<Record<Asset, number>> }
export const COLLATERAL_FACTOR = 0.7
export const LIQUIDATION_THRESHOLD = 0.8
export const supplyApy: Record<Asset, number> = { BDX: 3.8, USDT: 4.9, BTC: 1.6, ETH: 2.7 }
export const borrowApy: Record<Asset, number> = { BDX: 6.5, USDT: 7.2, BTC: 4.1, ETH: 5.3 }
export const demoBalances: WalletBalances = { BDX: 24000, USDT: 12000, BTC: 0.12, ETH: 2.5 }
export const emptyBook = (): LendingBook => ({ supplied: {}, borrowed: {} })
export function totalValue(holdings: Partial<Record<Asset, number>>): number {
  return (Object.entries(holdings) as [Asset, number][]).reduce((sum, [asset, quantity]) => sum + quantity * priceOf(asset), 0)
}
export function lendingHealth(book: LendingBook) {
  const collateralUsd = totalValue(book.supplied)
  const debtUsd = totalValue(book.borrowed)
  return { collateralUsd, debtUsd,
    borrowCapacityUsd: Math.max(0, collateralUsd * COLLATERAL_FACTOR - debtUsd),
    healthFactor: debtUsd <= 0 ? Infinity : collateralUsd * LIQUIDATION_THRESHOLD / debtUsd,
  }
}
export type LendingAction = 'supply' | 'withdraw' | 'borrow' | 'repay'
export function applyLendingAction(book: LendingBook, balances: WalletBalances, action: LendingAction, asset: Asset, amount: number): { book: LendingBook; balances: WalletBalances } {
  if (!validAmount(amount)) throw new Error('Enter a positive amount')
  const supplied = { ...book.supplied }, borrowed = { ...book.borrowed }
  const wallet = { ...balances }
  const available = wallet[asset]
  const inSupply = supplied[asset] ?? 0
  const inDebt = borrowed[asset] ?? 0
  if (action === 'supply') {
    if (amount > available + 1e-9) throw new Error('Insufficient demo wallet balance')
    wallet[asset] -= amount; supplied[asset] = inSupply + amount
  } else if (action === 'withdraw') {
    if (amount > inSupply + 1e-9) throw new Error('Insufficient supplied balance')
    supplied[asset] = Math.max(0, inSupply - amount); wallet[asset] += amount
  } else if (action === 'borrow') {
    borrowed[asset] = inDebt + amount; wallet[asset] += amount
  } else {
    if (amount > inDebt + 1e-9) throw new Error('Repayment exceeds outstanding debt')
    if (amount > available + 1e-9) throw new Error('Insufficient demo wallet balance')
    borrowed[asset] = Math.max(0, inDebt - amount); wallet[asset] -= amount
  }
  const nextBook = { supplied, borrowed }
  const health = lendingHealth(nextBook)
  if (health.debtUsd > health.collateralUsd * COLLATERAL_FACTOR + 1e-6) {
    throw new Error('Collateral requirement would be exceeded (70% maximum LTV)')
  }
  return { book: nextBook, balances: wallet }
}
