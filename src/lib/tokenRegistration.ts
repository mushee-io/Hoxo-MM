import { hexTokenId, type PublicPrivacyToken } from './testnetCatalogue'
import { privacyAssetAmountAtomic } from './privacyAssetAdapter'

/** M9: Official-wallet registration review, NEVER an issuance RPC. */
export type RegistrationReview = Readonly<{
  network: 'beldex-testnet'
  name: string
  ticker: string
  decimals: number
  initialAtomic: bigint
  maximumAtomic: bigint
  execution: 'official-wallet-only'
}>
const TICKER = /^[A-Z][A-Z0-9]{1,11}$/
const NAME = /^[A-Za-z0-9][A-Za-z0-9 ._-]{2,63}$/
export function prepareRegistrationReview(draft: {
  ticker: string; name: string; decimals: number; initialSupply: string; maxSupply: string
}): RegistrationReview {
  if (!TICKER.test(draft.ticker) || !NAME.test(draft.name) ||
      !Number.isInteger(draft.decimals) || draft.decimals < 0 || draft.decimals > 18) {
    throw new Error('Invalid public token name, ticker or precision')
  }
  const initialAtomic = privacyAssetAmountAtomic(draft.initialSupply, draft.decimals)
  const maximumAtomic = privacyAssetAmountAtomic(draft.maxSupply, draft.decimals)
  if (initialAtomic > maximumAtomic || maximumAtomic <= 0n ||
      maximumAtomic.toString().length > 40) throw new Error('Invalid Privacy Token supply limits')
  return Object.freeze({ network: 'beldex-testnet', ticker: draft.ticker, name: draft.name,
    decimals: draft.decimals, initialAtomic, maximumAtomic, execution: 'official-wallet-only' })
}

/** Confirms only that public registry metadata matches the intended token. */
export function verifyRegisteredPublicDescriptor(
  review: RegistrationReview, token: PublicPrivacyToken,
): { match: boolean; reason: string } {
  if (!hexTokenId(token.tokenId)) return { match: false, reason: 'Invalid public token ID' }
  const match = token.ticker === review.ticker && token.name === review.name &&
    token.decimals === review.decimals &&
    token.maximumSupplyAtomic === review.maximumAtomic.toString() &&
    token.currentSupplyAtomic === review.initialAtomic.toString()
  return {
    match, reason: match ? 'Public token descriptor matches registration review; issuance finality and wallet ownership NOT verified'
      : 'Public token metadata differs from the reviewed registration parameters',
  }
}
