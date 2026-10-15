# HOXO — Beldex Testnet Privacy Implementation

Updated 15 October 2026. Status: **native testnet BDX wallet transfer flow integrated in code; not yet verified using a funded human-controlled testnet wallet.**

## What now works in code
- HOXO has a dedicated **Testnet** page separate from the Swap / Perps / Lend / Routes simulations.
- Connect the published Beldex Extension Wallet through `@bdxi/web3js`.
- Read the *wallet-authorised* BDX address, chain type, unlocked balance and sync height. These belong to the actual wallet, not demo-state tokens.
- Refuse **all mainnet transfers**. Wallet must report `testnet` twice: during connection and immediately before transfer; connected account is re-checked.
- Before sending: require a concrete wallet address, 1–9 decimal BDX amount, at most **5 test BDX**, unlocked funds exceeding the transfer amount to allow network fees, and a deliberate acknowledgement.
- Call **only** the official wallet SDK's `sendTransaction` with user approval, priority 1. No private key, view key, signing service, user session token or relayer is stored or transmitted to an HOXO server.
- Display SDK-reported hash and fee, where available; optional wallet-operation status check when the wallet supplies `operationId`.
- Distinguish wallet rejection, error, and **unknown outcome**. Unknown means it **MAY** have broadcast. Never automatically repeat. This code does not assert blockchain confirmation solely from a wallet-returned hash.
- Keep transfer details in React memory only. Save a **minimal opaque in-progress lock** (UUID and timestamp only; no recipient, amount, wallet address, keys or tx hash) in local browser storage before wallet approval. An unknown outcome prevents fresh requests even after reload. Manual unlocking requires reviewing the wallet's history; it never triggers a resend.
- User-approved testnet **message signing and verification** is available. Its nonce is browser-generated, so it demonstrates wallet control but MUST NOT be used as a trusted login or server-authentication mechanism.
- A fail-closed Privacy Token SDK adapter contract exists, with exact integer-unit conversion and no operational asset RPC methods.

**Wallet SDK boundary:** currently published `@bdxi/web3js` v1.0.1 supports native BDX transfers and sign/verify operations. It does **not** publicly document a method to issue, enumerate or send Beldex *Privacy Tokens* (assets distinct from BDX). We must not guess method names or send wallet-RPC commands from a webpage.

## Manual end-to-end BDX testnet validation (needs human approval)

1. Install/build the **Beldex Extension Wallet TESTNET** variant, from the Beldex organisation's official extension repository: https://github.com/Beldex-Coin/beldex-wallet-extension. Confirm its network is **testnet**, not mainnet, and its LWS is a testnet endpoint.
2. Create **two disposable TESTNET wallets** under your control: Wallet A (sender) and Wallet B (recipient). Do not use mainnet keys, and never share wallet recovery phrases with HOXO or third parties.
3. Open HOXO Testnet page. Connect Wallet A and check its network displays `testnet`, and that account address/scan height/balance match the extension.
4. Obtain test BDX for Wallet A from the official https://faucet.beldex.dev and wait until funds are unlocked. The official testnet explorer is https://testnet.beldex.dev.
5. Enter Wallet B's full address and a **small amount**, e.g. `0.01` BDX if spendable and above current network minimum/fees. Read the explicit summary and tick confirmation.
6. Click **Request TESTNET wallet transfer**; inspect the wallet's recipient, amount and fee again. Approve **inside the extension**.
7. Capture the wallet-returned transaction hash (if present). Inspect Wallet A's history and Wallet B's incoming balance. Wait for the wallet to report an actual chain confirmation, and check the explorer/owned recipient as appropriate.
8. Test denial, wrong-network (mainnet), invalid address, approximate/insufficient unlocked funds, network/account switching, disconnected wallet and a transfer with an uncertain result. **Do not replay an uncertain payment.** Reload after a deliberately induced unknown send and verify the app retains its safety lock; reconcile wallet history before explicitly clearing it.
9. Document tx hash and test results *privately*; don't include recipients, wallet sync logs, or sensitive metadata in public issue comments.

### What the application cannot prove alone
Beldex native UTXO transactions are privacy-oriented, but the HOXO webpage temporarily sees any recipient and amount manually entered into the form. Your browser extension and network peers can observe other metadata. Explorer absence of details is not equivalent to an independent cryptographic privacy audit.

## Privacy Token blocker: exact information requested from Beldex engineers

- Publicly supported Privacy Token **issuance/minting** and asset identifier specification for the **Proto testnet hard fork**, including CLI/wallet-RPC/API methods.
- Wallet-compatible **asset balance** access, asset precision and transfer method, with reference responses and signing format.
- Whether `@bdxi/web3js` and `beldex-wallet-extension` support assets beyond BDX in a published version. The v1.0.1 SDK's documented `BdxMethod` list is BDX-only.
- Testnet Privacy Token **faucet or example asset IDs**, exact chain heights/feature flags, wallet scan requirements, and expected transaction receipts.
- Wallet/account privacy model and any **view-key or selective disclosure** verification API (never store raw keys server-side).
- Production bridge and composable exchange-settlement primitives (if available) or a documented atomic/swap service trust model.
- Integration support for two-wallet E2E tests using *only* disposable testnet assets.

Until these exist, **token issue / mint / burn / private-asset swap are blocked**. HOXO's testnet transfer proves native BDX wallet integration, **not** token issuance or a private DEX.

## What's required to move Swap, Perps and Lend from UI to real testnet

| Product | Missing functionality | Earliest responsible demo |
| --- | --- | --- |
| HOXO Swap | Confidential Asset token transfer API, RFQ/liquidity counterparty agreement, atomic settlement or explicit trust assumptions, refunded failure states | Wallet-to-wallet **asset transfer**; then verified token-for-token exchange mechanism |
| HOXO Perps | Enforceable testnet collateral escrow, robust mark/oracle feeds, matching, maintenance risk and settlement, testing | Testnet collateral-backed positions **only after** settlement design is secure |
| HOXO Lend | Pool asset custody, collateral/rate indexes, borrow/repay enforcement, liquidation and risk monitoring | A secure testnet lending pool with auditable debt/collateral invariants |
| HOXO Cross-chain | Verified bridge contracts/asset IDs, supported chains, finality/reconciliation/refunds, external-chain privacy disclosure | Bridge pilot **after** audited integration and operator-risk review |
| All products | Transaction support, account/reorg recovery, monitored ops, reproducible wallet E2E and independent security review | No mainnet financial execution before release gates |

## Developer test commands

```sh
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

These commands verify **code** and simulated markets. They cannot substitute for signing one actual **testnet** transfer in a funded Beldex Extension Wallet.

## Relevant official references

- Beldex 6 Oct 2026 testnet announcement: https://beldex.io/blog/privacy-tokens-live-on-beldex-testnet
- Official testnet explorer: https://testnet.beldex.dev
- Official faucet: https://faucet.beldex.dev
- Beldex SDK: https://github.com/Beldex-Coin/bdx-web3js
- Beldex Extension Wallet: https://github.com/Beldex-Coin/beldex-wallet-extension
- Beldex grant information: https://beldex.io/grants
