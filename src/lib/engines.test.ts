import { describe, expect, it } from 'vitest'
import { quoteSwap } from './swap'
import { openPosition, positionMetrics } from './perps'
import { applyLendingAction, demoBalances, emptyBook, lendingHealth } from './lend'

describe('swap quote engine', () => {
  it('calculates positive constant-product output and bounded slippage', () => {
    const q = quoteSwap('BDX', 'USDT', 1000, 1)
    expect(q.amountOut).toBeGreaterThan(0)
    expect(q.minOut).toBeCloseTo(q.amountOut * 0.99)
    expect(q.feeUsd).toBeCloseTo(0.24)
    expect(q.priceImpactPct).toBeGreaterThan(0)
  })
  it('rejects invalid amounts and matching pairs', () => {
    expect(() => quoteSwap('BDX', 'BDX', 10)).toThrow()
    expect(() => quoteSwap('BDX', 'BTC', -1)).toThrow()
    expect(() => quoteSwap('BDX', 'BTC', NaN)).toThrow()
    expect(() => quoteSwap('BDX', 'BTC', Infinity)).toThrow()
  })
})

describe('perpetual risk engine', () => {
  it('calculates long profits and downside liquidation', () => {
    const p = openPosition('BTC', 'long', 100, 10, 'test')
    expect(positionMetrics(p, p.entry * 1.05).pnl).toBeCloseTo(50)
    expect(positionMetrics(p, p.entry * 0.9).liquidatable).toBe(true)
  })
  it('calculates short profits and rejects unsafe leverage', () => {
    const p = openPosition('ETH', 'short', 200, 5, 's')
    expect(positionMetrics(p, p.entry * 0.95).pnl).toBeCloseTo(50)
    expect(() => openPosition('ETH', 'long', 100, 21, 'fail')).toThrow()
  })
})

describe('lending risk engine', () => {
  it('supports supply, borrowing, repayment, and withdrawal', () => {
    const a = applyLendingAction(emptyBook(), demoBalances, 'supply', 'BDX', 10000)
    const b = applyLendingAction(a.book, a.balances, 'borrow', 'USDT', 200)
    expect(lendingHealth(b.book).healthFactor).toBeGreaterThan(1)
    const c = applyLendingAction(b.book, b.balances, 'repay', 'USDT', 200)
    const d = applyLendingAction(c.book, c.balances, 'withdraw', 'BDX', 10000)
    expect(d.book.supplied.BDX).toBe(0)
    expect(d.balances.BDX).toBe(demoBalances.BDX)
  })
  it('rejects undercollateralised borrowing and withdrawal', () => {
    const a = applyLendingAction(emptyBook(), demoBalances, 'supply', 'BDX', 10000)
    expect(() => applyLendingAction(a.book, a.balances, 'borrow', 'USDT', 1000)).toThrow()
    const b = applyLendingAction(a.book, a.balances, 'borrow', 'USDT', 500)
    expect(() => applyLendingAction(b.book, b.balances, 'withdraw', 'BDX', 9000)).toThrow()
  })
  it('rejects over-repaying and non-finite quantities', () => {
    expect(() => applyLendingAction(emptyBook(), demoBalances, 'repay', 'USDT', 1)).toThrow()
    expect(() => applyLendingAction(emptyBook(), demoBalances, 'supply', 'BDX', Infinity)).toThrow()
  })
})
