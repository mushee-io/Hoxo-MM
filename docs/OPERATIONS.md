# HOXO Operations & Incident Runbook (Draft)

The current application is statically hosted and stores only fictitious financial state in the user's browser. It has no back-end vault, production matching engine, production liquidity or private transaction service.

## Preview release
- Run CI type-check, tests and build.
- Validate security headers, noindex status, and all legal/demo notices.
- Test Vite preview, Beldex connection/disconnection with a disposable test wallet, and all demo actions.
- Validate quote expiry and pause mode in a browser. Clear local storage to reset the demo.
- Monitor preview deployment errors and keep a tested rollback option.

## Incident classes
- **P0:** leaked credentials, wallet compromise, misleading live-funds UI, malicious script supply chain — halt deployment, revoke affected tokens, notify maintainers, preserve evidence, secure preview and inform users appropriately.
- **P1:** unsafe financial simulation accounting, stale/invalid route accepted, major wallet extension integration defect — remove or disable affected feature and fix with tests.
- **P2:** UI regressions, documentation errors, inaccessible layouts — triage into normal release workflow.

## Mainnet blockers
No real protocol emergency pause, service-level alerting, reconciliation, KMS/HSM key management, encrypted backups or staffed incident rotation has been implemented. None of these can be substituted by the current browser-only pause. Before mainnet, define owner approvals, release sign-off, incident contacts, escalation windows, blast-radius limits and disaster recovery targets.
