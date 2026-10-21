# HOXO Bridge and Routing Matrix — Milestone 5

**State: research preview only.** HOXO has no deployed or configured bridge adapters, verified custody/settlement contracts, liquidity-provider inventory or live cross-chain execution paths.

| Network | Research use | HOXO execution | Data visibility |
| --- | --- | --- | --- |
| Beldex testnet | Wallet-authorised BDX balance reads; fictional local AMM quotes | Local simulation only | Native chain privacy does not hide IP/network metadata |
| BNB Smart Chain | Bridge integration candidate; Beldex publicly describes an external BSC bridge | Disabled — unverified for HOXO | Transparent activity on destination chain |
| Ethereum | Integration candidate | Disabled | Transparent account and transaction history |
| Base | Integration candidate | Disabled | Transparent account and transaction history |

**Do not conflate:** an externally available Beldex bridge does not establish that HOXO supports it or that it handles tokens, liquidity or approvals required by HOXO.

## Implementation delivered
- Deterministic route discovery for direct pair and optional two-hop swap via demo USDT.
- Estimate and rank local AMM paths using the same mutable local pool reserves as HOXO Swap.
- Apply a quote TTL (30 seconds), maximum illustrative notional ($10k) and final minimum-output check.
- Execute all local legs only after validation and commit results atomically to browser state; failing routes do not persist partial updates.
- Return **no route** for cross-chain destinations instead of fabricating a bridge quote.
- Display the confidentiality boundary clearly in the Routes UI.

## Requirements before enabling a bridge
1. Verify source and destination chain identifiers, deployed bridge contracts, registry addresses and supported assets with official maintainers.
2. Document custodial or multisig assumptions, required confirmations/finality, relayer controls and emergency recoveries.
3. Verify audits and threat models of bridge implementation, fraud/timeout handling and refund execution.
4. Introduce a server-verified quote protocol, replay protection, source/destination balance reconciliation and per-route limits.
5. Implement failure recovery tests and independent review. Only then enable user-approved external transactions.

Sources:
- https://beldex.io/blog/privacy-tokens-live-on-beldex-testnet
- https://www.beldex.io/blog/beldex-stealthex-ama-recap

## M19 trust review

The new bridgeResearch.ts and HOXO Routes panel provide a bounded note-only incident/timeout/refund review. No actual bridge integration has been verified. [M18–20 checklist](M18_M20_FINAL_CHECKLIST.md).
