# HOXO milestones 1–7: implementation status

Updated: 15 October 2026

**Definition of status:** [x] means *implemented in the HOXO prototype repository*, not live, audited or mainnet deployed. Production requirements remain [ ].

## Milestone 1 — App foundation and Beldex wallet
- [x] React 18, TypeScript, Vite and responsive navigation
- [x] Read-only authorised BDX wallet connection through `@bdxi/web3js`
- [x] Read-only wallet state kept separate from fictitious demo balances
- [x] Defensive parsing of browser-local demo activity, balances, positions and pools
- [ ] Verified privacy-token issuance and transfer on testnet
- [ ] Settlement integration, real server infrastructure and audited chain adapters

## Milestone 2 — HOXO Swap
- [x] Simulated token quote, slippage and price-impact UX
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
- [x] Launch-readiness screen showing explicit production blockers
- [x] Vite/Vercel research-preview configuration, noindex and security headers
- [x] Deployment, security and operations runbooks
- [ ] Verified testnet transfers and audited financial contract deployments
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
