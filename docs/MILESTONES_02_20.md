# HOXO-MM — Milestones 2–20 development tracking

**Status date:** 21 October 2026  
**Source of truth:** \`src/lib/milestones.ts\`, reflected in HOXO → Launch.

This is a continuously *versioned code status*, **not an assertion that all 20 financial protocols are finished**. M1 is implemented. For later milestones, the implementation, blockers and gates must be recorded as code and externally confirmed evidence evolve.

## Execution architecture

1. **Frontend:** React/Vite HOXO public page and research workspace.
2. **Official Beldex wallet boundary:** User-approved native BDX balance and testnet transfers, wallet message signatures. Website cannot access keys.
3. **Public API boundary:** Vercel functions \`/api/testnet-tokens\`, \`/api/testnet-token\` and \`/api/health\` read **only public metadata**. Do not proxy sensitive account data.
4. **Simulation:** Browser-local swaps, perps, lending and routing. Not real assets or markets.
5. **Risk research:** Exact-unit \`riskResearch.ts\` accepts caller-provided test fixtures; no enforceable oracle, custody, liquidation or margin ledger.
6. **Settlement:** All real Swap, Perps, Lending and Bridge paths remain hard-disabled in \`src/lib/capabilities.ts\`. SDK wallet-signed *proposal* is not financial settlement.

## Evidence to collect before each advanced milestone can be promoted

| M# | Demonstration that must be reproducible | Blocking source / trust requirement |
| --- | --- | --- |
| 2 | Healthy API + backend persistence and monitoring under failures | Operational infrastructure, API error/rate limits |
| 3 | Real testnet extension connects, account changes invalidate approval | Supported official wallet, network and signed session evidence |
| 4 | Independent testnet wallets A and B confirm an approved BDX receipt | Human wallet approvals and actual test BDX |
| 5 | Recover crash, timeout, retry, wallet re-scan, duplicate block | Wallet status API and signed wallet history evidence |
| 6 | Token list, 64-hex ID, precision, supply validated against public LWS | Public upstream health and schema parity |
| 7 | Reviewed dApp asset methods included in Beldex extension and SDK | Official upstream implementation; never leak view/spend keys |
| 8 | Per-origin approved read of actual user confidential holdings | M7 and independently validated balances |
| 9 | Token successfully registered/issued with official testnet wallet | Wallet approval, asset ID, chain or wallet receipt |
| 10 | Wallet B verifies a genuine Privacy Token received from wallet A | M7 and confirmed private asset transfer |
| 11 | Signed canonical intent, expiry, replay refusal, persisted order status | Trusted server nonce, storage and wallet auth |
| 12 | Real liquidity counterparties return verified executable testnet quotes | Authenticated maker and settlement guarantees |
| 13 | Successful two-sided exchange and failure/refund proof | Safe atomic primitive or audited escrow/trust structure |
| 14 | Complete wallet-signed spot swap with correct wallet balances | M10+M12+M13 and market audits |
| 15 | Provable collateral custody, deposits and withdrawals, no phantom credit | Enforceable Beldex or supported sidechain execution |
| 16 | Two wallets complete supply-borrow-repay-withdraw with reconciled assets | M15 and enforceable debt ledger |
| 17 | Stale/manipulated oracle is blocked; real liquidation recovers debt | Audited oracle, risk keeper, liquidation mechanism |
| 18 | Real margin position opens and closes with funding and liquidation | Enforceable escrow, price feed, insurance |
| 19 | Independently verified live bridge route and refund/timeout handling | Deployed bridges, external chain settlement and audit |
| 20 | Third-party security review, incident simulation, operational controls | External auditors, legal review and live monitoring |

## Current changes beyond M1

- **M2:** \`api/health.ts\` provides GET-only HTTP status with a bounded, optional public testnet light-wallet registry probe; distinguishes backend availability from genuine chain functionality.
- **M6:** Fix token current-supply validation to recognise decimal integers rather than a literal backslash-d pattern.
- **M11:** Signed proposal parsing requires a canonical field order, full bounded values, exact network, fixed expiration, unique fields and consistent wallet address.
- **M15/M17/M18:** \`src/lib/riskResearch.ts\` implements bounded, exact-integer *research-only* collateral LTV, stale-price rejection and perpetual P&L/margin calculations, with no custody or operator controls.
- **M20:** CI tests added around new core boundaries, with a visible 20-stage tracker.

## Release policy

**Never** set any M7–M19 financial settlement milestone to 'implemented' until there is real independently verifiable testnet execution and all stated acceptance gates pass. Never deploy private keys to frontend, never construct unsupported wallet RPCs, never treat signed messages as market fills, and never accept actual user deposits into HOXO prototype markets.

## Developer verification

\`\`\`sh
npm install
npm run typecheck
npm test
npm run build
\`\`\`

The above validates source, not blockchain settlement. Funded two-wallet manual testing and independent review are separate release gates.
