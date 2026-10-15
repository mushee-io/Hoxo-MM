import { describe, expect, it, vi, afterEach } from 'vitest'
import { estimateDemoEconomics, ECONOMICS } from './economics'
import { executeDemoRoute, findDemoRoutes } from './routes'
import { demoBalances } from './lend'
import { initialDemoPools } from './swap'
import { initialState, loadDemo, saveDemo } from './demo'

describe('M6 economic allocations are explicitly illustrative', () => {
  it('conserves the example fee pool across LP, protocol and treasury buckets', () => {
    const fees = estimateDemoEconomics(100)
    expect(fees.poolFeesUsd).toBe(100)
    expect(fees.liquidityProviderFeesUsd + fees.protocolRevenueUsd).toBeCloseTo(100)
    expect(fees.proposedBuybackUsd + fees.securityReserveUsd + fees.operationsUsd).toBeCloseTo(fees.protocolRevenueUsd)
    expect(fees.proposedBuybackUsd).toBeCloseTo(100 * ECONOMICS.protocolShareOfPoolFees * 0.25)
    expect(fees.illustrativeBdxEquivalent).toBeGreaterThan(0)
    expect(fees.status).toBe('illustrative-not-executed')
  })
  it('refuses invalid revenue and yields no fictional fees without demo trading', () => {
    for (const n of [-1, NaN, Infinity]) expect(() => estimateDemoEconomics(n)).toThrow()
    expect(estimateDemoEconomics(0).proposedBuybackUsd).toBe(0)
  })
  it('accounts for every leg in local routing', () => {
    const pools = initialDemoPools()
    const plan = findDemoRoutes('BDX', 'ETH', 1000, 0.5, pools, 'beldex-testnet', 'beldex-testnet', 1000).find(x => x.id === 'via-usdt')!
    const result = executeDemoRoute(plan, demoBalances, pools, 1001)
    expect(result.poolFeesUsd).toBeCloseTo(plan.legs.reduce((sum, leg) => sum + leg.feeUsd, 0))
    expect(estimateDemoEconomics(result.poolFeesUsd).protocolRevenueUsd).toBeGreaterThan(0)
  })
})

describe('M6 demo browser state validation', () => {
  const map = new Map<string, string>()
  afterEach(() => { vi.unstubAllGlobals(); map.clear() })
  function setup() {
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => { map.set(key, value) },
    })
  }
  it('migrates legacy local state and adds missing example pool fee accounting', () => {
    setup()
    const prior = initialState()
    const { poolFeesUsd: _discard, ...legacy } = prior
    void _discard
    map.set('hoxo-demo-v1', JSON.stringify(legacy))
    const loaded = loadDemo()
    expect(loaded.poolFeesUsd).toBe(0)
    expect(loaded.balances).toEqual(prior.balances)
    expect(loaded.pools).toEqual(prior.pools)
  })
  it('persists valid example fees and discards corrupt stored values', () => {
    setup()
    const demo = { ...initialState(), poolFeesUsd: 15.25 }
    saveDemo(demo)
    expect(loadDemo().poolFeesUsd).toBeCloseTo(15.25)
    map.set('hoxo-demo-v1', JSON.stringify({ ...demo, poolFeesUsd: -2 }))
    expect(loadDemo().poolFeesUsd).toBe(0)
    map.set('hoxo-demo-v1', '{bad json')
    expect(loadDemo().poolFeesUsd).toBe(0)
  })
})
