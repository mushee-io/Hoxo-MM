import { type InspectedRfq } from './researchRfq'
import { hexTokenId } from './testnetCatalogue'

export type SpotResearchStatus = 'reviewed' | 'cancelled' | 'expired'
export type SpotResearchTicket = Readonly<{
  quoteId: string
  wallet: string
  fromAssetId: string
  toAssetId: string
  amountInAtomic: bigint
  quotedOutAtomic: bigint
  minOutAtomic: bigint
  expiresAtMs: number
  state: SpotResearchStatus
  settlement: 'disabled'
}>

/** M11–M14: in-memory, wallet-bound RESEARCH tickets. Not a real orderbook. */
export class SpotResearchBook {
  private tickets = new Map<string, SpotResearchTicket>()
  private usedQuotes = new Set<string>()
  create(wallet: string, quote: InspectedRfq, now: number): SpotResearchTicket {
    if (!wallet || wallet.length > 128 || /[<>\s]/.test(wallet)) throw new Error('Invalid wallet identifier')
    if (!Number.isSafeInteger(now) || now <= 0 || now >= quote.expiresAtMs ||
        quote.execution !== 'unavailable' || this.usedQuotes.has(quote.quoteId) ||
        !hexTokenId(quote.fromAssetId) || !hexTokenId(quote.toAssetId) ||
        quote.fromAssetId === quote.toAssetId ||
        quote.minimumOutAtomic <= 0n || quote.amountInAtomic <= 0n ||
        quote.minimumOutAtomic > quote.expectedOutAtomic) {
      throw new Error('Expired, repeated or unsafe research RFQ')
    }
    const ticket: SpotResearchTicket = Object.freeze({
      quoteId: quote.quoteId, wallet,
      fromAssetId: quote.fromAssetId, toAssetId: quote.toAssetId,
      amountInAtomic: quote.amountInAtomic, quotedOutAtomic: quote.expectedOutAtomic,
      minOutAtomic: quote.minimumOutAtomic, expiresAtMs: quote.expiresAtMs,
      state: 'reviewed', settlement: 'disabled',
    })
    this.tickets.set(quote.quoteId, ticket)
    this.usedQuotes.add(quote.quoteId)
    return ticket
  }
  get(quoteId: string, now: number): SpotResearchTicket | null {
    const current = this.tickets.get(quoteId)
    if (!current) return null
    if (!Number.isSafeInteger(now) || now <= 0) throw new Error('Invalid observation time')
    if (current.state === 'reviewed' && now >= current.expiresAtMs) {
      const expired = Object.freeze({ ...current, state: 'expired' as const })
      this.tickets.set(quoteId, expired)
      return expired
    }
    return current
  }
  cancel(quoteId: string, wallet: string, now: number): SpotResearchTicket {
    const previous = this.get(quoteId, now)
    if (!previous || previous.wallet !== wallet || previous.state !== 'reviewed') throw new Error('Ticket cannot be cancelled')
    const cancelled = Object.freeze({ ...previous, state: 'cancelled' as const })
    this.tickets.set(quoteId, cancelled)
    return cancelled
  }
  settle(_quoteId: string): never {
    throw new Error('HOXO has no safe two-sided testnet swap settlement; research ticket cannot execute')
  }
}

/** Only compares same-asset-pair quotes with the same amount; no fake market prices. */
export function rankComparableResearchQuotes(quotes: readonly InspectedRfq[], now: number): InspectedRfq[] {
  if (!Number.isSafeInteger(now) || now <= 0) throw new Error('Invalid quote time')
  if (!quotes.length) return []
  const first = quotes[0]
  if (quotes.some(q => q.network !== 'beldex-testnet' || q.execution !== 'unavailable' ||
    q.expiresAtMs <= now || q.fromAssetId !== first.fromAssetId ||
    q.toAssetId !== first.toAssetId || q.amountInAtomic !== first.amountInAtomic ||
    q.minimumOutAtomic <= 0n || q.minimumOutAtomic > q.expectedOutAtomic)) {
    throw new Error('Cannot rank stale or incomparable research RFQs')
  }
  if (new Set(quotes.map(q => q.quoteId)).size !== quotes.length) throw new Error('Duplicate quote identifier')
  return [...quotes].sort((a,b) => a.expectedOutAtomic > b.expectedOutAtomic ? -1 : a.expectedOutAtomic < b.expectedOutAtomic ? 1 : a.quoteId.localeCompare(b.quoteId))
}

/**
 * M13 atomic conservation RESEARCH fixture.
 * Two parties exchange virtual tokens inside one pure JS calculation; NO
 * signing, custody, wallet RPC, transaction hashes or chain confirmations.
 */
export type FictionalSpotBalances = Readonly<Record<string, bigint>>
export type FictionalSpotParties = Readonly<{ taker: FictionalSpotBalances; maker: FictionalSpotBalances }>
export function simulateResearchAtomicSwap(
  balances: FictionalSpotParties,
  quote: InspectedRfq,
  receivedOutAtomic: bigint,
  now: number,
): { balances: FictionalSpotParties; outputAtomic: bigint; settlement: 'simulated-only' } {
  if (!Number.isSafeInteger(now) || now<=0 || typeof receivedOutAtomic!=='bigint' ||
      quote.execution !== 'unavailable' || quote.network !== 'beldex-testnet' ||
      !hexTokenId(quote.fromAssetId) || !hexTokenId(quote.toAssetId) ||
      quote.fromAssetId === quote.toAssetId || quote.expiresAtMs <= now ||
      quote.amountInAtomic <= 0n || quote.minimumOutAtomic <= 0n ||
      quote.minimumOutAtomic > quote.expectedOutAtomic ||
      receivedOutAtomic < quote.minimumOutAtomic || receivedOutAtomic > quote.expectedOutAtomic) {
    throw new Error('Research swap quote expired or minimum output violated')
  }
  const a = quote.fromAssetId, b = quote.toAssetId
  const takerIn = balances.taker[a] ?? 0n
  const takerOut = balances.taker[b] ?? 0n
  const makerIn = balances.maker[a] ?? 0n
  const makerOut = balances.maker[b] ?? 0n
  if ([takerIn,takerOut,makerIn,makerOut].some(v => typeof v !== 'bigint' || v < 0n)) {
    throw new Error('Research balances cannot be negative')
  }
  if (takerIn < quote.amountInAtomic || makerOut < receivedOutAtomic) throw new Error('Insufficient fictitious counterparty reserves')
  const nextTaker = { ...balances.taker, [a]: takerIn - quote.amountInAtomic, [b]: takerOut + receivedOutAtomic }
  const nextMaker = { ...balances.maker, [a]: makerIn + quote.amountInAtomic, [b]: makerOut - receivedOutAtomic }
  if (nextTaker[a]+nextMaker[a] !== takerIn+makerIn ||
      nextTaker[b]+nextMaker[b] !== takerOut+makerOut) throw new Error('Conservation invariant failed')
  return { balances: { taker: nextTaker, maker: nextMaker }, outputAtomic: receivedOutAtomic, settlement: 'simulated-only' }
}
