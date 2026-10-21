/**
 * HOXO M15–M18: deterministic, integer-only RESEARCH risk calculations.
 *
 * Not a protocol oracle, vault, liquidator, clearinghouse, settlement engine
 * or authority to move funds. All price inputs are caller-supplied fixtures.
 * Never enable a live operation on the strength of these outputs.
 */
export type ResearchPrice = Readonly<{
  priceUsdE8: bigint
  observedAtMs: number
  source: 'research-fixture'
}>
export type CollateralResearchInput = Readonly<{
  amountAtomic: bigint
  decimals: number
  price: ResearchPrice
  debtUsdE8: bigint
  maxLtvBps: number
  liquidationLtvBps: number
}>
export type CollateralResearchResult = Readonly<{
  collateralUsdE8: bigint
  maximumDebtUsdE8: bigint
  borrowingHeadroomUsdE8: bigint
  liquidationThresholdUsdE8: bigint
  healthFactorBps: bigint | null
  liquidatable: boolean
  execution: 'research-only'
}>
export type PerpsResearchInput = Readonly<{
  marginUsdE8: bigint
  leverage: number
  side: 'long' | 'short'
  entry: ResearchPrice
  mark: ResearchPrice
  maintenanceBps: number
}>
export type PerpsResearchResult = Readonly<{
  notionalUsdE8: bigint
  pnlUsdE8: bigint
  equityUsdE8: bigint
  maintenanceUsdE8: bigint
  liquidatable: boolean
  execution: 'research-only'
}>

export function assertResearchPrice(price: ResearchPrice, nowMs: number, maxAgeMs = 60_000): void {
  if (price.source !== 'research-fixture' ||
      typeof price.priceUsdE8 !== 'bigint' || price.priceUsdE8 <= 0n ||
      !Number.isSafeInteger(price.observedAtMs) || price.observedAtMs <= 0 ||
      !Number.isSafeInteger(nowMs) || nowMs <= 0 ||
      !Number.isSafeInteger(maxAgeMs) || maxAgeMs < 0 ||
      price.observedAtMs > nowMs || nowMs - price.observedAtMs > maxAgeMs) {
    throw new Error('Research price missing, stale, unsupported or from the future')
  }
}
const validBps = (value: number) => Number.isInteger(value) && value >= 0 && value <= 10_000
function nonnegativeAtomic(value: bigint): void {
  if (typeof value !== 'bigint' || value < 0n) throw new Error('Expected nonnegative exact integer amount')
}
export function researchCollateralRisk(
  input: CollateralResearchInput,
  nowMs: number,
): CollateralResearchResult {
  assertResearchPrice(input.price, nowMs)
  nonnegativeAtomic(input.amountAtomic)
  nonnegativeAtomic(input.debtUsdE8)
  if (!Number.isInteger(input.decimals) || input.decimals < 0 || input.decimals > 18) {
    throw new Error('Invalid collateral asset precision')
  }
  if (!validBps(input.maxLtvBps) || !validBps(input.liquidationLtvBps) ||
      input.maxLtvBps >= input.liquidationLtvBps) throw new Error('Invalid collateral risk policy')
  const collateralUsdE8 = input.amountAtomic * input.price.priceUsdE8 / (10n ** BigInt(input.decimals))
  const maximumDebtUsdE8 = collateralUsdE8 * BigInt(input.maxLtvBps) / 10_000n
  const liquidationThresholdUsdE8 = collateralUsdE8 * BigInt(input.liquidationLtvBps) / 10_000n
  const borrowingHeadroomUsdE8 = maximumDebtUsdE8 > input.debtUsdE8 ? maximumDebtUsdE8 - input.debtUsdE8 : 0n
  const healthFactorBps = input.debtUsdE8 === 0n ? null :
    liquidationThresholdUsdE8 * 10_000n / input.debtUsdE8
  return {
    collateralUsdE8, maximumDebtUsdE8, borrowingHeadroomUsdE8,
    liquidationThresholdUsdE8, healthFactorBps,
    liquidatable: input.debtUsdE8 > 0n && input.debtUsdE8 >= liquidationThresholdUsdE8,
    execution: 'research-only',
  }
}
export function researchPerpsRisk(input: PerpsResearchInput, nowMs: number): PerpsResearchResult {
  assertResearchPrice(input.entry, nowMs)
  assertResearchPrice(input.mark, nowMs)
  nonnegativeAtomic(input.marginUsdE8)
  if (!Number.isInteger(input.leverage) || input.leverage < 1 || input.leverage > 10 ||
      (input.side !== 'long' && input.side !== 'short') ||
      !validBps(input.maintenanceBps) || input.maintenanceBps === 0) {
    throw new Error('Invalid research perpetual position settings')
  }
  const notionalUsdE8 = input.marginUsdE8 * BigInt(input.leverage)
  const delta = input.mark.priceUsdE8 - input.entry.priceUsdE8
  const signedDelta = input.side === 'long' ? delta : -delta
  const pnlUsdE8 = notionalUsdE8 * signedDelta / input.entry.priceUsdE8
  const equityUsdE8 = input.marginUsdE8 + pnlUsdE8
  const maintenanceUsdE8 = notionalUsdE8 * BigInt(input.maintenanceBps) / 10_000n
  return { notionalUsdE8, pnlUsdE8, equityUsdE8, maintenanceUsdE8,
    liquidatable: equityUsdE8 <= maintenanceUsdE8,
    execution: 'research-only' }
}
