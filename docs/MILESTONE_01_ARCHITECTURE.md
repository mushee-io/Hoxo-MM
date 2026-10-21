# HOXO-MM — Milestone 1: Architecture and execution-boundary audit

**Implementation branch:** build/testnet-milestones-01-20  
**Scope:** Milestone 1 only. Do not interpret this document as completing Milestones 2–20.

## Current architecture (actual repository)

| Surface | Source | Trust boundary | Executable today? |
| --- | --- | --- | --- |
| Landing and workspace | \`src/Landing.tsx\`, \`src/App.tsx\` | Browser UI and navigation | Yes, UI only |
| BDX wallet reads | \`src/hooks/useBeldexWallet.ts\` | User-approved Beldex extension / \`@bdxi/web3js\` | Read supported wallet data |
| Native BDX sends | \`src/lib/nativeTransfer.ts\` | Actual testnet extension approval | SDK integration in code; funded two-wallet verification required |
| Public Privacy Token registry | \`api/testnet-token*.ts\`, \`src/lib/testnetCatalogue.ts\` | Public testnet light-wallet server only | Read public token descriptors; not personal holdings |
| Swap | \`src/lib/swap.ts\` | Mutable synthetic browser-local pools | Simulation only |
| Derivatives | \`src/lib/perps.ts\` | Synthetic price / browser positions | Simulation only |
| Lending | \`src/lib/lend.ts\`, \`src/lib/interest.ts\` | Synthetic debt and illustrative APY | Simulation only |
| Routing | \`src/lib/routes.ts\` | Synthetic direct and multi-hop paths | Simulation only |
| Signed intents | \`src/lib/testnetIntents.ts\` | Wallet-approved message signature | Off-chain proposal only; no settlement |
| Confidential asset SDK | \`src/lib/privacyAssetAdapter.ts\` | Missing public dApp wallet methods | Blocked |
| Release controls | \`src/lib/readiness.ts\`, \`src/lib/security.ts\` | Local policies and readiness markers | Not enforceable custody controls |

## M1 work delivered

1. \`src/lib/capabilities.ts\` defines the **single, typed, runtime capability catalogue**, separating wallet reads, native testnet BDX send, signed proposals, public reads, local simulations and non-existent DeFi settlement.
2. \`assertCapabilityOperation()\` enforces the **requested operation class at the call site**. All settlement capability IDs fail closed. Adding wallet connection or a UI toggle cannot enable Swap/Lend/Perps/Bridge execution.
3. \`src/lib/security.ts\` calls the capability guard on every demonstration action; local actions cannot be promoted to actual execution.
4. \`src/lib/nativeTransfer.ts\` checks the shared capability guard **again at the wallet-send boundary** after retrieving account/network and exact balance. Existing account checks, transaction locking and SDK approval remain intact.
5. The Launch workspace shows the central capability status alongside the existing production gates.
6. \`src/lib/capabilities.test.ts\` verifies unique definitions, all disabled settlement variants, account/network checks, synced-balance requirements, and separation of reads / wallet signatures / demo actions.
7. This document captures the audit and defines explicit follow-on engineering boundaries.

## API and identity contracts

- **Wallet account:** Beldex SDK is authoritative for network, address, balance, scan height and wallet approval. Do not treat website input or browser-local storage as proof of account ownership.
- **Asset identity:** Privacy Token ID is 64 hexadecimal characters. Token metadata is public; personal asset balances require a supported wallet-authorised protocol.
- **Financial quantities:** BDX transfer validation uses exact atomic units. Never reuse floating-point demo balances or arbitrary token labels for real transfers.
- **Signature:** Signed HOXO swap/loan proposals prove a wallet signed a message, not that a trade settled, a loan exists, or a service login is authenticated.
- **Settlement:** No executable on-chain spot exchange, derivatives, lending, collateral or bridge adapter exists. Live funds cannot be enabled by a frontend switch.
- **Response truthfulness:** Distinguish a wallet-returned hash from confirmed recipient receipt; distinguish public token descriptors from ownership and liquidity.

## Open findings and follow-on milestones

- **M2–M5:** Funded two-wallet real testnet BDX E2E, persistent operation reconciliation with wallet evidence, independent full-stack deployment tests.
- **M6:** \`src/features/TestnetAssets.tsx\` contains an over-escaped digit regex in the token-detail validation; correct it and add a regression test when implementing asset registry work.
- **M7/M10:** Beldex website-facing wallet protocol currently exposes BDX operations; support for Privacy Token website-initiated asset balance/send/issuance must come from supported upstream methods.
- **M11–M19:** Market-maker quotes, safe two-sided swap settlement, enforceable collateral, oracle price feed, liquidation, perps matching and bridge adapters are not present.
- **M20:** Independent custody/privacy/economic audit, monitoring, external integrations, incident response and legal review remain required.

## M1 verification checklist

- Run \`npm install && npm run typecheck && npm test && npm run build\`.
- Verify the GitHub Actions workflow passes for the implementation commit.
- Visit \`/app/launch\` to inspect the capability matrix. Offline and unsupported items must read as unavailable/demo.
- Visit Swap, Perps, Lend and Routes: actions must continue **only** mutating local demo data.
- Visit Testnet with mainnet connected: no native BDX send should be allowed.
- Connect Beldex testnet: approval remains necessary for native BDX sends; no Swap/Lend signature should be described as settlement.

**Milestone 1 completion means the core architecture is audited, capability boundaries are enforced and verified by automated tests. It does not claim a live financial market or independently confirmed wallet transfer.**
