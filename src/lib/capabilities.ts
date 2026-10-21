/**
 * HOXO Milestone 1 — one runtime boundary for every financial capability.
 *
 * A browser simulation must never become a wallet or settlement operation by
 * changing a UI label, connecting a wallet, or setting an environment variable.
 * Only the explicitly supported BDX TESTNET wallet send may request transfer.
 * Actual asset exchange, collateral and derivatives remain unimplemented.
 */
export type CapabilityId =
  | 'wallet-bdx-read'
  | 'wallet-bdx-testnet-send'
  | 'wallet-testnet-signature'
  | 'privacy-token-public-registry'
  | 'demo-swap'
  | 'demo-perps'
  | 'demo-lend'
  | 'demo-routes'
  | 'privacy-token-wallet-balance'
  | 'privacy-token-issuance'
  | 'privacy-token-transfer'
  | 'swap-settlement'
  | 'perps-settlement'
  | 'lend-settlement'
  | 'bridge-settlement'

export type CapabilityOperation =
  | 'wallet-read'
  | 'native-testnet-send'
  | 'wallet-signature'
  | 'public-read'
  | 'simulation'
  | 'settlement'

export type CapabilityState = 'read-only' | 'testnet-wallet' | 'signed-proposal' | 'demo-only' | 'blocked'
export type CapabilityContext = Readonly<{
  network?: string | null
  walletConnected?: boolean
  unlockedAtomic?: bigint | null
  approximateBalance?: boolean
}>
export type CapabilityDefinition = Readonly<{
  id: CapabilityId
  label: string
  operation: CapabilityOperation
  state: CapabilityState
  boundary: string
  releaseBlocker?: string
}>

const definitions: readonly CapabilityDefinition[] = [
  { id: 'wallet-bdx-read', label: 'Native BDX wallet balances', operation: 'wallet-read', state: 'read-only', boundary: 'Wallet-authorised balance read only' },
  { id: 'wallet-bdx-testnet-send', label: 'Native BDX testnet send', operation: 'native-testnet-send', state: 'testnet-wallet', boundary: 'User-approved BDX-only transfer; not a swap. Requires a synced testnet wallet.', releaseBlocker: 'Funded two-wallet verification is still required.' },
  { id: 'wallet-testnet-signature', label: 'Testnet signed proposals', operation: 'wallet-signature', state: 'signed-proposal', boundary: 'Off-chain signature; no exchange, loan, collateral or login' },
  { id: 'privacy-token-public-registry', label: 'Public Privacy Token metadata', operation: 'public-read', state: 'read-only', boundary: 'Public metadata only; no personal balances or transaction signing' },
  { id: 'demo-swap', label: 'Browser swap simulator', operation: 'simulation', state: 'demo-only', boundary: 'Synthetic pools and synthetic account balances' },
  { id: 'demo-perps', label: 'Browser derivatives simulator', operation: 'simulation', state: 'demo-only', boundary: 'Local positions and artificial mark prices' },
  { id: 'demo-lend', label: 'Browser lending simulator', operation: 'simulation', state: 'demo-only', boundary: 'Local book; no collateral or yield custody' },
  { id: 'demo-routes', label: 'Browser routing simulator', operation: 'simulation', state: 'demo-only', boundary: 'Synthetic two-hop paths; never a bridge' },
  { id: 'privacy-token-wallet-balance', label: 'Private asset wallet balances', operation: 'settlement', state: 'blocked', boundary: 'No published supported dApp asset-balance bridge', releaseBlocker: 'Beldex-authorised per-origin private asset methods' },
  { id: 'privacy-token-issuance', label: 'Private token creation', operation: 'settlement', state: 'blocked', boundary: 'Official wallet-only issuance guidance; HOXO cannot issue', releaseBlocker: 'Supported wallet-dApp issuance method and independent testnet evidence' },
  { id: 'privacy-token-transfer', label: 'Private asset transfers', operation: 'settlement', state: 'blocked', boundary: 'Native BDX send must not be used as a Privacy Token transfer', releaseBlocker: 'Supported, reviewed private asset transfer SDK' },
  { id: 'swap-settlement', label: 'Real spot swap settlement', operation: 'settlement', state: 'blocked', boundary: 'Signed intent is not a trade', releaseBlocker: 'Real liquidity and safe two-sided settlement plus audits' },
  { id: 'perps-settlement', label: 'Real perpetual positions', operation: 'settlement', state: 'blocked', boundary: 'Local margin cannot be used as real collateral', releaseBlocker: 'Enforceable custody, oracle, liquidation and audited derivatives accounting' },
  { id: 'lend-settlement', label: 'Real borrowing and lending', operation: 'settlement', state: 'blocked', boundary: 'Local interest projection is not real debt or yield', releaseBlocker: 'Enforceable vault, repayment, oracle and liquidation' },
  { id: 'bridge-settlement', label: 'Real cross-chain bridge', operation: 'settlement', state: 'blocked', boundary: 'No verified bridge address, refund or custody', releaseBlocker: 'Verified deployed adapters and reviewed reconciliation' },
]

