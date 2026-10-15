/**
 * Beldex Proto Privacy Tokens — integration CONTRACT, not an implementation.
 *
 * The published @bdxi/web3js v1.0.1 dapp method list has native BDX sends,
 * but no documented token issuance, token balance or Privacy Token transfer
 * method. Never guess RPC names or route asset sends through BDX methods.
 */
export type PrivacyAssetCapability = 'issue' | 'balance' | 'transfer' | 'status'
export type PrivacyAssetDescriptor = { assetId: string; symbol: string; decimals: number }
export type PrivacyAssetBalance = { assetId: string; unlockedAtomic: bigint }
export type PrivacyAssetReceipt = { assetId: string; txHash: string; status: 'wallet-submitted' | 'chain-confirmed' }
export type PrivacyAssetTransfer = {
  network: 'testnet'
  asset: PrivacyAssetDescriptor
  recipient: string
  amountAtomic: bigint
  idempotencyKey: string
}
/** Adapter MUST defer cryptographic signing to the user's approved wallet. */
export interface BeldexPrivacyAssetAdapter {
  readonly capabilities: ReadonlySet<PrivacyAssetCapability>
  issue(asset: Omit<PrivacyAssetDescriptor, 'assetId'>, supplyAtomic: bigint): Promise<PrivacyAssetReceipt>
  balance(asset: PrivacyAssetDescriptor): Promise<PrivacyAssetBalance>
  transfer(request: PrivacyAssetTransfer): Promise<PrivacyAssetReceipt>
  status(txHash: string): Promise<PrivacyAssetReceipt>
}
export const PRIVACY_ASSET_INTEGRATION = Object.freeze({
  protoHardforkHeight: 4_242_200,
  network: 'testnet',
  availableInPublishedWeb3Js: false,
  sdk: '@bdxi/web3js@1.0.1',
  documentation: 'https://www.beldex.io/blog/privacy-tokens-live-on-beldex-testnet',
  apiTracker: 'https://github.com/mushee-io/Hoxo-MM/issues/3',
})
const unimplemented = (): never => {
  throw new Error('Beldex Privacy Token API is not documented in the wallet SDK. No token transaction was submitted.')
}
export function unavailablePrivacyAssetAdapter(): BeldexPrivacyAssetAdapter {
  return {
    capabilities: new Set<PrivacyAssetCapability>(),
    issue: async () => unimplemented(),
    balance: async () => unimplemented(),
    transfer: async () => unimplemented(),
    status: async () => unimplemented(),
  }
}
/** Strict integer-only amounts; never convert Privacy Token balances via JS floats. */
export function privacyAssetAmountAtomic(input: string, decimals: number): bigint {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) throw new Error('Unsupported asset precision')
  if (typeof input !== 'string' || !/^\d+(?:\.\d+)?$/.test(input.trim())) throw new Error('Invalid asset amount')
  const [whole, fraction = ''] = input.trim().split('.')
  if (fraction.length > decimals) throw new Error('Token amount exceeds supported precision')
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, '0') || '0')
}
