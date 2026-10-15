# HOXO milestones 1–7: implementation status

Updated: 15 October 2026

**Definition of status:** [x] means *implemented in the HOXO prototype repository*, not live, audited or mainnet deployed. Production requirements remain [ ].

## Milestone 1 — App foundation and Beldex wallet
- [x] React 18, TypeScript, Vite and responsive navigation
- [x] Public Beldex HF22 Privacy Token metadata discovery and exact token-ID lookup (no private wallet data)
- [x] Beldex wallet connection through `@bdxi/web3js`, user-approved native BDX TESTNET transfer flow, capped at 5 test BDX
- [x] Actual wallet total, unlocked BDX, network and scan height displayed in live Portfolio separately from fictitious demo balances; verify network/address before every testnet send, block mainnet sending
- [x] Defensive parsing of browser-local demo activity, balances, positions and pools
- [x] Testnet-only transfer UI, wallet-approval path and single-send SDK tests, restart-persistent unknown-outcome lock and wallet reconciliation
- [x] Wallet-approved testnet message signature and verification demonstration (not login)
- [x] Fail-closed Privacy Token adapter interfaces and exact integer amount units (no unsupported RPC calls)
- [ ] Funded **two-wallet** TESTNET transfer manually signed and receipt verified
- [ ] Official documented Privacy Token mint/balance/transfer API integrated, then issuance and transfer verified on testnet
- [ ] Settlement integration, real server infrastructure and audited chain adapters

## Milestone 2 — HOXO Swap
- [x] Simulated token quote, slippage and price-impact UX
- [x] Beldex-wallet-approved, verified off-chain Swap proposal signature (NOT a settled testnet trade)
- [x] Public Privacy Token testnet catalog/asset descriptor lookup (not wallet token transfers)
- [x] Mutable demo AMM pool reserves and minimum-output revalidation
- [x] Explicit fictional balances, local activity and trade limits
- [ ] Real verified Beldex on-chain liquidity, order authorisation and atomic settlement
- [ ] Reorg recovery, replay/idempotence protection and independent audit

## Milestone 3 — HOXO Perps
- [x] Simulated long/short BTC, ETH and BDX, isolated margin and P&L
- [x] Example liquidation threshold and payout handling on position close
- [x] Browser-demo max notional and 10× policy gate
- [ ] Real oracles, order matching, escrow, funding, mark prices, insurance fund
- [ ] On-chain liquidation, production accounting and independent audit

## Milestone 4 — HOXO Lend
- [x] Local supply, borrow, repay and withdrawal simulation
- [x] Beldex-wallet-approved, verified off-chain lending proposal signature (NOT a funded loan)
- [x] Read-only public testnet asset catalog alongside demo lending markets
- [x] Example fixed APRs, collateral LTV and health factor
- [x] 30-day projection and manual 1/7-day local interest accrual
- [x] Risk-reducing actions allowed even when account is undercollateralised
- [ ] Enforceable lending pool custody, interest indexes, oracle risk, liquidation and audit

## Milestone 5 — Cross-chain liquidity & routing
- [x] Offline comparison of local direct vs two-hop swap paths
- [x] 30s route expiration and immutable multi-leg demonstration accounting
- [x] No fake cross-chain execution, route quotes or wallet deposits for unsupported bridges
- [x] Chain integration matrix with trust and privacy notices
- [ ] Verify supported Beldex bridge contract addresses and integrate wallet-approved transfers
- [ ] Live external liquidity, routing trust assumptions, audited custody/refunds and reconciled settlements

## Milestone 6 — Security, protocol economics and audits
- [x] Session-only demo pause with risk-reducing action exceptions
- [x] Demonstration notional, leverage and borrowing caps
- [x] Hard-disabled live execution and documented release gates
- [x] Threat-model and incident-response documentation
- [x] Illustrative AMM fee accounting and proposed LP/protocol/treasury allocation model; no BDX buybacks or burns executed
- [x] CI typecheck, unit tests and static build
- [ ] Authenticated production pause, rate limiting, key custody and encrypted backup operations
- [ ] Independent smart contract, privacy and economic audits
- [ ] Fee revenue accounting and BDX buyback/burn **only if supported and approved** (not implemented)

## Milestone 7 — Mainnet preparation and phased launch
- [x] Launch-readiness screen showing explicit production blockers, real Beldex wallet network and scan height, and read-only public token registry / official-wallet registration instructions
- [x] Vite/Vercel research-preview configuration, noindex and security headers
- [x] Deployment, security and operations runbooks
- [ ] Funded two-wallet testnet BDX transfer verified; Privacy Token transfer integration; audited financial contract deployments
- [ ] End-to-end real-systems integration tests and bridge failure exercises
- [ ] Operational on-call coverage, incident drills and third-party risk review
- [ ] Relevant legal and regulatory assessment
- [ ] **Actual Beldex mainnet swap, perpetual and lending service launch**

## Why not claim seven live milestones?
Beldex's UTXO Privacy Tokens were announced on testnet on 6 October 2026, while EVM-compatible sidechain execution was described as planned for 2027. Privacy tokens and wallet approval alone do not imply programmable smart contracts, audited cross-chain swap settlement or enforceable lending/perps liquidations.

**HOXO has delivered an end-to-end testable research preview for workstreams M1–M7. Its financial protocol launch remains gated on missing infrastructure, audits and partner verifications.** Never deposit funds into a demonstration market.

References:
- https://beldex.io/blog/privacy-tokens-live-on-beldex-testnet
- https://www.beldex.io/blog/beldex-stealthex-ama-recap
- https://www.beldex.io/grants

Developer commands: `npm install`, `npm run typecheck`, `npm test`, `npm run build`.
