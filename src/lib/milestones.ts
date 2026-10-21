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
  { number: 9, title: 'Token issuance and registration', state: 'partial', evidence: 'Official-wallet registration guide, exact BigInt supply review, descriptor-matching and public token-ID verification', nextGate: 'Supported dApp issuance or verified manual-wallet testnet registration' },
  { number: 10, title: 'Private-asset transfers', state: 'blocked', evidence: 'Strict Privacy Token transfer preparation and disabled execution path, no fabricated wallet RPC', nextGate: 'Published authorised token-send SDK and funded two-wallet evidence' },
  { number: 11, title: 'Safe research trade intents', state: 'partial', evidence: 'Wallet-signed expiring proposals, research order book with cancellation and replay guards', nextGate: 'Persistent replay-resistant server order lifecycle and external review' },
  { number: 12, title: 'Real liquidity and RFQ quotes', state: 'partial', evidence: 'Browser-only pools, bounded research RFQ inspection, expiry checks and comparable quote ranking', nextGate: 'Verified liquidity counterparty and authenticated executable quote' },
  { number: 13, title: 'Atomic or reviewed swap settlement', state: 'blocked', evidence: 'Pure two-party conservation-tested atomic research fixture; actual onchain settlement hard-disabled', nextGate: 'Proven two-sided asset custody, settlement, refunds and audit' },
  { number: 14, title: 'Executable HOXO Swap', state: 'blocked', evidence: 'Swap UX plus quote review, research order lifecycle and offline two-sided clearing simulation; real execution disabled', nextGate: 'Complete M10, M12 and M13 and two-wallet swap proof' },
  { number: 15, title: 'Enforceable lending collateral', state: 'blocked', evidence: 'BigInt multi-account conservation-checked research collateral and lending vault; no real custody', nextGate: 'Real supported vault/escrow with collateral conservation' },
  { number: 16, title: 'Real lending market', state: 'blocked', evidence: 'Research supply, withdraw, borrow, repay and deterministic debt interest transitions in a virtual ledger', nextGate: 'Verified supply-borrow-repay-withdraw and debt accounting' },
  { number: 17, title: 'Independent oracles and liquidation', state: 'blocked', evidence: 'Three-source fixture median with freshness/deviation checks and cap-limited virtual liquidations; no authenticated feed', nextGate: 'Verifiable live oracle, liquidation engine and insolvency protections' },
  { number: 18, title: 'Perpetuals matching and margin', state: 'blocked', evidence: 'Matched zero-sum BigInt paper positions, isolated margin, virtual funding and expiry-safe P&L checks; no real custody', nextGate: 'Audited margin escrow, price/funding feeds and forced liquidation' },
  { number: 19, title: 'Cross-chain settlement routing', state: 'blocked', evidence: 'Fail-closed cross-chain route matrix, note-only bridge incident state machine and refund/timeout research guards', nextGate: 'Verified deployed adapters, chain receipts and refund/timeout model' },
  { number: 20, title: 'External audits and operational launch', state: 'partial', evidence: 'CI security audit/build/tests, immutable safety gates and interactive code/manual checkbox tracker; external audit pending', nextGate: 'Independent audits, incident response exercises and protocol-level enforcement' },
].map(m => Object.freeze(m as Milestone)))

export function milestoneOverview() {
  const completed = MILESTONES.filter(x => x.state === 'implemented').length
  const blocked = MILESTONES.filter(x => x.state === 'blocked').length
  return { total: MILESTONES.length, completed, blocked, unfinished: MILESTONES.length - completed, testnetDeFiLaunched: false as const }
}
