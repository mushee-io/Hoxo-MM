# HOXO — Privacy Runs Deep

**Beldex DeFi research prototype** · Swap · Perps · Lend · Routes · Safety · Launch readiness

HOXO is a Bluefin-inspired interface for privacy-native decentralised finance, being developed for the Beldex ecosystem. The repository now provides the **Milestones 1–7 prototype workstreams**. This means UI, simulation engines, integration research, operational controls, deployment hardening and release criteria — **not** seven production-grade mainnet protocols.

> **IMPORTANT:** No real token exchange, private-asset transfer, leveraged trade, loan, custody, collateral settlement, yield accrual or bridge transaction is performed. All balances, pools, rates and prices in the trading UI are illustrative local browser data. The separate Beldex Extension Wallet connection can read authorised BDX account information but is never used to execute trades.

## Quick start

Node.js 20+ required.

```sh
npm install
npm run dev
```

Check the application:

```sh
npm run typecheck
npm test
npm run build
```

## Milestone implementation

| Milestone | What this repository actually provides | Real-money status |
| --- | --- | --- |
| M1 Beldex foundation | Wallet-approved read-only BDX balance, React/TS/Vite app and strict local data separation | Privacy Token transactions not integrated |
| M2 HOXO Swap | Six stateful browser-local constant-product pools, slippage checks and balances | No live liquidity or atomically settled swaps |
| M3 HOXO Perps | Demonstration long/short trading, isolated margin and liquidation-aware position closure | No live matching, settlement, vaults or price oracles |
| M4 HOXO Lend | Demonstration supply/borrow/repay/withdraw, LTV controls and simple interest accrual | No enforceable collateral, loans or market rates |
| M5 Cross-chain routing | Direct vs two-hop local quote comparison, expiry limits and blocked external-chain routes | **No live bridges** |
| M6 Protocol security | Browser-demo pause, position/trade limits, fail-closed live settlement guard and threat-model documents | Requires authenticated/enforceable production controls and audits |
| M7 Launch readiness | Readiness page, Vercel research-preview headers, robots exclusion, operations and release runbooks | **Production blocked** |

## App navigation

- **Overview:** product links and simulated portfolio KPIs
- **Swap:** token exchange simulation with mutable local reserves
- **Perps:** BTC/ETH/BDX reference market derivatives simulation
- **Lend:** simulated collateral and borrowing ledger, 1/7-day manual accrual
- **Routes:** compare direct and two-hop quote paths; external chain destinations show unavailable
- **Security:** browser-session pause and example exposure limits
- **Launch:** explicit blocking gates before any production use
- **Portfolio:** synthetic balances, demo positions and local activity ledger

## Repository map

- `src/App.tsx` — application shell, wallet UI, pages and demo action orchestration
- `src/features/Protocol.tsx` — M5–M7 route, security and launch screens
- `src/hooks/useBeldexWallet.ts` — Beldex wallet authorised, read-only integration
- `src/lib/routes.ts` — M5 offline routing comparisons, TTL, max value, immutable local execution
- `src/lib/security.ts` — M6 demonstration controls and hard-disabled live settlement
- `src/lib/readiness.ts` — M7 release blockers and classification
- `src/lib/swap.ts`, `src/lib/perps.ts`, `src/lib/lend.ts` — local financial simulations only
- `src/lib/demo.ts`, `src/lib/interest.ts` — local storage validation and illustrative accrual
- `src/lib/*.test.ts` — unit and regression tests
- `docs/ROADMAP.md`, `docs/BRIDGE_MATRIX.md`, `docs/SECURITY_MODEL.md`, `docs/RELEASE.md`, `docs/OPERATIONS.md` — implementation and release requirements
- `vercel.json` — static Vite preview deployment headers, anti-indexing
- `SECURITY.md` — project security and disclosure guidance

## Privacy, security and financial disclosure

- Browser state is **not tamper resistant**; frontend limits and a session pause are educational controls only.
- The client is not a real AMM, order book, liquidator, bridge, insurer, custody service or oracle.
- The route explorer does not create a deposit address, sign a bridge transaction or pretend an external pool exists.
- A Beldex transaction can have privacy features on its own chain while leaking data to network-level observers, counterparties, bridge operators or transparent destination networks.
- No real-money action can be turned on via a simple environment flag; live settlement is hard-disabled.
- Do not provide private keys, seed phrases or view keys to HOXO.
- Deployment of a research website does not mean financial products are audited, approved or launched.

Beldex published a UTXO Privacy Token testnet launch in October 2026 and has described a planned EVM-compatible sidechain. These are distinct from deployed programmable settlement suitable for a full DeFi suite.

## Deployment

A non-indexed research-preview deployment can be built from `dist/` (see `vercel.json`). **Do not** enable trading or accept deposits. See `docs/RELEASE.md` for rollout gates and `SECURITY.md` for disclosure.

## Source references

- https://beldex.io/blog/privacy-tokens-live-on-beldex-testnet
- https://www.beldex.io/blog/beldex-stealthex-ama-recap
- https://www.beldex.io/grants
- https://github.com/Beldex-Coin/bdx-web3js

© 2026 Mushee / HOXO. Research prototype.
