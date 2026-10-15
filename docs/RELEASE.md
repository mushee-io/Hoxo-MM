# HOXO Release Plan — Milestone 7

## Current launch classification
**Research website / demo build only.** The Vite site may be deployed as a non-indexed public **prototype** with all local trading actions explicitly simulated. A deployed frontend must **never** be described as audited, mainnet-ready or as holding real assets.

## Deployment verification
```sh
npm install
npm run typecheck
npm test
npm run build
```
Deploy the `dist/` output using the Vite preset. `vercel.json` provides security headers and indexing restrictions suitable for a research preview. Smoke-test wallet connection on **a test-only wallet**, route expiry, rejected invalid positions, risk-reducing actions under pause, and browser reset.

### Deployment safety checklist
- [x] Wallet connection, native TESTNET BDX transfer (user approval), restart-persistent unknown-outcome lock, verified off-chain Swap/Lend proposals, live Portfolio balances, local signed proof demonstration, separated demo balances and mainnet send lockout
- [ ] Funded two-wallet testnet BDX transfer E2E manually verified
- [x] No real **DeFi settlement** operation in the application; native TESTNET BDX transfers are separately authorised by the wallet
- [x] Static simulation and route research UI
- [x] Fail-closed cross-chain route discovery
- [x] Browser-only security limits with honest warning
- [x] Source-controlled release gate list
- [ ] Verified Beldex Privacy Token issuance and transfer API + testnet E2E
- [ ] Real smart contracts or enforceable UTXO settlement
- [ ] Deployed, verified bridge adapters
- [ ] Real oracle and liquidation architecture
- [ ] Independent security and economic audits
- [ ] 24/7 monitoring, incident rotation, recovery rehearsals
- [ ] Legal/regulatory review for every target jurisdiction
- [ ] Production custody and change-management runbooks

## Mainnet release policy
Never enable real funds by frontend or environment flag alone. For each product, require proof of deployment contracts/code hashes, risk limits, test vectors, audit reports, verified counterparty/bridge addresses, and testnet-to-mainnet reconciliation. Production permissioned services must enforce controls at execution and settlement layers, not just in the browser.

### Staged production launch (future)
1. **Privacy-token integration:** verified and wallet-approved transfers on Beldex testnet, with privacy disclosure and support procedures.
2. **Swap pilot:** settlement proof, restricted assets, small trade limits, deployed and externally audited liquidity. Avoid claiming atomicity without enforceable chain settlement.
3. **Lending pilot:** conservative, liquid collateral; oracle divergence guards; audited collateral contracts; emergency liquidations.
4. **Perps pilot:** matching/settlement, price and funding oracles, insurance accounting, enforceable forced liquidation, legal review.
5. **Cross-chain launch:** verified adapters with published bridge trust assumptions and external-chain traceability notices.

See [ROADMAP](ROADMAP.md), [BRIDGE_MATRIX](BRIDGE_MATRIX.md), and [SECURITY_MODEL](SECURITY_MODEL.md).
