# HOXO — Beldex Grants Program Proposal

**Applicant:** Mushee · **Project:** HOXO · **Status:** Research prototype and native BDX testnet SDK integration, not a production exchange · **Grant request:** **USD $100,000 indicative, milestone-based** · **Prepared:** 15 October 2026

**Public source:** https://github.com/mushee-io/Hoxo-MM  
**Existing prototype:** https://hoxo-mm-preview.vercel.app/ (may be access-protected; reviewers can always inspect source and tests)  
**Organisation:** https://mushee.xyz  
**Beldex programme:** https://www.beldex.io/grants

## Executive summary

HOXO is a privacy-first DeFi initiative being built for the Beldex ecosystem, inspired by the integrated user experience of Bluefin. Its long-term product suite comprises **HOXO Swap, HOXO Perps and HOXO Lend**, with shared routing, account and risk interfaces. Its defining objective is to reduce unnecessary exposure of trading, liquidity and borrowing activity while preserving enforceable settlement and verifiable risk controls.

Mushee has already created a public React/TypeScript HOXO prototype covering swaps, leveraged positions, collateral lending, portfolio views, simulated liquidity routing, an operational risk dashboard and launch readiness. HOXO also integrates the official Beldex Web3JS SDK for user-authorised wallet connection and a **testnet-only native BDX transaction request**; it includes safeguards for incorrect networks, incomplete wallet state, manual approval and uncertain transaction outcomes. These are genuine code integrations, but a **funded two-wallet testnet transaction has not yet been independently executed and verified** in the project demonstration.

Importantly, the Swap/Perps/Lend trading engines remain **simulations**, not live decentralised financial contracts. HOXO does **not** currently issue or transfer Beldex Privacy Tokens, guarantee trade confidentiality, bridge assets, hold customer funds or offer production financial services. Beldex's published Web3JS SDK currently documents native BDX operations but not a public Privacy Token issuance/transfer API. The grant would fund the engineering and Beldex collaboration needed to progress from a functioning prototype to verifiable Beldex-native private-asset exchange and, where network execution capabilities allow, broader DeFi products.

## Problem

DeFi participants must often navigate disconnected swap, lending and derivatives venues, while on-chain transaction histories expose positions, wallet relationships and strategy metadata. Beldex already provides a privacy-oriented chain and newly launched testnet Privacy Tokens, but development teams require end-user applications, dependable wallet and asset integrations, liquidity and settlement tooling to turn these capabilities into practical DeFi workflows.

## Proposed solution

1. **HOXO Swap — first production candidate:** integrate supported Beldex Privacy Token APIs, confidential-asset wallets, testnet asset transfers and liquidity quotes. Develop verifiable swap settlement, with explicit atomicity or trust assumptions and safe refund/failure states.
2. **HOXO Perps — gated research and pilot:** develop matching, collateral accounting, funding, risk and liquidation components; only enable real testnet positions after chain-executable escrow/settlement, robust oracles, economic review and legal safeguards exist.
3. **HOXO Lend — gated research and pilot:** design supply, borrow, repayment, health-factor and liquidation accounting, moving to real testnet pools only with enforceable collateral custody, oracles and audited protocols.
4. **Shared infrastructure:** privacy-aware route discovery, testnet-compatible Beldex wallet integration, external bridge due diligence, transaction reconciliation, risk controls, technical documentation and security testing.

## Existing code and evidence

- Application and dashboard: responsive React/Vite/TypeScript frontend.
- Swap: fictional stateful AMM, quote and slippage simulation with repeat-trade reserve updates.
- Perps: simulated long/short isolated margin, liquidation-aware closure and risk caps.
- Lend: simulated lending and borrowing with health factors, interest projection and risk-reducing actions.
- Routing: direct and two-hop illustrative routes; unsupported cross-chain transfers disabled.
- Beldex: official wallet SDK connection, native BDX testnet-only send interface, exact integer denomination, user approval, wallet-signature demonstration and send ambiguity recovery.
- Privacy Tokens: typed **non-operational** integration adapter that refuses unsupported calls.
- CI: TypeScript checks, unit tests and application build tested in GitHub Actions.
- Release: project threat model, security controls, launch-blocker dashboard and operating/testing guides.

