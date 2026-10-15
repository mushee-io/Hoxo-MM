import { describe, expect, it } from 'vitest'
import { demoBalances } from './lend'
import { initialDemoPools, executeDemoSwap } from './swap'
import { executeDemoRoute, findDemoRoutes, MAX_DEMO_TRADE_USD } from './routes'
import { assertDemoOperation, assertLiveSettlementEnabled, defaultDemoPolicy } from './security'
import { productionReadiness } from './readiness'

describe('M5 route aggregation research simulator', () => {
  it('compares two simulated paths and updates pools without mutating inputs', () => {
    const pools = initialDemoPools()
    const routes = findDemoRoutes('BDX', 'BTC', 1000, 0.5, pools, 'beldex-testnet', 'beldex-testnet', 1000)
    expect(routes).toHaveLength(2)
    expect(routes[0].estimatedOut).toBeGreaterThanOrEqual(routes[1].estimatedOut)
    expect(routes.some(r => r.id === 'direct')).toBe(true)
    const multi = routes.find(r => r.id === 'via-usdt')!
    const executed = executeDemoRoute(multi, demoBalances, pools, 1010)
    expect(executed.amountOut).toBeGreaterThanOrEqual(multi.minOut)
    expect(executed.balances.BDX).toBe(demoBalances.BDX - 1000)
    expect(executed.balances.BTC).toBeGreaterThan(demoBalances.BTC)
    expect(executed.balances.USDT).toBeCloseTo(demoBalances.USDT)
    expect(pools).toEqual(initialDemoPools())
  })
  it('does not fabricate executable cross-chain routes', () => {
    const pools = initialDemoPools()
    expect(findDemoRoutes('BDX', 'ETH', 1000, 0.5, pools, 'beldex-testnet', 'bsc', 1000)).toEqual([])
    expect(findDemoRoutes('BDX', 'ETH', 1000, 0.5, pools, 'ethereum', 'beldex-testnet', 1000)).toEqual([])
  })
  it('rejects expiry, corrupted route metadata and oversized amounts', () => {
    const pools = initialDemoPools()
    const route = findDemoRoutes('BDX', 'ETH', 1000, 0.5, pools, 'beldex-testnet', 'beldex-testnet', 1000)[0]
    expect(() => executeDemoRoute(route, demoBalances, pools, route.expiresAt + 1)).toThrow(/expired/)
    expect(() => executeDemoRoute({ ...route, execution: 'unavailable' }, demoBalances, pools, 1001)).toThrow(/not available/)
    expect(() => executeDemoRoute({ ...route, path: ['BDX', 'BDX'] }, demoBalances, pools, 1001)).toThrow(/Unsupported/)
    expect(() => findDemoRoutes('BTC', 'ETH', MAX_DEMO_TRADE_USD, 0.5, pools)).toThrow(/cap/)
    expect(() => findDemoRoutes('BDX', 'ETH', NaN, 0.5, pools)).toThrow()
  })
  it('rejects a stale second hop without saving any partially applied state', () => {
    const pools = initialDemoPools()
    const route = findDemoRoutes('BDX', 'BTC', 2000, 0.1, pools, 'beldex-testnet', 'beldex-testnet', 1000).find(r => r.id === 'via-usdt')!
    const moved = executeDemoSwap(demoBalances, pools, 'USDT', 'BTC', 3000, 0.000001)
    const copy = JSON.stringify(moved.pools)
    expect(() => executeDemoRoute(route, demoBalances, moved.pools, 1001)).toThrow(/slippage/)
    expect(JSON.stringify(moved.pools)).toBe(copy)
    expect(demoBalances.BDX).toBe(24000)
  })
})

describe('M6 operational simulation guardrails', () => {
  const paused = { paused: true }
  it('blocks new risk but permits repayment, supply and close while paused', () => {
    expect(() => assertDemoOperation('swap', paused, 10)).toThrow(/paused/)
    expect(() => assertDemoOperation('open-perp', paused, 1000, 2)).toThrow(/paused/)
    expect(() => assertDemoOperation('withdraw', paused, 10)).toThrow(/paused/)
    expect(() => assertDemoOperation('borrow', paused, 10)).toThrow(/paused/)
    expect(() => assertDemoOperation('repay', paused, 50)).not.toThrow()
    expect(() => assertDemoOperation('supply', paused, 50)).not.toThrow()
    expect(() => assertDemoOperation('close-perp', paused, 0)).not.toThrow()
  })
  it('enforces action caps, number finiteness and max leverage', () => {
    const on = defaultDemoPolicy()
    expect(() => assertDemoOperation('swap', on, 10_001)).toThrow()
    expect(() => assertDemoOperation('open-perp', on, 25001, 5)).toThrow()
    expect(() => assertDemoOperation('open-perp', on, 1000, 11)).toThrow()
    expect(() => assertDemoOperation('borrow', on, 5001)).toThrow()
    expect(() => assertDemoOperation('swap', on, NaN)).toThrow()
    expect(() => assertDemoOperation('route', on, Infinity)).toThrow()
    expect(() => assertDemoOperation('open-perp', on, 1000, 5)).not.toThrow()
  })
  it('hard-disables production settlement', () => {
    expect(() => assertLiveSettlementEnabled()).toThrow(/disabled/)
  })
})

describe('M7 launch gating', () => {
  it('keeps production disabled when independent controls are not verified', () => {
    const state = productionReadiness()
    expect(state.previewDeployable).toBe(true)
    expect(state.productionEnabled).toBe(false)
    expect(state.blockers.length).toBeGreaterThan(0)
    expect(state.blockers.some(x => x.id === 'audit')).toBe(true)
    expect(state.blockers.some(x => x.id === 'bridges')).toBe(true)
  })
})
