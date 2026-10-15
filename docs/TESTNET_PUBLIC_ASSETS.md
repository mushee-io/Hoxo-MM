# HOXO — Public Beldex Testnet Privacy Token Discovery

Updated: 15 October 2026. **Read-only public data**, not a trading protocol.

## Network implementation evidence

The [official Beldex Extension Wallet](https://github.com/Beldex-Coin/beldex-wallet-extension) has native HF22 Privacy Token features in its **Tokens** screen. Its `src/lib/tokenApi.ts` implements public `POST /get_token_list` and `POST /get_token_info` calls using the configured testnet LWS `https://lwstestapi.rpcnode.stream`. Its `src/lib/networks.json` identifies the testnet endpoint. Token registration and sends are supported **inside the extension**, but `src/lib/dappProtocol.ts` exposes only BDX methods to external websites; token-specific dApp requests are not implemented in the official public protocol.

HOXO now includes two **public-metadata-only** Vercel endpoints:

| Endpoint | Purpose | Privacy considerations |
| --- | --- | --- |
| `GET /api/testnet-tokens?offset=0` | Calls public LWS `/get_token_list`, then `/get_token_info` for up to six token IDs | No wallet address, key, balance or payment parameters accepted |
| `GET /api/testnet-token?id=<64 hex>` | Retrieves one Privacy Token's public descriptor from the same LWS | Only public hex token ID is accepted; no wallet keys |

Both use a pinned HTTPS LWS URL, no user-configured target hosts, bounded timeouts and responses, input validation and clear failures when the registry cannot be queried. A successful upstream HTTP result is **not** independent blockchain verification. Responses are informational, not executable quotes.

## UI
- **Swap:** show published Privacy Token identifiers and verify one official-wallet-created token ID. Existing swaps remain simulated and wallet signatures are non-executable intents.
- **Lend:** show potential Beldex token metadata, but no actual supplied balance or collateral.
- **Portfolio:** preserve wallet-authorised real BDX total/unlocked balances; show public token catalog **separately** from personal holdings.
- **Launch:** show live public token-registry availability and the official wallet's Tokens → Register token workflow. HOXO does not independently issue tokens.

## A testable launch path with the official wallet
1. Install the [Beldex Extension Wallet](https://github.com/Beldex-Coin/beldex-wallet-extension) and select **TESTNET**.
2. Obtain test BDX using the [Beldex faucet](https://faucet.beldex.dev).
3. Inside the extension, open **Tokens**, choose **Register token**, supply token details and approve the registration if the wallet supports it on the active testnet service.
4. After confirming in the wallet, copy the created **64-character token ID**. Paste it into the HOXO Launch page's token lookup. This verifies public testnet LWS metadata **only when** the endpoint responds.
5. Verify any token send directly through the wallet extension's native Tokens interface. HOXO must **not** claim to have sent the token or updated the user's private balance.

## Unmet acceptance conditions
- [ ] Live testnet BDX Wallet A → Wallet B transaction manually approved and reconciled
- [ ] Successful public token catalogue response from deployed API (depends on LWS availability)
- [ ] Real Beldex Privacy Token transfer approved inside official wallet, recipient balance confirmed
- [ ] Extension and Web3JS expose wallet-authorised token balances and transfers safely to HOXO
- [ ] Liquidity partner quote and enforceable asset-for-asset settlement/refund path for real Swap
- [ ] Enforceable custody, interest, collateral and liquidation for real Lend
- [ ] Independent audit and economic review
- [x] Perps clearly kept as demo

**Financial safety:** No real swaps, lending markets or cross-chain routes have been enabled. BDX and token operations must be reviewed in the official wallet and only run on testnet. HOXO has no custodial escrow or private view-key access.

## Commands
```sh
npm install
npm run typecheck
npm test
npm run build
```
Vercel deploys `api/*.ts` as serverless functions; a plain local Vite dev server will not run those endpoints. Check the deployed `/api/testnet-tokens` route for a `200` validated result or explicit `503` outage; **never fabricate fallback tokens**.
