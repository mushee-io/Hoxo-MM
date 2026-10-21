import { describe, expect, it } from 'vitest'
import { assertResearchPrice, researchCollateralRisk, researchPerpsRisk } from './riskResearch'

const now = 1_797_100_000_000
const price = (usd: number, at = now) => ({ priceUsdE8: BigInt(usd) * 100_000_000n, observedAtMs: at, source: 'research-fixture' as const })

describe('M15–M18 research risk kernel — no fund movements', () => {
  it('checks stale, future and untrusted price fixtures', () => {
    expect(() => assertResearchPrice(price(100), now)).not.toThrow()
    expect(() => assertResearchPrice(price(100, now - 60_001), now)).toThrow(/stale/)
    expect(() => assertResearchPrice(price(100, now + 1), now)).toThrow(/future/)
    expect(() => assertResearchPrice({ ...price(100), priceUsdE8: 0n }, now)).toThrow()
    expect(() => assertResearchPrice({ ...price(100), source: 'rpc' as 'research-fixture' }, now)).toThrow()
  })
  it('preserves exact collateral units and enforces research LTV thresholds', () => {
    const base = {
      amountAtomic: 1_000_000_000n, decimals: 9, price: price(100),
      debtUsdE8: 50n * 100_000_000n, maxLtvBps: 7000, liquidationLtvBps: 8000,
    }
    const result = researchCollateralRisk(base, now)
    expect(result.collateralUsdE8).toBe(100n * 100_000_000n)
    expect(result.maximumDebtUsdE8).toBe(70n * 100_000_000n)
    expect(result.borrowingHeadroomUsdE8).toBe(20n * 100_000_000n)
    expect(result.liquidatable).toBe(false)
    expect(result.execution).toBe('research-only')
    const breach = researchCollateralRisk({ ...base, debtUsdE8: 80n * 100_000_000n }, now)
    expect(breach.liquidatable).toBe(true)
    expect(breach.borrowingHeadroomUsdE8).toBe(0n)
    expect(breach.healthFactorBps).toBe(10_000n)
    expect(researchCollateralRisk({ ...base, debtUsdE8: 0n }, now).healthFactorBps).toBeNull()
    expect(() => researchCollateralRisk({ ...base, maxLtvBps: 9000 }, now)).toThrow()
    expect(() => researchCollateralRisk({ ...base, amountAtomic: -1n }, now)).toThrow()
  })
  it('calculates signed perp P&L and simulated maintenance without custody', () => {
    const x = { marginUsdE8: 100n * 100_000_000n, leverage: 5, side: 'long' as const,
      entry: price(200), mark: price(180), maintenanceBps: 250 }
    const long = researchPerpsRisk(x, now)
    expect(long.pnlUsdE8).toBe(-50n * 100_000_000n)
    expect(long.equityUsdE8).toBe(50n * 100_000_000n)
    expect(long.liquidatable).toBe(false)
    expect(researchPerpsRisk({ ...x, side: 'short' }, now).pnlUsdE8).toBe(50n * 100_000_000n)
    expect(researchPerpsRisk({ ...x, mark: price(100) }, now).liquidatable).toBe(true)
    expect(() => researchPerpsRisk({ ...x, leverage: 100 }, now)).toThrow()
    expect(() => researchPerpsRisk({ ...x, entry: price(200, now - 120_000) }, now)).toThrow()
  })
})