export const CAPABILITY_CATALOGUE: readonly CapabilityDefinition[] = Object.freeze(
  definitions.map(entry => Object.freeze(entry))
)
const byId: ReadonlyMap<CapabilityId, CapabilityDefinition> = new Map(
  CAPABILITY_CATALOGUE.map(entry => [entry.id, entry])
)

export function capabilityDefinition(id: CapabilityId): CapabilityDefinition {
  const definition = byId.get(id)
  if (!definition) throw new Error('Unknown HOXO capability')
  return definition
}

/** A present wallet does not imply a funded transfer was successfully verified. */
export function capabilityAvailability(
  id: CapabilityId,
  context: CapabilityContext = {},
): { available: boolean; explanation: string } {
  const definition = capabilityDefinition(id)
  if (definition.state === 'blocked') {
    return { available: false, explanation: definition.releaseBlocker ?? definition.boundary }
  }
  if (definition.operation === 'wallet-read') {
    return context.walletConnected && ['testnet', 'mainnet'].includes(context.network ?? '')
      ? { available: true, explanation: definition.boundary }
      : { available: false, explanation: 'Connect a supported Beldex wallet first' }
  }
  if (definition.operation === 'native-testnet-send') {
    return context.walletConnected && context.network === 'testnet' &&
      typeof context.unlockedAtomic === 'bigint' && context.unlockedAtomic >= 0n &&
      context.approximateBalance === false
      ? { available: true, explanation: definition.boundary + ' Funded E2E remains unverified.' }
      : { available: false, explanation: 'Requires an exact synced Beldex TESTNET wallet balance and explicit approval' }
  }
  if (definition.operation === 'wallet-signature') {
    return context.walletConnected && context.network === 'testnet'
      ? { available: true, explanation: definition.boundary }
      : { available: false, explanation: 'Connect a Beldex TESTNET wallet to sign an off-chain proposal' }
  }
  return { available: true, explanation: definition.boundary }
}

/**
 * Calls to this guard are required at the actual execution boundary, not only
 * in UI button disabling. Even a forged request for settlement fails closed.
 */
export function assertCapabilityOperation(
  id: CapabilityId,
  requested: CapabilityOperation,
  context: CapabilityContext = {},
): void {
  const definition = capabilityDefinition(id)
  // No production DeFi adapter exists. Never introduce a flag that flips this.
  if (requested === 'settlement' || definition.state === 'blocked' || definition.operation !== requested) {
    throw new Error('HOXO execution blocked: unsupported or mismatched financial capability')
  }
  if (!capabilityAvailability(id, context).available) {
    throw new Error('HOXO execution blocked: ' + capabilityAvailability(id, context).explanation)
  }
}

export const DEMO_CAPABILITIES = Object.freeze({
  swap: 'demo-swap',
  route: 'demo-routes',
  'open-perp': 'demo-perps',
  'close-perp': 'demo-perps',
  supply: 'demo-lend',
  withdraw: 'demo-lend',
  borrow: 'demo-lend',
  repay: 'demo-lend',
  accrue: 'demo-lend',
} as const)

export function assertDemoCapability(action: keyof typeof DEMO_CAPABILITIES): void {
  assertCapabilityOperation(DEMO_CAPABILITIES[action], 'simulation')
}
