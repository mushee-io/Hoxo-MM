import { priceOf, validAmount, type Asset } from './markets'
export type Side = 'long' | 'short'
export type PerpMarket = Exclude<Asset, 'USDT'>
export type Position = {
  id: string; market: PerpMarket; side: Side; entry: number; margin: number;
  leverage: number; openedAt: number
}
export const MAINTENANCE_MARGIN_RATE = 0.05
export function openPosition(market: PerpMarket, side: Side, margin: number, leverage: number, id: string): Position {
  if (!validAmount(margin) || !Number.isFinite(leverage) || leverage < 1 || leverage > 20 || !Number.isInteger(leverage)) throw new Error('Invalid margin or leverage')
  return { id, market, side, entry: priceOf(market), margin, leverage, openedAt: Date.now() }
}
export function positionMetrics(position: Position, mark: number) {
  if (!validAmount(mark)) throw new Error('Invalid mark price')
  const notional = position.margin * position.leverage
  const direction = position.side === 'long' ? 1 : -1
  const pnl = direction * notional * (mark / position.entry - 1)
  const equity = position.margin + pnl
  const maintenanceMargin = notional * MAINTENANCE_MARGIN_RATE
  const liquidationPrice = Math.max(0, position.entry * (1 - direction * (1 / position.leverage - MAINTENANCE_MARGIN_RATE)))
  return { notional, pnl, equity, maintenanceMargin, liquidationPrice, liquidatable: equity <= maintenanceMargin, roi: pnl / position.margin * 100 }
}
