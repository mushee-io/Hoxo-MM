# HOXO milestone status

Updated: 14 October 2026

This repo distinguishes **implemented prototypes** from **live blockchain functions**. No fake trade, liquidation or lending action is marketed as an on-chain transaction.

## Milestone 1 — Foundation
- [x] React / TypeScript / Vite shell, responsive UI and navigation
- [x] Beldex Extension Wallet connection via official-organisation SDK fork `@bdxi/web3js`
- [x] Wallet-authorised BDX balance read and network display
- [x] Read-only wallet state separated from fictitious simulator balances
- [ ] Live Privacy Token issuance/transfer integration (requires reviewed token SDK and testnet assets)
- [ ] Real backend, relayer infrastructure and on-chain integration tests

## Milestone 2 — HOXO Swap
- [x] Quote inputs, asset selectors, slippage and fees
- [x] Deterministic constant-product quote simulator
- [x] Demo wallet and local activity ledger
- [ ] Actual liquidity pool contracts, RFQ signing, atomic swap settlement, audit

## Milestone 3 — HOXO Perps
- [x] BTC, ETH and BDX demo markets, long/short, isolated margin, 1–20x leverage
- [x] Position equity, PnL, liquidation-price calculations, stress-price slider
- [x] Open/close simulator positions and history
- [ ] Real oracles, matching engine, escrow, enforceable settlement, liquidation keepers, audit

## Milestone 4 — HOXO Lend
- [x] Demo supply/withdraw/borrow/repay, wallet ledger, health factors
- [x] Asset APYs (illustrative), 70% borrow LTV and 80% liquidation threshold
- [x] Unit tests for collateral constraints
- [x] Deterministic 30-day interest projection with collateral-health preview and invalid-state tests
- [ ] Persist and reconcile accrued interest with a real lending ledger (projection is read-only)
- [ ] Real lending pools, contract-level collateral enforcement, dynamic interest accrual and audit

## Why staged?
Beldex launched UTXO Privacy Tokens on testnet in October 2026, but its EVM sidechain was not live as of this milestone. Native private transfers do not imply executable AMM, perpetual or lending contracts. Real financial execution MUST remain disabled until verified settlement infrastructure is available.

References:
- https://beldex.io/blog/privacy-tokens-live-on-beldex-testnet
- https://github.com/Beldex-Coin/bdx-web3js
- https://beldex.io/blog/beldex-stealthex-ama-recap

## Developer commands
```sh
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

No environment secrets are needed. Do not deposit assets into a demo trading screen.