This demonstrates implementation readiness; it is **not** evidence that protocol settlement, Privacy Token transfers, live markets or independent audits have been completed.

## Requested milestones and indicative funding

| Milestone | New grant-funded work and evidence | Indicative budget |
| --- | --- | ---: |
| 1. Privacy Token integration | Validate two-wallet native BDX transfer; obtain Beldex-supported Privacy Token issue/balance/transfer methods; integrate wallet asset registry and complete two-wallet Privacy Token testnet transactions | $10,000 |
| 2. HOXO Swap settlement | Build privacy-asset RFQ/quote system, supported asset liquidity, user-approved testnet swaps, verifiable settlement/refund and integration tests | $20,000 |
| 3. HOXO Perps pilot | Build testnet collateral accounting, oracle validation, matching/position accounting and liquidation test harness; make execution contingent on enforceable Beldex primitives | $20,000 |
| 4. HOXO Lend pilot | Develop auditable testnet pool, collateral, interest and liquidation proof of concept, contingent on supported custody/settlement primitives | $15,000 |
| 5. Routing and interoperability | Verify bridge contracts/adapters with Beldex maintainers, route reconciliation, failure recovery and transparent privacy disclosures | $15,000 |
| 6. Security and economics | Independent first-phase security review, threat-model remediation, stress/invariant tests, protocol-fee accounting and operational safeguards | $15,000 |
| 7. Testnet pilot and release preparation | Documented public testnet pilot, developer examples, test reports, partner/onboarding and mainnet readiness criteria | $5,000 |
| **Total** | **Negotiable, phased grant; scope may be adjusted with Beldex engineering guidance** | **$100,000** |

**Funding is requested for future work**, not retrospectively for the existing interface prototypes. Indicative allocations do not assert that a full independent audit of all markets or a commercial-scale mainnet release can be completed for $100,000.

## Delivery sequencing and dependencies

The next deliverable is a **verified testnet BDX wallet-to-wallet transfer**, followed by supported **Privacy Token issuance and transfer integration**. Confidential-asset swap settlement is the highest-priority financial product after that. Perpetuals and lending are downstream gated milestones, not promises of immediate on-chain deployment: they require execution primitives, collateral enforcement, price oracles, liquidation and risk audit. If Beldex EVM-compatible programmability remains unavailable, grant scopes should be reprioritised to Privacy Token transactions, secure swap infrastructure, wallet SDK contributions and audited settlement research until execution support is mature.

No real-money custody, mainnet payment rails, unverified bridges or unaudited derivatives contracts will be launched as part of an unreviewed prototype.

## Privacy and security approach

- Keep keys and sensitive wallet data inside user-controlled Beldex wallet software.
- Use native UTXO privacy where supported; separately assess application metadata, service logs, liquidity-counterparty visibility and external-chain transparency.
- Enforce testnet network checks and wallet approvals; preserve ambiguous transaction outcomes against blind retries.
- Store the minimum information required for operations and debugging, not confidential transaction metadata by default.
- Use independent review and explicit chain-side settlement/risk controls before any non-simulated DeFi release.
- Assess legal and regulatory conditions for lending and leveraged trading before enabling real financial services.

## Why Beldex benefits

HOXO would supply concrete wallet/Privacy Token developer integrations, reusable test cases and documentation, a consumer-oriented private swap interface, and a path to additional DeFi protocols. It would help identify integration gaps early, provide feedback to Beldex maintainers and demonstrate how privacy-native asset infrastructure can support practical financial applications.

## Requested Beldex support

1. Confirmed testnet Privacy Token developer documentation, wallet/CLI/API methods, test asset IDs and wallet extension compatibility.
2. Direct technical guidance on atomic or otherwise enforceable exchange settlement and network programmability roadmap.
3. Developer review of proposed privacy architecture, settlement threat assumptions and funding milestones.
4. Testnet resources and access to relevant SDK maintainers to close integration gaps.

**Requested outcome:** An agreed milestone-based grant and technical collaboration, with priority on a verifiable Beldex-native confidential-asset Swap pilot, followed by gated Perps and Lend infrastructure.

> **Submission integrity:** A grant decision is not guaranteed. This proposal does not claim completed Privacy Token issuance, funded testnet transactions, independent audits or production financial deployment. Applicant contact details and team size belong in the official form, not this public repository.
