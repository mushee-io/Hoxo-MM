# HOXO security and responsible disclosure

**Status:** research prototype, no deposits, withdrawals, bridge execution, swaps, derivatives or borrowing with real assets.

Report potential security issues privately to the repository maintainers through GitHub's private vulnerability reporting feature if available. If unavailable, contact the Mushee project owners through an established private channel. Do **not** publish exploitable details, user information, seed phrases or private keys in public issues.

## Rules for contributors
- Never add private keys, seed phrases, view keys, API secrets or signing credentials to the frontend or repository.
- No trading, settlement, bridge or collateral functionality can be enabled by merely setting an environment variable; `assertLiveSettlementEnabled()` deliberately rejects execution.
- Do not assert real on-chain privacy based on a browser UI or testnet-only asset transfer.
- Wallet connection is user-authorised and independent of local demo balances.
- Real-money code requires independent cryptography, security and economic reviews, and verified deployment destinations.

## Threat model
See [docs/SECURITY_MODEL.md](docs/SECURITY_MODEL.md) and [docs/RELEASE.md](docs/RELEASE.md).

Maintainers should triage suspected compromise privately, stop exposing the affected UI/endpoint, and publish a security advisory after mitigation.
