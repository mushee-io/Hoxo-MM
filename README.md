# HOXO — Privacy Runs Deep

[**20-milestone implementation and blockers**](docs/MILESTONES_02_20.md) · [**Architecture audit**](docs/MILESTONE_01_ARCHITECTURE.md) · [**Milestones 4–8 testnet acceptance**](docs/M04_M08_TESTNET_ACCEPTANCE.md) · [**Milestones 9–17 protocol acceptance**](docs/M09_M17_PROTOCOL_ACCEPTANCE.md) · [**M18–20 checkbox acceptance**](docs/M18_M20_FINAL_CHECKLIST.md) · [**All 20 milestone crossboxes**](docs/MILESTONES_02_20.md)

**Beldex DeFi research prototype** · Swap · Perps · Lend · Routes · Safety · Launch readiness

HOXO is a Bluefin-inspired interface for privacy-native decentralised finance, being developed for the Beldex ecosystem. **The Testnet tab additionally supports a real, wallet-approved native BDX transfer on Beldex TESTNET; this is separate from all simulated DeFi actions.** The repository now provides the **Milestones 1–7 prototype workstreams**. This means UI, simulation engines, integration research, operational controls, deployment hardening and release criteria — **not** seven production-grade mainnet protocols.

> **IMPORTANT:** Only explicit, user-approved **native testnet BDX sends** can broadcast an actual transaction. Signed Swap and Lend proposals are **wallet signatures only**; they never exchange assets, provide loans, or settle on-chain. No real token exchange, Privacy Token transfer/issuance, leveraged trade, loan, custody, collateral settlement, yield accrual or bridge transaction is performed. All balances, pools, rates and prices in the trading UI are illustrative local browser data. The separate Beldex Extension Wallet connection can read authorised BDX account information but is never used to execute trades.

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
| M1 Beldex foundation | Wallet-approved BDX balance and native TESTNET BDX transfer, React/TS/Vite app and strict data separation | Funded two-wallet E2E not yet verified; Privacy Token transactions unavailable in published SDK |
| M2 HOXO Swap | Six stateful browser-local pools, slippage checks, plus wallet-verified **off-chain** testnet proposal signatures | No live liquidity, token exchange or atomically settled swaps |
| M3 HOXO Perps | Demonstration long/short trading, isolated margin and liquidation-aware position closure | No live matching, settlement, vaults or price oracles |
| M4 HOXO Lend | Demonstration supply/borrow/repay/withdraw, LTV controls, interest and signed **off-chain** testnet proposals | No enforceable collateral, loans or market rates |
| M5 Cross-chain routing | Direct vs two-hop local quote comparison, expiry limits and blocked external-chain routes | **No live bridges** |
| M6 Protocol security | Browser-demo pause, position/trade limits, hypothetical fee/BDX buyback allocation, fail-closed live settlement guard and threat-model documents | Requires authenticated/enforceable production controls and audits |
| M7 Launch readiness | Readiness page, Vercel research-preview headers, robots exclusion, operations and release runbooks | **Production blocked** |

## App navigation

- **Testnet:** real wallet-authorised native **test BDX** transfer (5 BDX cap), network verification, wallet-approved signature proof, persistent uncertain-payment safety lock and wallet reconciliation; no mainnet sends
- **Overview:** product links and simulated portfolio KPIs
- **Swap:** token exchange simulation, wallet-signed non-executable intents, plus live public Beldex testnet Privacy Token discovery by token ID
- **Perps:** BTC/ETH/BDX reference market derivatives simulation
- **Lend:** simulated collateral and borrowing ledger, 1/7-day manual accrual, signed lending proposal and public Privacy Token discovery
- **Routes:** compare direct and two-hop quote paths; external chain destinations show unavailable
- **Security:** browser-session pause and example exposure limits
- **Launch:** live wallet network, public testnet Privacy Token catalogue, wallet-side registration instructions and explicit blockers
- **Portfolio:** live wallet-authorised BDX total/unlocked balances and network height **separated** from synthetic tokens and demo positions

## Repository map

- `src/App.tsx` — application shell, wallet UI, pages and demo action orchestration
- `src/features/Protocol.tsx` — M5–M7 route, security and launch screens
- `src/hooks/useBeldexWallet.ts` — Beldex wallet authorised connection, balances and native testnet-only BDX transfer
- `src/features/BeldexTestnet.tsx` and `src/lib/testnet.ts` — explicit real test BDX transfer UI, network/amount/fee-reserve guards
- `src/features/TestnetIntents.tsx` and `src/lib/testnetIntents.ts` — wallet-signed, verified **off-chain** testnet Swap/Lend proposals (no actual settlement)
- `docs/TESTNET_EXECUTION_MATRIX.md` — what is native chain activity, wallet-signed only, and purely demo
- `api/testnet-tokens.ts`, `api/testnet-token.ts` — bounded public testnet token metadata lookups; no wallet keys or personal balances
- `src/features/TestnetAssets.tsx` — public testnet token listing / token ID lookup in Swap, Lend, Portfolio and Launch
- `docs/TESTNET_PUBLIC_ASSETS.md` — official wallet token registration guide and verification checklist
- `docs/BELDEX_TESTNET.md` — funded two-wallet test plan, transfer recovery guidance and current Privacy Token integration blockers
- `src/lib/nativeTransfer.ts`, `src/lib/transferSafety.ts` — single-send SDK boundary and privacy-minimising unknown-outcome guard
- `src/lib/testnetProof.ts` — local testnet signature proof with independent wallet verification; **not** authentication
- `src/lib/privacyAssetAdapter.ts` — hard-disabled, exact-unit Privacy Token integration contract awaiting documented SDK methods
- `src/lib/routes.ts` — M5 offline routing comparisons, TTL, max value, immutable local execution
- `src/lib/security.ts` — M6 demonstration controls and hard-disabled live settlement
- `src/lib/economics.ts` — M6 transparent, hypothetical LP / reserve / BDX buyback fee allocation
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
- Privacy Token issuance/transfers need documented Beldex developer APIs; the published wallet SDK only exposes native BDX transfer methods.
- A Beldex transaction can have privacy features on its own chain while leaking data to network-level observers, counterparties, bridge operators or transparent destination networks.
- No DeFi settlement can be enabled via a simple environment flag; Swap/Perps/Lend/Routes settlement is hard-disabled. Native wallet-approved TESTNET BDX transfers are an explicit exception and are clearly labelled.
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
