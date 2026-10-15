/** Release gates are intentionally immutable until verified by engineers and
 * independent auditors. Passing a CI build never enables money movement. */
export type ReadinessGate = {
  id: string
  area: 'Integration' | 'Settlement' | 'Security' | 'Operations' | 'Compliance'
  label: string
  state: 'prototype' | 'blocked'
  requirement: string
}
export const READINESS_GATES: ReadonlyArray<ReadinessGate> = [
  { id: 'wallet', area: 'Integration', label: 'Beldex wallet connection', state: 'prototype', requirement: 'Read-only wallet connection is integrated; confirm production SDK support and testnet flows' },
  { id: 'routing', area: 'Integration', label: 'Swap and routing', state: 'prototype', requirement: 'Only browser-local swaps and simulated multi-hop quotes exist' },
  { id: 'perps', area: 'Settlement', label: 'Perpetual risk and execution', state: 'blocked', requirement: 'On-chain settlement, oracle validation, escrow and liquidation keepers must be developed and audited' },
  { id: 'lending', area: 'Settlement', label: 'Lending markets', state: 'blocked', requirement: 'Enforceable contracts, liquidity, interest indexes and collateral liquidation are missing' },
  { id: 'bridges', area: 'Integration', label: 'Cross-chain bridge adapters', state: 'blocked', requirement: 'Deployments, allowlists, trust assumptions, exact addresses and integration tests are unverified' },
  { id: 'private-tokens', area: 'Settlement', label: 'Beldex privacy token transactions', state: 'blocked', requirement: 'Testnet issuance, transfer flow and privacy guarantees must be validated end-to-end' },
  { id: 'audit', area: 'Security', label: 'Independent security audit', state: 'blocked', requirement: 'Independent review, remediation and re-test of all custody and settlement components' },
  { id: 'controls', area: 'Security', label: 'Production kill switches', state: 'blocked', requirement: 'Authenticated, network-enforced control plane needed; demo local switch is not sufficient' },
  { id: 'operations', area: 'Operations', label: 'Monitoring and incident response', state: 'blocked', requirement: 'Deploy monitoring, alerting, backups, key management and recovery drills' },
  { id: 'legal', area: 'Compliance', label: 'Market and jurisdiction review', state: 'blocked', requirement: 'Assess derivatives, lending, cross-chain and privacy regulatory requirements before any public financial service' },
]
export function productionReadiness() {
  const blockers = READINESS_GATES.filter(g => g.state === 'blocked')
  return {
    previewDeployable: true,
    productionEnabled: false as const,
    blockers,
    prototypeCount: READINESS_GATES.filter(g => g.state === 'prototype').length,
    requiredChecks: READINESS_GATES.length,
  }
}
