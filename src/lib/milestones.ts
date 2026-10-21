/**
 * Release evidence tracker. Status reflects implemented and independently
 * verified behaviour, not task-count or UI completeness.
 */
export type MilestoneState = 'implemented' | 'partial' | 'blocked' | 'planned'
export type Milestone = Readonly<{
  number: number
  title: string
  state: MilestoneState
  evidence: string
  nextGate: string
}>
export const MILESTONES: readonly Milestone[] = Object.freeze([
  { number: 1, title: 'Architecture and capability safety', state: 'implemented', evidence: 'Typed capability catalogue, fail-closed execution guards, tests and audited module map', nextGate: 'Preserve enforcement in all future adapters' },
  { number: 2, title: 'Testnet services and infrastructure', state: 'partial', evidence: 'Static preview and public read-only health endpoint with upstream probe', nextGate: 'Durable backend storage, deployment monitoring, rate limiting and full E2E' },
  { number: 3, title: 'Beldex wallet integration', state: 'partial', evidence: 'BDX account read, testnet signatures, network change and disconnect guards', nextGate: 'Funded wallet/E2E evidence and server-bound authenticated sessions' },
  { number: 4, title: 'BDX testnet native transactions', state: 'partial', evidence: 'Bounded native SDK approval with exact units, testnet checks, preliminary fee buffer, same-wallet rejection and cross-tab lock', nextGate: 'Prove funded A-to-B transfer and independently confirm receipt' },
  { number: 5, title: 'Native transaction recovery', state: 'partial', evidence: 'Persistent fail-closed unknown-outcome guard, idempotency key, browser-wide approval lock and same-account status lookup', nextGate: 'Full restart and network-failure fault testing with wallet evidence' },
  { number: 6, title: 'Public Privacy Token registry', state: 'partial', evidence: 'Public token metadata catalogue, strict exact-ID response envelope, duplicate rejection and browser-only metadata bookmarks', nextGate: 'Production endpoint smoke tests and upstream token data validation' },
  { number: 7, title: 'Privacy Token wallet-dApp SDK', state: 'blocked', evidence: 'Official v1 method audit, typed private-asset adapter interface and tested refusal of unsupported key-bearing RPC', nextGate: 'Official documented, reviewed confidential asset dApp API from Beldex' },
  { number: 8, title: 'Real private-asset portfolio', state: 'blocked', evidence: 'Actual wallet-authorised native BDX snapshot, isolated demo portfolio and public-only bookmarked token IDs', nextGate: 'Wallet-authorised token balance method that retains keys within extension' },
  { number: 9, title: 'Token issuance and registration', state: 'partial', evidence: 'Official-wallet registration guide and token-ID verification', nextGate: 'Supported dApp issuance or verified manual-wallet testnet registration' },
  { number: 10, title: 'Private-asset transfers', state: 'blocked', evidence: 'Exact asset amount adapter contract only', nextGate: 'Published authorised token-send SDK and funded two-wallet evidence' },
  { number: 11, title: 'Safe research trade intents', state: 'partial', evidence: 'Wallet signatures and canonical strict, expiring off-chain proposal parser', nextGate: 'Persistent replay-resistant server order lifecycle and external review' },
  { number: 12, title: 'Real liquidity and RFQ quotes', state: 'planned', evidence: 'Browser-only constant-product illustrative pools', nextGate: 'Verified liquidity counterparty and authenticated executable quote' },
  { number: 13, title: 'Atomic or reviewed swap settlement', state: 'blocked', evidence: 'Live settlement permanently hard-disabled', nextGate: 'Proven two-sided asset custody, settlement, refunds and audit' },
  { number: 14, title: 'Executable HOXO Swap', state: 'blocked', evidence: 'UX and demonstration pool only', nextGate: 'Complete M10, M12 and M13 and two-wallet swap proof' },
  { number: 15, title: 'Enforceable lending collateral', state: 'blocked', evidence: 'Integer-only research collateral risk calculator; no vault or custody', nextGate: 'Real supported vault/escrow with collateral conservation' },
  { number: 16, title: 'Real lending market', state: 'blocked', evidence: 'Browser ledger and signed non-executable loan proposals', nextGate: 'Verified supply-borrow-repay-withdraw and debt accounting' },
  { number: 17, title: 'Independent oracles and liquidation', state: 'blocked', evidence: 'Staleness-checked research price fixtures, no authenticated oracle or liquidator', nextGate: 'Verifiable live oracle, liquidation engine and insolvency protections' },
  { number: 18, title: 'Perpetuals matching and margin', state: 'blocked', evidence: 'Browser positions and integer-only research risk calculator', nextGate: 'Audited margin escrow, price/funding feeds and forced liquidation' },
  { number: 19, title: 'Cross-chain settlement routing', state: 'blocked', evidence: 'Pure local two-hop route preview and documented bridge trust matrix', nextGate: 'Verified deployed adapters, chain receipts and refund/timeout model' },
  { number: 20, title: 'External audits and operational launch', state: 'partial', evidence: 'CI test/build, security docs, explicit research preview and release gates', nextGate: 'Independent audits, incident response exercises and protocol-level enforcement' },
].map(m => Object.freeze(m as Milestone)))

export function milestoneOverview() {
  const completed = MILESTONES.filter(x => x.state === 'implemented').length
  const blocked = MILESTONES.filter(x => x.state === 'blocked').length
  return { total: MILESTONES.length, completed, blocked, unfinished: MILESTONES.length - completed, testnetDeFiLaunched: false as const }
}
