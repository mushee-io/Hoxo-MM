import { hexTokenId } from './testnetCatalogue'

/**
 * M12 quote *inspection* contract. HOXO has no approved market maker and no
 * atomic exchange protocol. Never use this result to send an asset transfer.
 * Quotes here are untrusted/unsettleable drafts, not executable orders.
 */
export type RfqDraft = Readonly<{
  network: 'beldex-testnet'
  quoteId: string
  makerLabel: string
  fromAssetId: string
  toAssetId: string
  amountInAtomic: string
  expectedOutAtomic: string
  minimumOutAtomic: string
  expiresAtMs: number
}>
export type InspectedRfq = Readonly<{
  network: 'beldex-testnet'
  quoteId: string
  makerLabel: string
  fromAssetId: string
  toAssetId: string
  amountInAtomic: bigint
  expectedOutAtomic: bigint
  minimumOutAtomic: bigint
  expiresAtMs: number
  execution: 'unavailable'
  reason: string
}>
const INTEGER = /^[1-9]\d{0,39}$/
const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/
const MAKER = /^[A-Za-z0-9 _.-]{2,48}$/
const MAX_LIFETIME_MS = 60_000

/** Refuse malformed, stale, oversized, duplicate-asset or non-testnet drafts. */
export function inspectRfqDraft(raw: unknown, nowMs: number): InspectedRfq {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) ||
      !Number.isSafeInteger(nowMs) || nowMs <= 0) throw new Error('Malformed research quote')
  const quote = raw as Partial<RfqDraft>
  if (quote.network !== 'beldex-testnet' || !UUID.test(quote.quoteId ?? '') ||
      !MAKER.test(quote.makerLabel ?? '') ||
      !hexTokenId(quote.fromAssetId) || !hexTokenId(quote.toAssetId) ||
      quote.fromAssetId.toLowerCase() === quote.toAssetId.toLowerCase()) {
    throw new Error('Unsupported network, maker or asset identifiers')
  }
  if (!INTEGER.test(quote.amountInAtomic ?? '') || !INTEGER.test(quote.expectedOutAtomic ?? '') ||
      !INTEGER.test(quote.minimumOutAtomic ?? '')) throw new Error('Quote amounts must be positive exact atomic integers')
  if (BigInt(quote.minimumOutAtomic!) > BigInt(quote.expectedOutAtomic!)) {
    throw new Error('Minimum output exceeds quoted output')
  }
  if (!Number.isSafeInteger(quote.expiresAtMs) || quote.expiresAtMs! <= nowMs ||
      quote.expiresAtMs! - nowMs > MAX_LIFETIME_MS) throw new Error('Quote expired or unbounded')
  return {
    network: 'beldex-testnet', quoteId: quote.quoteId!, makerLabel: quote.makerLabel!,
    fromAssetId: quote.fromAssetId.toLowerCase(), toAssetId: quote.toAssetId.toLowerCase(),
    amountInAtomic: BigInt(quote.amountInAtomic!),
    expectedOutAtomic: BigInt(quote.expectedOutAtomic!),
    minimumOutAtomic: BigInt(quote.minimumOutAtomic!),
    expiresAtMs: quote.expiresAtMs!,
    execution: 'unavailable',
    reason: 'Quote is an unauthenticated research draft: no verified maker, liquidity, signed approval or two-sided settlement.',
  }
}
export function refuseUnverifiedRfqExecution(_quote: InspectedRfq): never {
  throw new Error('HOXO research RFQ cannot transfer funds or settle an exchange')
}
