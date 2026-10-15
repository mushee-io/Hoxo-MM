import { describe, expect, it } from 'vitest'
import { executeDemoSwap, initialDemoPools, pairKey, quoteSwap } from './swap'
import { demoBalances, lendingHealth, applyLendingAction, type LendingBook } from './lend'
import { openPosition, positionMetrics, settleDemoPosition, MAINTENANCE_MARGIN_RATE } from './perps'

describe('HOXO stateful swap demo', () => {
  it('executes against changing pool reserves and accounts for the pool fee', () => {
    const initialPools = initialDemoPools()
    const firstQuote = quoteSwap('BDX', 'USDT', 1000, 0.5, initialPools)
    const before = initialPools[pairKey('BDX', 'USDT')]
    const first = executeDemoSwap(demoBalances, initialPools, 'BDX', 'USDT', 1000, firstQuote.minOut)
    expect(first.quote.amountOut).toBeCloseTo(firstQuote.amountOut)
    expect(first.balances.BDX).toBe(demoBalances.BDX - 1000)
    expect(first.balances.USDT).toBeCloseTo(demoBalances.USDT + firstQuote.amountOut)
    expect(first.pools[pairKey('BDX', 'USDT')].reserveA).toBeGreaterThan(before.reserveA)
    expect(first.pools[pairKey('BDX', 'USDT')].reserveB).toBeLessThan(before.reserveB)
    expect(initialPools[pairKey('BDX', 'USDT')]).toEqual(before) // immutable state update
    const nextQuote = quoteSwap('BDX', 'USDT', 1000, 0.5, first.pools)
    expect(nextQuote.amountOut).toBeLessThan(firstQuote.amountOut)
  })
  it('refuses a stale minimum output and never changes state on failure', () => {
    const pools = initialDemoPools()
    const oldQuote = quoteSwap('BDX', 'USDT', 2000, 0.01, pools)
    const shifted = executeDemoSwap(demoBalances, pools, 'BDX', 'USDT', 5000, 0.01)
    expect(() => executeDemoSwap(shifted.balances, shifted.pools, 'BDX', 'USDT', 2000, oldQuote.minOut)).toThrow(/slippage/)
    expect(pools).toEqual(initialDemoPools())
  })
  it('rejects malformed and overdrawn trades', () => {
    const pools = initialDemoPools()
    expect(() => executeDemoSwap(demoBalances, pools, 'BDX', 'BDX', 1, 0.1)).toThrow()
    expect(() => executeDemoSwap(demoBalances, pools, 'USDT', 'BDX', 100000, 1)).toThrow()
    expect(() => executeDemoSwap(demoBalances, pools, 'BDX', 'USDT', -1, 1)).toThrow()
    expect(() => executeDemoSwap(demoBalances, pools, 'BDX', 'USDT', 1, Infinity)).toThrow()
    expect(() => quoteSwap('BDX', 'USDT', 1000, 100, pools)).toThrow()
  })
})

describe('HOXO perpetual settlement protections', () => {
  it('settles profitable demo trades once and returns margin plus PnL', () => {
    const p = openPosition('BTC', 'long', 100, 5, 'unique')
    const mark = p.entry * 1.1
    const settled = settleDemoPosition(demoBalances, [p], p.id, mark)
    expect(settled.liquidated).toBe(false)
    expect(settled.payout).toBeCloseTo(150)
    expect(settled.balances.USDT).toBeCloseTo(demoBalances.USDT + 150)
    expect(settled.positions).toEqual([])
    expect(() => settleDemoPosition(settled.balances, settled.positions, p.id, mark)).toThrow(/no longer exists/)
  })
  it('does not pay out breached margin and checks position parameters', () => {
    const p = openPosition('ETH', 'short', 100, 10, 'risk')
    const metrics = positionMetrics(p, p.entry * 1.2)
    expect(metrics.liquidatable).toBe(true)
    const closed = settleDemoPosition(demoBalances, [p], p.id, p.entry * 1.2)
    expect(closed.liquidated).toBe(true)
    expect(closed.payout).toBe(0)
    expect(closed.balances.USDT).toBe(demoBalances.USDT)
    expect(MAINTENANCE_MARGIN_RATE).toBeLessThan(1 / 20)
    expect(() => openPosition('BTC', 'long', Infinity, 2, 'x')).toThrow()
    expect(() => openPosition('BTC', 'long', 100, 20.5, 'x')).toThrow()
  })
})

describe('HOXO lending recovery controls', () => {
  it('allows debt reduction when the account starts above max LTV', () => {
    const risk: LendingBook = { supplied: { BDX: 10000 }, borrowed: { USDT: 600 } }
    expect(lendingHealth(risk).borrowCapacityUsd).toBe(0)
    const repaid = applyLendingAction(risk, demoBalances, 'repay', 'USDT', 20)
    expect(repaid.book.borrowed.USDT).toBe(580)
    expect(lendingHealth(repaid.book).borrowCapacityUsd).toBe(0)
    const supplied = applyLendingAction(risk, demoBalances, 'supply', 'BDX', 1000)
    expect(supplied.book.supplied.BDX).toBe(11000)
    expect(() => applyLendingAction(risk, demoBalances, 'withdraw', 'BDX', 1)).toThrow()
    expect(() => applyLendingAction(risk, demoBalances, 'borrow', 'USDT', 1)).toThrow()
  })
})
