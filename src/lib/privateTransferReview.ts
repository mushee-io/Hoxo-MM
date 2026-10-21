import { checkAddress } from '@bdxi/web3js'
import { hexTokenId } from './testnetCatalogue'
import { privacyAssetAmountAtomic } from './privacyAssetAdapter'

/**
 * M10: prepare a review of a future Privacy Token transfer.
 * No supported wallet-facing token RPC exists; this function NEVER signs,
 * transfers, stores a key, or sends native BDX in its place.
 */
export type PreparedPrivateTransfer = Readonly<{
  network: 'beldex-testnet'
  assetId: string
  recipient: string
  amountAtomic: bigint
  state: 'awaiting-official-wallet-api'
}>
export function preparePrivateTransfer(draft: {
  network: string; assetId: string; recipient: string; amount: string; decimals: number
}): PreparedPrivateTransfer {
  if (draft.network !== 'beldex-testnet') throw new Error('Only Beldex testnet token review is supported')
  if (!hexTokenId(draft.assetId)) throw new Error('Invalid 64-character Privacy Token ID')
  if (draft.recipient !== draft.recipient.trim() || !checkAddress(draft.recipient).valid) {
    throw new Error('Invalid Beldex recipient address')
  }
  const amountAtomic = privacyAssetAmountAtomic(draft.amount, draft.decimals)
  if (amountAtomic <= 0n || amountAtomic.toString().length > 40) throw new Error('Private asset amount out of range')
  return Object.freeze({ network: 'beldex-testnet', assetId: draft.assetId.toLowerCase(),
    recipient: draft.recipient, amountAtomic, state: 'awaiting-official-wallet-api' })
}
export function requestPrivateTransferExecution(_review: PreparedPrivateTransfer): never {
  throw new Error('Privacy Token transfers cannot be submitted: Beldex public wallet dApp token methods are unavailable')
}
