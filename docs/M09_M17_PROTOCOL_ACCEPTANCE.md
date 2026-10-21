# HOXO-MM — Milestones 9–17, protocol build and acceptance

**Repository:** mushee-io/Hoxo-MM  
**Network target:** Beldex TESTNET only  
**Scope:** Working off-chain research engines and transparent UX. This does **not** constitute live private-token execution, atomic custody or a lending protocol.

## Exact shipped components

| Milestone | Code | Actual functionality | Remaining testnet requirements |
|---|---|---|---|
| 9 · Token registration | src/lib/tokenRegistration.ts; ProtocolLabs.tsx | Exact BigInt supply/precision/name review; compare wallet-registered token with public LWS descriptor | Register a disposable asset using the **official wallet**, verify its token ID, chain finality, owner and metadata; HOXO has no direct issuance bridge |
| 10 · Private token transfer | src/lib/privateTransferReview.ts; ProtocolLabs.tsx | Full token ID, exact amount, destination and network validation; explicit refusal to broadcast | Official origin-authorized Beldex asset transfer API, wallet approval, funded A→B testnet asset delivery |
| 11 · Signed orders | src/lib/testnetIntents.ts, researchOrders.ts, spotResearch.ts | Off-chain wallet-signed proposals, canonical intent parsing, expiring local research tickets, user-specific cancellation/replay checks | Nonce server, durable authenticated state, verifiable signature checks and external review; signature is not trade |
| 12 · RFQ liquidity | researchRfq.ts, spotResearch.ts | Reject forged/malformed drafts, compare bounded same-pair/amount research quotes, expire safely | Actual authenticated testnet makers, funded inventory and executable quotes |
| 13 · Settlement | spotResearch.ts | Pure two-party balance conservation in a **fictional** model; refuses live settlement | Enforceable atomic Beldex primitive or audited escrow, counterparty safety, refunds and independent receipt proof |
| 14 · Real Swap | Swap UI + ProtocolLabs.tsx | Distinct simulated HOXO swap, local research order/settlement preview | Complete M10, M12 and M13; user-approved actual token exchange across two wallets |
| 15 · Collateral vaults | researchLendingVault.ts | Pure BigInt multi-account vault, collateral caps and supply/cash/debt invariant | Real custody escrow and verifiable collateral ownership; unsupported in current wallet bridge |
| 16 · Lending markets | researchLendingVault.ts | Supply, withdraw, collateral deposit/withdraw, borrow, repay and debt interest research actions | Durable enforceable debt, actual supplied liquidity and full independent repayment/withdrawal reconciliation |
| 17 · Oracle/liquidation | researchOracle.ts, researchLendingVault.ts | Unique-provider fixture consensus, max-age and deviation bounds, LTV, close factors and bonus-limited simulated liquidation | Authenticated real price sources, collateral enforcement, keeper operations, liquidation receipts and bad-debt safeguards |

## Architecture trust boundaries

- **User wallet:** Official Beldex dApp protocol v1 exposes *native BDX* wallet operations. HOXO must not claim Privacy Token balance, issue, or send methods have shipped, and must not collect view/spend keys.
- **Public metadata:** `/api/testnet-token` and `/api/testnet-tokens` retrieve public descriptors only. No account balance, token ownership or mint finality can be deduced from a public descriptor.
- **Research calculator:** All simulated token amounts and USD prices are locally supplied fixtures. The BigInt engines run no RPC calls, operate on no real funds, and cannot sign transactions.
- **Research swap tickets:** Local ticket IDs, quote ranks and virtual settlement results are not exchange fills, executable maker quotes or independently enforceable commitments.
- **Research collateral:** `cash + debt = supplied + accrued interest` is a model invariant, **not** proof of on-chain reserves or solvency. The model cannot accept or lock assets.
- **Real testnet BDX:** Actual transfer workflow remains separately restricted to the **Testnet** tab, official wallet approval, per-request cap and exact account/network checks.

## Acceptance and testing gates

### M9 and M10
- Reject invalid or excessive supply, non-BDX asset precision errors and mismatched public descriptors.
- Validate genuine public token IDs; never use asset registration matching as receipt of ownership.
- Reject mainnet, malformed destination, negative/zero/over-precision token amounts.
- E2E Privacy Token transfer and issuance remain blocked until the official dApp wallet bridge is published and independently tested.

### M11, M12, M13 and M14
- Reject mismatched assets, quote size, expired/unverified RFQs, quote replay, unauthorised cancellation and output below minimum.
- Pure model swaps must transfer exactly the same quantity between the two fictional ledgers; no funds appear or disappear.
- Reject insufficient fictional counterparty balances without mutating original state.
- E2E exchange test: two disposable testnet wallets, genuine tokens, real price and liquidity, secure two-sided settlement, actual receiving-wallet confirmation, delayed/failure refund validation and external audit.

### M15, M16 and M17
- Invariant-test every supply, collateral, borrowing, repayment, interest accrual and liquidation transition.
- Block borrowing beyond maximum LTV, withdrawals that violate remaining collateral, supply redemptions without vault cash and repayments exceeding debt.
- Reject stale/future oracle reports, duplicate sources and excessive disagreement, and never mix fixture values with live-feed claims.
- Restrict liquidation to unsafe positions, enforce maximum close factor, penalty bounds, debt reduction and collateral conservation.
- E2E lending test requires real vault deposits/withdrawals, on-chain debt and interest, authenticated oracle, permissioned liquidator/keeper, recovery for bad debt, independent security reviews.

## Automated verification

Run on a fresh clone:

```sh
npm install
npm audit --omit=dev --audit-level=high
npm run typecheck
npm test
npm run build
```

When CI passes, only implementation and **mocked/fictional research logic** have been proven; no live testnet asset transfer, custody or derivatives/lending settlement is certified.

## Upstream dependency

See [missing private-asset wallet SDK methods](https://github.com/mushee-io/Hoxo-MM/issues/3) and the [current wallet dApp protocol](https://github.com/Beldex-Coin/bdx-web3js/blob/main/docs/PROTOCOL.md). Do not attempt to bypass the extension by copying the wallet's private view key into a website, serverless function, or backend.
