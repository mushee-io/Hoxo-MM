# HOXO — Beldex Testnet Execution Matrix

Updated 15 October 2026. This document distinguishes **real chain activity**, **real wallet signatures** and **simulation**. Those are not interchangeable.

| User flow | Real Beldex SDK? | Real network transaction? | Enforceable testnet DeFi? |
| --- | --- | --- | --- |
| Connect wallet, read real BDX total/unlocked balance, network, wallet sync height | Yes | Read-only | No |
| Send native test BDX to another Beldex wallet | Yes, requires extension approval | **Potentially**: wallet returns hash; human two-wallet E2E still unverified | A BDX transfer, **not a swap** |
| Prove testnet wallet control via challenge signature | Yes, after user approval | No; cryptographic wallet signature | No |
| Sign a proposed BDX → target Privacy Token exchange request | Yes, wallet signs and verifies local message | **No** | **No** — no quote counterparty, assets, escrow or settlement |
| Sign a proposed BDX loan at an indicated APR | Yes, wallet signs and verifies local message | **No** | **No** — no lender/borrower matching, collateral or liquidation |
| HOXO Swap token-to-token exchange | No, local AMM only | **No** | **No** |
| HOXO Lend supply/borrow/repay | No, local accounting only | **No** | **No** |
| HOXO Perps positions and liquidations | No, local simulation only | **No** | **No** |
| HOXO Portfolio | Yes for native wallet BDX snapshot; separate fictional holdings | Read-only | N/A |
| HOXO Launch | Yes for client-reported network, wallet scan height and latest transfer status; not an explorer receipt | Read-only | N/A |
| Cross-chain routes | No, mocked local path comparison | No | No |

## Why signed intents are useful but not settlements

The official wallet can sign and verify a short origin-controlled message with the user's approval. HOXO uses this to prove a user expressed a proposed swap or lending offer on testnet. The signature is **not submitted on-chain**, cannot automatically debit funds, is not a price quote, does not locate liquidity and is not collateral escrow. Intents expire five minutes after creation and exist only in browser memory. They cannot be used as server login credentials or enforceable agreements by themselves.

## Testnet real-deal acceptance criteria

### Wallet and portfolio
- [x] Fetch BDX total, unlocked, network, sync height after connection.
- [x] Preserve actual wallet values separately from simulated asset holdings.
- [x] Wallet-approved native test BDX transfer and duplicate-request safeguards.
- [ ] Manual funded Wallet A → Wallet B native BDX chain-confirmed transaction, recipient credited.
- [ ] Privacy Token balance/asset inventory API available and integrated.

### Swap (highest priority)
- [x] User-facing quote, slippage and pool simulation.
- [x] Wallet-signed, verified **off-chain** swap proposal.
- [ ] Beldex-supported Privacy Token issue/balance/send operations for real testnet assets.
- [ ] Genuine token pairs funded on the Beldex testnet.
- [ ] Verified liquidity providers and a genuine executable quote/price.
- [ ] Atomic or enforceable trade settlement, or reviewed trust model with documented refund recovery.
- [ ] Wallet A and Wallet B perform a token-for-token exchange and independently reconcile output assets.
- [ ] Full test suite and privacy threat model, then relevant independent audit.

### Lending
- [x] User-facing accounting and local collateral/risk simulation.
- [x] Wallet-signed, verified **off-chain** lending proposal.
- [ ] Supported escrow or chain-executable custody that enforces loan principal/collateral.
- [ ] Actual interest/debt accounting backed by chain transactions.
- [ ] Oracles, collateralisation enforcement, liquidation and repayment.
- [ ] Two independent testnet wallets complete a loan lifecycle and collateral release.
- [ ] Independent economic review and smart-contract audit.

### Launch and Perps
- [x] Launch readiness shows live SDK wallet network, reported scan height and last wallet send state.
- [x] Perps remains a clearly labelled demo.
- [ ] Mark swap/lending contracts ready only after actual chain settlement and audits are verified.
- [ ] Production-grade observability, executable kill switches, security and compliance review.

## Required external dependencies

**Beldex SDK:** The current public @bdxi/web3js documented method list has `bdx_sendTransaction` for **native BDX**, but has no public methods for asset-specific Privacy Token transfer, asset balance, issuance or collateral smart-contract operations. We do not generate unsupported RPC requests or expose custodial deposit addresses. See Issue #3: https://github.com/mushee-io/Hoxo-MM/issues/3.

**Network execution:** Beldex's Privacy Token hard fork does not automatically provide general-purpose programmable EVM contract execution. Leveraged derivatives, interest-bearing lending and atomic token swaps need documented and demonstrated enforceable settlement primitives.

## Manual verification

1. Visit https://hoxo-mm-preview.vercel.app and connect a disposable Beldex **testnet** wallet.
2. Fund from https://faucet.beldex.dev. Use a second disposable testnet wallet to receive a small wallet-approved BDX transfer.
3. Confirm transaction through both wallets after inclusion; this is a native BDX transfer, **not a swap**.
4. Open Portfolio. Compare the real BDX balance, network and scan height against the wallet extension. Other assets shown are only virtual demo balances.
5. Open Swap and Lend. Try the clearly labelled **Sign proposed ... — no transaction** flows. Approve via extension and observe the verified signature. Check that neither wallet's balance changes as a result of signing.
6. Open Launch. Verify the connected wallet network is displayed but Swap, Lend, Perps and bridges still show outstanding mainnet/testnet execution gates.

**Do not use mainnet keys or money.** Do not hand wallet seeds or private view keys to this app. No automated unit test can substitute for a two-wallet testnet transfer using human wallet approval.
