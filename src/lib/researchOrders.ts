import { parseResearchIntent, verifyIntentAssociation, type SignedTestnetIntent, type TestnetIntentKind } from './testnetIntents'

/**
 * M11 off-chain-only, memory-resident, replay-aware research order lifecycle.
 * This is NOT a market order book, transactional database, authentication,
 * escrow or settlement mechanism; all monetary execution is unavailable.
 */
export type ResearchOrderStatus = 'signed' | 'cancelled' | 'expired'
export type ResearchOrder = Readonly<{
  id: string
  kind: TestnetIntentKind
  owner: string
  assetSymbol?: string
  aprBps?: number
  inputAtomic: bigint
  issuedAt: number
  expiresAt: number
  status: ResearchOrderStatus
  settlement: 'disabled'
}>
const newState = (record: ResearchOrder, status: ResearchOrderStatus): ResearchOrder =>
  Object.freeze({ ...record, status })

export class ResearchOrderLedger {
  private readonly orders = new Map<string, ResearchOrder>()
  private readonly consumed = new Set<string>()

  /**
   * Call ONLY after successful wallet.verifyMessage() (as in the HOXO wallet
   * hook). 'verified' is an in-memory flag, not a server-valid login token.
   */
  addWalletSignedProposal(intent: SignedTestnetIntent, account: string, now: number): ResearchOrder {
    if (!verifyIntentAssociation(intent, account, now)) throw new Error('Invalid, expired or unverified wallet research intent')
    const parsed = parseResearchIntent(intent.message)
    if (!parsed) throw new Error('Unrecognised signed research intent')
    const id = parsed.nonce
    if (this.consumed.has(id)) throw new Error('Research order nonce already consumed')
    const order: ResearchOrder = Object.freeze({
      id, kind: parsed.kind, owner: parsed.wallet,
      assetSymbol: parsed.desiredAsset, aprBps: parsed.aprBps,
      inputAtomic: parsed.bdxAtomic,
      issuedAt: parsed.issuedAt, expiresAt: parsed.expiresAt,
      status: 'signed', settlement: 'disabled',
    })
    this.orders.set(id, order)
    this.consumed.add(id)
    return order
  }
  get(id: string, now: number): ResearchOrder | null {
    const current = this.orders.get(id)
    if (!current) return null
    if (!Number.isSafeInteger(now) || now <= 0) throw new Error('Invalid research observation time')
    if (current.status === 'signed' && now > current.expiresAt) {
      const expired = newState(current, 'expired')
      this.orders.set(id, expired)
      return expired
    }
    return current
  }
  cancel(id: string, owner: string, now: number): ResearchOrder {
    const current = this.get(id, now)
    if (!current || current.owner !== owner || current.status !== 'signed') {
      throw new Error('Research order cannot be cancelled')
    }
    const cancelled = newState(current, 'cancelled')
    this.orders.set(id, cancelled)
    return cancelled
  }
  /** Deliberately provides NO fill / settle method. */
  assertNoExecution(): never {
    throw new Error('Research order ledger is off-chain and can never settle assets')
  }
  count(): number { return this.orders.size }
}
