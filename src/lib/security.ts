import { validAmount } from './markets'
import { assertDemoCapability } from './capabilities'

/** Browser-only simulation guardrails. These are not server-side or on-chain controls. */
export const POLICY = Object.freeze({
  maxSwapUsd: 10_000,
  maxPerpNotionalUsd: 25_000,
  maxLeverage: 10,
  maxNewBorrowUsd: 5_000,
})
export type DemoAction = 'swap' | 'route' | 'open-perp' | 'close-perp' | 'supply' | 'withdraw' | 'borrow' | 'repay' | 'accrue'
export type DemoPolicyState = { paused: boolean }
export const defaultDemoPolicy = (): DemoPolicyState => ({ paused: false })

/** Renders may be public; never imply browser controls offer production security. */
export const LIVE_SETTLEMENT_ENABLED = false
export function assertLiveSettlementEnabled(): never {
  throw new Error('HOXO live settlement is disabled pending audited Beldex infrastructure')
}

export function assertDemoOperation(
  action: DemoAction,
  state: DemoPolicyState,
  usdValue: number,
  leverage?: number,
): void {
  assertDemoCapability(action)
  if (!Number.isFinite(usdValue) || usdValue < 0) throw new Error('Invalid order or collateral value')
  // Always permit risk-reducing actions during a simulated pause. Do not lock
  // users out of closing positions or repaying debt.
  const riskIncreasing: DemoAction[] = ['swap', 'route', 'open-perp', 'withdraw', 'borrow']
  if (state.paused && riskIncreasing.includes(action)) throw new Error('New demo risk actions are paused')
  if ((action === 'swap' || action === 'route') && (!validAmount(usdValue) || usdValue > POLICY.maxSwapUsd)) {
    throw new Error('Demo swap limit is $10,000')
  }
  if (action === 'open-perp' && (!validAmount(usdValue) || usdValue > POLICY.maxPerpNotionalUsd ||
      !Number.isInteger(leverage) || leverage! < 1 || leverage! > POLICY.maxLeverage)) {
    throw new Error('Demo perps limit is $25,000 notional and 10x leverage')
  }
  if (action === 'borrow' && (!validAmount(usdValue) || usdValue > POLICY.maxNewBorrowUsd)) {
    throw new Error('Demo borrowing cap is $5,000 per action')
  }
}
