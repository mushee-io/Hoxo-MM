import { checkAddress, toAtomic } from '@bdxi/web3js'

/**
 * Intent signatures are REAL TESTNET wallet signatures, but NOT on-chain
 * orders, escrow, enforceable debt, asset transfers, quotes or settlements.
 * Never accept them as authority to debit assets or authenticate a service.
 */
export type TestnetIntentKind = 'swap' | 'lend'
export type IntentDraft = {
  kind: TestnetIntentKind
  amount: string
  desiredAsset?: string
  aprBps?: number
}
export type SignedTestnetIntent = {
  kind: TestnetIntentKind
  message: string
  signature: string
  verified: true
  walletAddress: string
  issuedAt: number
}
const MAX_AMOUNT_ATOMIC = 5_000_000_000n
const UUID_RE = /^[a-f0-9-]{36}$/
const ASSET_RE = /^[A-Z][A-Z0-9_]{1,19}$/
export function buildTestnetIntent(
  walletAddress: string,
  draft: IntentDraft,
  nonce: string,
  issuedAt: number,
): string {
  if (!checkAddress(walletAddress).valid) throw new Error('Invalid testnet wallet address')
  if (!UUID_RE.test(nonce)) throw new Error('Invalid quote identifier')
  if (!Number.isSafeInteger(issuedAt) || issuedAt <= 0) throw new Error('Invalid intent timestamp')
  if (!/^\d+(?:\.\d{1,9})?$/.test(draft.amount)) throw new Error('Use an exact BDX amount (up to nine decimals)')
  const atomic = toAtomic(draft.amount)
  if (atomic <= 0n || atomic > MAX_AMOUNT_ATOMIC) throw new Error('Research intent range: 0 to 5 test BDX')
  const fields = [
    'hoxo-intent-v1', 'chain=beldex-testnet',
    'kind=' + draft.kind,
    'wallet=' + walletAddress,
    'bdxAtomic=' + atomic.toString(),
  ]
  if (draft.kind === 'swap') {
    const desired = draft.desiredAsset ?? ''
    if (!ASSET_RE.test(desired) || desired === 'BDX') throw new Error('Choose a proposed non-BDX asset symbol')
    fields.push('desired=' + desired)
  } else if (draft.kind === 'lend') {
    const bps = draft.aprBps
    if (!Number.isInteger(bps) || bps! < 0 || bps! > 10_000) throw new Error('APR must be between 0 and 100%')
    fields.push('aprBps=' + bps)
  } else throw new Error('Unsupported intent type')
  fields.push('nonce=' + nonce, 'iat=' + issuedAt, 'expires=' + (issuedAt + 300_000))
  const message = fields.join(' ')
  if (message.length > 512) throw new Error('Intent exceeds wallet signing limit')
  return message
}
export function verifyIntentAssociation(intent: SignedTestnetIntent, walletAddress: string, now: number): boolean {
  if (!Number.isSafeInteger(now) || now < 0) return false
  if (!intent.verified || intent.walletAddress !== walletAddress || !intent.signature) return false
  const parts = intent.message.split(' ')
  const fields = Object.fromEntries(parts.slice(1).map(s => s.split('=')))
  return parts[0] === 'hoxo-intent-v1' &&
    fields.chain === 'beldex-testnet' &&
    fields.wallet === walletAddress &&
    fields.kind === intent.kind &&
    Number(fields.iat) === intent.issuedAt &&
    Number.isSafeInteger(Number(fields.expires)) &&
    now <= Number(fields.expires) && now >= intent.issuedAt
}
