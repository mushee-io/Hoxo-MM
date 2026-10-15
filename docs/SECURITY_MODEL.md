# HOXO Threat Model — Milestone 6

## System boundaries
1. **Beldex wallet:** the user authorises read-only connection and unlocked BDX balance access. HOXO receives no seed, view key or spend key.
2. **Simulation state:** browser-local balances, liquidity, positions, sample prices and APYs. All values are synthetic and editable by the user/browser. They are **not trusted accounting**.
3. **Route explorer:** quote math on the same fictional local AMM pools. External-chain routes are disabled.
4. **Production systems:** no custodial vault, backend exchange, price oracle, bridge relayer, signing service or enforceable settlement is currently deployed.

## Attack surfaces and controls
| Threat | Current mitigation | Remaining risk |
| --- | --- | --- |
| Misleading financial claims | Persistent demo banner, fictional balances and explicit disabled release gates | Screenshots can be taken out of context |
| Stale quote, price impact | Quote TTL for routes, bounded slippage, recompute against mutable local reserves | No authenticated server/oracle quote |
| Frontend state tampering | Validate persisted objects and numeric inputs; enforce browser-local limits | All frontend checks are bypassable; **not** production security |
| Under-collateralisation | 70% example LTV, blocked new borrows and withdrawals; repay/supply allowed under stress | No enforced vault or chain-side liquidator |
| Margin breach | Conservative zero-payout simulated liquidation on breach | No market pricing, liquidation auction or bad-debt resolution |
| Bridge failure or fraud | No bridge transaction capabilities present | Bridging cannot launch without contracts, monitoring, audits |
| Price-oracle manipulation | Fixed labelled example prices, no user-facing live execution | Real oracle infrastructure absent |
| Sensitive wallet information | Never ask for seed or private keys; read authorised wallet balance only | Browser extensions and RPC metadata have separate threat boundaries |
| Compromised release | Live execution hard-disabled; noindex header on preview | Production keys, upgrade policy, governance all unimplemented |

## Kill switch semantics
The Safety Centre 'pause' is an **ephemeral client-side demonstration control**, resetting on page reload. It is not a real protocol kill switch. It stops new simulation risk actions only; closing positions, supplying collateral and repaying debt remain accessible. Live finance requires an authenticated, durable and independently enforceable emergency control plane.

## Privacy
Beldex's UTXO privacy protections do not automatically make orders, network requests, bridge deposits, UI telemetry or transparent destination-chain transfers private. Any future privacy claim must be verified end-to-end across counterparties, routing providers and chain settlement. Avoid telemetry of financial activity unless explicitly authorised.

## Review requirements before mainnet
Independent audits (including economics and oracle risks), least-privilege signing, rate limits, hardware/key custody, fail-safe upgrades, tamper-resistant accounting, on-chain invariants, fork/reorg testing, live monitoring, disaster recovery and jurisdictional assessment.
