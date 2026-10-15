# HOXO — Privacy Runs Deep

**Bluefin-inspired private DeFi UX on Beldex: Swap · Perps · Lend.**

This repository contains the Milestones 1–4 **application foundation and functional simulations**, not a live decentralised exchange. **All Swap, Perps and Lend market data, balances, positions and actions are simulated locally in the browser. Demo Swap uses stateful browser-local AMM reserves; opening/closing perpetual positions includes an isolated-margin liquidation model; and demo lending can manually accrue illustrative interest for 1 or 7 days. Nothing here trades, borrows or deposits real assets.** The Beldex wallet feature is separate and uses the `@bdxi/web3js` SDK to request a user-authorised connection and display an unlocked BDX balance; the application does not send transactions.

## Run locally
Requires Node.js 20+.
```bash
npm install
npm run dev
```
Open the URL printed by Vite. Use the dashboard and simulate swaps, opening and closing leveraged positions, supplying collateral and borrowing. Click **Connect Beldex** only if you have a compatible Extension Wallet. Simulator balances do not reflect wallet balances.

## Verify
```bash
npm run typecheck
npm test
npm run build
```

## Repo map
- `src/App.tsx` — HOXO single-page application
- `src/hooks/useBeldexWallet.ts` — wallet-authorised read-only connection
- `src/lib/swap.ts` — stateful hypothetical constant-product AMM pools with minimum-output enforcement
- `src/lib/perps.ts` — isolated-margin math and conservative demo liquidation settlement
- `src/lib/lend.ts` — simulated collateral and debt ledger
- `src/lib/demo.ts` — validated browser-local persistence, legacy pool-state migration, reset and activity
- `src/lib/interest.ts` — 30-day projections and manual bounded demonstration interest accrual
- `src/lib/engines.test.ts`, `src/lib/interest.test.ts`, `src/lib/simulation.test.ts` — accounting and risk regression tests
- `docs/ROADMAP.md` — precise milestone implementation and outstanding work

## Security and financial limitations
- Test/demo UI only. No custody, live market data, token swaps, perps, or loans.
- Demo balances are generated locally and persisted in localStorage; they are **not** BDX funds.
- Illustrative USD prices, lending APYs and liquidity reserves are fixed constants. They are **not oracle data, promises of return, or executable quotes**.
- Perps model excludes real funding payments, fees, liquidation auctions, partial fills and price oracle failure.
- Lending APR projections are illustrative. Users may manually advance the local demo ledger by 1 or 7 days; this is not real earned interest, an actual loan or a market-rate model.
- Swap reserves and execution rates mutate exclusively in the local simulator and have no relationship to real Beldex liquidity. Client-side quote checks do not provide blockchain execution guarantees.
- Demo perps settlement zeroes payout when maintenance margin is breached, but it is not a real liquidation or insurance mechanism.
- The available Beldex wallet SDK exposes connection, permitted balance reads and approved BDX transfers; the latter are deliberately **not** wired to any demo trade button.
- Production deployment needs verified Beldex execution primitives, independent security audit, privacy review and appropriate legal/regulatory assessment.
- No private keys, view keys or seed phrases should ever be provided to HOXO.

## Beldex references
- https://beldex.io/blog/privacy-tokens-live-on-beldex-testnet
- https://github.com/Beldex-Coin/bdx-web3js
- https://beldex.io/grants

© 2026 HOXO / Mushee. Development prototype.
