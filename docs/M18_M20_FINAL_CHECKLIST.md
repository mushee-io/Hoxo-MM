# HOXO-MM | Milestones 18–20 acceptance and checkbox release tracker

Status: source implementations for research tools; real financial settlement remains blocked.

## M18 — perpetuals paper clearing
- [x] Virtual matched long/short positions, isolated BigInt margin and conservation.
- [x] Zero-sum funding cash transfers and paired virtual realised P&L.
- [x] Oracle-fixture freshness, risk checks and bankrupt settlement rejection.
- [x] HOXO Perps research interface with paper-only disclosure.
- [ ] Real custody, authentic matching, insurance, oracle and force-liquidation contracts.
- [ ] Independent testnet wallet E2E, adversarial tests and external audits.

## M19 — cross-chain routing review
- [x] Fail-closed bridge trust matrix and no invented live cross-chain routes.
- [x] Exact token ID, TTL, amount and destination validation.
- [x] Research-only source, destination, timeout, refund-claim and dispute states.
- [x] HOXO Routes bridge research UI. Its notes are NOT independent chain receipts.
- [ ] Verify bridge contracts, chain finality, relayer trust, refund mechanics and liquidity.
- [ ] Prove two-chain funds/refund reconciliation under real failure scenarios.

## M20 — security and deployment
- [x] TypeScript, unit test, production dependency audit and Vite build CI.
- [x] Source-controlled financial-settlement capability guard that refuses unsupported execution.
- [x] Security policy, operations runbooks and release-gate documentation.
- [x] Evidence-aware checkboxes for M18–20, shown under HOXO → Launch.
- [ ] Independent security/economic audit with remediation report.
- [ ] Production monitoring, tested backup/restore, staff incident response and key security.
- [ ] Financial-service legal review and independently verified testnet/mainnet settlements.

## Checkbox meanings

Locked, checked code-evidence boxes mean the named code exists and has source tests; they are not an audit.
User-selectable manual boxes are LOCAL SELF-REVIEW NOTES only. They neither certify third-party checks nor change HOXO settlement gates.
All manual boxes can be checked and the deployed product STILL refuses real perps, bridges, lending and swap execution.
Do not record wallet seeds, view keys or private user details in checklist notes.

## Validate

Commands: npm install; npm audit --omit=dev --audit-level=high; npm run typecheck; npm test; npm run build.
The Beldex wallet protocol does not currently provide the required confidential-token dApp settlement methods.
See https://github.com/Beldex-Coin/bdx-web3js/blob/main/docs/PROTOCOL.md .