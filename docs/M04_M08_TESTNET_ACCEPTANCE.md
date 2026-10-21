# HOXO-MM testnet acceptance: Milestones 4–8
**Status:** source implemented and mock-tested; manual wallet evidence outstanding. Updated 21 October 2026.

## What a CI success means
- Source compiles, tests pass with mock wallets, and frontend bundles successfully.
- CI cannot install or unlock the user's Beldex extension, authorise a real send, or establish independent on-chain confirmation.
- M4, M5 and M6 therefore remain **partial**, M7 and M8 **blocked** pending the public Beldex SDK asset methods.

## M4: native BDX transfers
1. Use two **disposable TESTNET** Beldex extension wallets, A and B, under your control. Never submit seed phrases or view/spend keys to HOXO.
2. Confirm A is on testnet, its balance is **fully synced**, and it has adequate faucet-funded BDX; send only a small test amount.
3. In HOXO Testnet, A must not be able to send to itself, from mainnet, with an approximate/unknown balance, or without a preliminary 0.01-test-BDX fee reserve.
4. Confirm wallet prompt **independently** shows intended recipient B, amount and actual fee. The 0.01 BDX buffer is *not* a fee estimate.
5. Approve; capture transaction hash **privately** and independently verify wallet B received the expected amount after wallet sync and chain confirmation.
6. Reject one approval and verify no new transaction was broadcast.
7. Repeat testing wrong-address, insufficient funds, wallet account changed while approval pending, and unexpected fee.

## M5: recovery and concurrency
1. In two same-origin HOXO tabs, start a wallet send; a second tab must fail to acquire the exclusive Web Lock before another approval.
2. Reload the initiating tab during a simulated wallet timeout; the unresolved localStorage guard must persist. **Do not send again.**
3. Confirm the transaction in the Beldex extension wallet, not solely from the browser or public explorer.
4. If SDK provides an operation ID, run status lookup with the **same connected testnet account**.
5. Test a wallet switch during/after wallet approval; the app must retain the pending guard rather than falsely declaring failure.
6. Reconcile manually and unlock only after the user has determined the outcome; never auto-retry with a new key.

## M6: official public Privacy Token metadata
1. Check \`/api/health?probe=1\`, \`/api/testnet-tokens\`, and \`/api/testnet-token?id=<exact64hex>\` on the deployed domain.
2. Inspect a real Privacy Token ID from the wallet's registration UI; lookup must return the exact same ID, ticker, precision and supply from the public LWS.
3. Verify malformed IDs, bad decimals, duplicate list entries, altered network/source and inconsistent metadata are rejected.
4. Test LWS outage, 404 and timeout paths without hallucinating asset metadata or zero balances.
5. Test bookmarks in Portfolio; the stored value must be **only the public token ID**. Never present it as owned or funded.

## M7: SDK blocker
The published \`bdx-web3js\` v1 dApp method list includes \`bdx_getBalance\` and \`bdx_sendTransaction\` for **native BDX only**. Internal extension \`get_token_balances\` uses \`view_key\` and is **NOT an acceptable web dApp route**.

- Required from Beldex: reviewed extension/dApp methods for Privacy Token authorised balance, issuance, transfer and status, including explicit origin permissions and redaction of sensitive keys.
- Until published, \`src/lib/privacyAssetAdapter.ts\` must fail closed and \`src/lib/privacyCapabilities.ts\` must report unsupported.
- Issue tracker: https://github.com/mushee-io/Hoxo-MM/issues/3

## M8: actual asset portfolio blocker
- Native BDX total/unlocked, scan height and sync state are read from the authorised wallet. Disconnect/account switch removes stale connection data.
- Browser-only bookmarks are **public metadata**, not owned Privacy Tokens. No fake balance from public supply; no synthetic token price from the demo.
- Once M7 exists: enable wallet-scoped Privacy Token inventory via the approved SDK, re-read upon network/account switches, test two-wallet ownership, verify no view key leaves the extension.

## Public source references
- https://github.com/Beldex-Coin/bdx-web3js/blob/main/docs/PROTOCOL.md
- https://github.com/Beldex-Coin/beldex-wallet-extension/blob/main/src/lib/dappProtocol.ts
- https://github.com/Beldex-Coin/beldex-wallet-extension/blob/main/src/lib/tokenApi.ts

**Release rule:** never mark M4 or M5 E2E-complete without funded wallets and independent receipt evidence; never mark M7 or M8 complete until documented wallet Privacy Token functionality exists and is exercised.
