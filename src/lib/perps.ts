import { priceOf, validAmount, type Asset } from './markets'
export type Side = 'long' | 'short'
export type PerpMarket = Exclude<Asset, 'USDT'>
export type Position = {
  id: string; market: PerpMarket; side: Side; entry: number; margin: number;
  leverage: number; openedAt: number
}
export const MAINTENANCE_MARGIN_RATE = 0.025

export function openPosition(market: PerpMarket, side: Side, margin: number, leverage: number, id: string): Position {
  if (!['BTC', 'ETH', 'BDX'].includes(market) || !['long', 'short'].includes(side) || !id) throw new Error('Invalid market, side or position ID')
  if (!validAmount(margin) || !Number.isInteger(leverage) || leverage < 1 || leverage > 20 || !validAmount(margin * leverage)) {
    throw new Error('Invalid margin or leverage')
  }
  return { id, market, side, entry: priceOf(market), margin, leverage, openedAt: Date.now() }
}
export function positionMetrics(position: Position, mark: number) {
  if (!validAmount(mark) || !validAmount(position.entry) || !validAmount(position.margin) ||
      !Number.isInteger(position.leverage) || position.leverage < 1 || position.leverage > 20) throw new Error('Invalid position or mark price')
  const notional = position.margin * position.leverage
  const direction = position.side === 'long' ? 1 : -1
  const pnl = direction * notional * (mark / position.entry - 1)
  const equity = position.margin + pnl
  const maintenanceMargin = notional * MAINTENANCE_MARGIN_RATE
  const liquidationPrice = Math.max(0, position.entry * (1 - direction * (1 / position.leverage - MAINTENANCE_MARGIN_RATE)))
  return { notional, pnl, equity, maintenanceMargin, liquidationPrice, liquidatable: equity <= maintenanceMargin, roi: pnl / position.margin * 100 }
}
export function settleDemoPosition(
  balances: Record<Asset, number>,
  positions: Position[],
  id: string,
  mark: number,
) {
  const found = positions.find(p => p.id === id)
  if (!found) throw new Error('Position no longer exists')
  if (positions.filter(p => p.id === id).length !== 1) throw new Error('Duplicate position ID')
  if (!Object.values(balances).every(n => Number.isFinite(n) && n >= 0)) throw new Error('Invalid demo wallet ledger')
  const metrics = positionMetrics(found, mark)
  const liquidated = metrics.liquidatable
  // Once maintenance is breached, this simplified simulator releases no margin.
  // Real exchange liquidations, funding, insurance and socialised loss are not modelled.
  const payout = liquidated ? 0 : Math.max(0, metrics.equity)
  if (!Number.isFinite(payout) || !Number.isFinite(balances.USDT + payout)) throw new Error('Invalid demo settlement amount')
  return {
    positions: positions.filter(p => p.id !== id),
    balances: { ...balances, USDT: balances.USDT + payout },
    metrics,
    liquidated,
    payout,
  }
}
