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
const UUID_RE = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/
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

export type ParsedResearchIntent = Readonly<{
  kind: TestnetIntentKind
  wallet: string
  bdxAtomic: bigint
  desiredAsset?: string
  aprBps?: number
  nonce: string
  issuedAt: number
  expiresAt: number
}>

/**
 * Strict canonical parser for wallet-approved OFF-CHAIN research messages.
 * Parsing never verifies a wallet signature and never authorises settlement.
 * Unknown, duplicate, reordered or injected keys must fail closed.
 */
export function parseResearchIntent(message: unknown): ParsedResearchIntent | null {
  if (typeof message !== 'string' || message.length > 512 || message.length < 60) return null
  const parts = message.split(' ')
  if (parts.length !== 9 || parts[0] !== 'hoxo-intent-v1' || parts[1] !== 'chain=beldex-testnet') return null
  const rawKind = parts[2]
  if (rawKind !== 'kind=swap' && rawKind !== 'kind=lend') return null
  const kind: TestnetIntentKind = rawKind === 'kind=swap' ? 'swap' : 'lend'
  const fieldPrefixes = ['wallet=', 'bdxAtomic=', kind === 'swap' ? 'desired=' : 'aprBps=', 'nonce=', 'iat=', 'expires=']
  for (let i = 0; i < fieldPrefixes.length; i++) {
    if (!parts[i + 3].startsWith(fieldPrefixes[i])) return null
  }
  const wallet = parts[3].slice('wallet='.length)
  const atomicText = parts[4].slice('bdxAtomic='.length)
  const property = parts[5].slice(kind === 'swap' ? 'desired='.length : 'aprBps='.length)
  const nonce = parts[6].slice('nonce='.length)
  const iatText = parts[7].slice('iat='.length)
  const expText = parts[8].slice('expires='.length)
  if (!checkAddress(wallet).valid || !UUID_RE.test(nonce)) return null
  if (!/^[1-9]\d{0,9}$/.test(atomicText) ||
      !/^[1-9]\d{0,15}$/.test(iatText) || !/^[1-9]\d{0,15}$/.test(expText)) return null
  const atomic = BigInt(atomicText)
  if (atomic > MAX_AMOUNT_ATOMIC) return null
  const issuedAt = Number(iatText)
  const expiresAt = Number(expText)
  if (!Number.isSafeInteger(issuedAt) || !Number.isSafeInteger(expiresAt) ||
      expiresAt - issuedAt !== 300_000) return null
  if (kind === 'swap') {
    if (!ASSET_RE.test(property) || property === 'BDX') return null
    return { kind, wallet, bdxAtomic: atomic, desiredAsset: property, nonce, issuedAt, expiresAt }
  }
  if (!/^(0|[1-9]\d{0,4})$/.test(property)) return null
  const aprBps = Number(property)
  if (aprBps > 10_000) return null
  return { kind, wallet, bdxAtomic: atomic, aprBps, nonce, issuedAt, expiresAt }
}

export function verifyIntentAssociation(intent: SignedTestnetIntent, walletAddress: string, now: number): boolean {
  if (!Number.isSafeInteger(now) || now <= 0 || !intent.verified ||
      intent.walletAddress !== walletAddress || !intent.signature ||
      typeof intent.signature !== 'string') return false
  const parsed = parseResearchIntent(intent.message)
  return parsed !== null &&
    parsed.wallet === walletAddress &&
    parsed.kind === intent.kind &&
    parsed.issuedAt === intent.issuedAt &&
    now >= parsed.issuedAt && now <= parsed.expiresAt
}
