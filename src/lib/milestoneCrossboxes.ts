import { MILESTONES, type Milestone } from './milestones'

/**
 * Distinguishes three entirely different concepts:
 * - Code evidence: a research foundation / guard is present in source,
 *   including for BLOCKED workstreams; this does not mean a live protocol.
 * - Acceptance: the canonical MILESTONES state is 'implemented'.
 * - Personal review: a checkbox the current browser's visitor ticks; never
 *   grants capabilities, changes release state or constitutes third-party proof.
 */
export const MILESTONE_REVIEW_STORAGE = 'hoxo-milestones-01-20-personal-review-v1'

export type MilestoneEvidence = Readonly<{
  number: number
  codePath: string
  researchFoundationPresent: true
  liveAcceptanceMet: boolean
}>
const SOURCE_BY_MILESTONE: readonly string[] = Object.freeze([
  'src/lib/capabilities.ts',
  'api/health.ts',
  'src/hooks/useBeldexWallet.ts',
  'src/lib/nativeTransfer.ts',
  'src/lib/transferSafety.ts',
  'src/lib/testnetCatalogue.ts',
  'src/lib/privacyAssetAdapter.ts',
  'src/lib/publicAssetWatchlist.ts',
  'src/lib/tokenRegistration.ts',
  'src/lib/privateTransferReview.ts',
  'src/lib/researchOrders.ts',
  'src/lib/researchRfq.ts',
  'src/lib/spotResearch.ts',
  'src/features/ProtocolLabs.tsx',
  'src/lib/researchLendingVault.ts',
  'src/lib/researchLendingVault.ts',
  'src/lib/researchOracle.ts',
  'src/lib/perpsClearingResearch.ts',
  'src/lib/bridgeResearch.ts',
  'src/lib/releaseChecklist.ts',
])

export const MILESTONE_CROSSBOXES: readonly MilestoneEvidence[] = Object.freeze(
  MILESTONES.map((milestone, i) => Object.freeze({
    number: milestone.number,
    codePath: SOURCE_BY_MILESTONE[i],
    researchFoundationPresent: true as const,
    liveAcceptanceMet: milestone.state === 'implemented',
  }))
)

export const MILESTONE_PHASES = Object.freeze([
  { label: '1–5 · Core and native testnet BDX', start: 1, end: 5 },
  { label: '6–10 · Privacy Token integration', start: 6, end: 10 },
  { label: '11–14 · Orders, RFQ and spot', start: 11, end: 14 },
  { label: '15–17 · Collateral, lending and oracles', start: 15, end: 17 },
  { label: '18–20 · Perps, bridge and release', start: 18, end: 20 },
] as const)

const validMilestone = (n: unknown): n is number =>
  Number.isInteger(n) && typeof n === 'number' && n >= 1 && n <= 20

export function readMilestoneReviews(storage: Pick<Storage, 'getItem'>): number[] {
  try {
    const raw = storage.getItem(MILESTONE_REVIEW_STORAGE)
    if (!raw) return []
    const entries: unknown = JSON.parse(raw)
    if (!Array.isArray(entries) || entries.length > MILESTONES.length ||
      entries.some(n => !validMilestone(n)) || new Set(entries).size !== entries.length) return []
    return [...entries].sort((a: number, b: number) => a - b)
  } catch { return [] }
}
export function writeMilestoneReview(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  number: number, reviewed: boolean
): number[] {
  if (!validMilestone(number)) throw new Error('Unknown HOXO development milestone')
  const checked = new Set(readMilestoneReviews(storage))
  if (reviewed) checked.add(number)
  else checked.delete(number)
  const next = [...checked].sort((a, b) => a - b)
  storage.setItem(MILESTONE_REVIEW_STORAGE, JSON.stringify(next))
  return next
}
export function clearMilestoneReviews(storage: Pick<Storage, 'setItem'>): number[] {
  storage.setItem(MILESTONE_REVIEW_STORAGE, '[]')
  return []
}
export function crossboxOverview(reviewed: readonly number[] = []) {
  const accepted = MILESTONE_CROSSBOXES.filter(entry => entry.liveAcceptanceMet).length
  const foundations = MILESTONE_CROSSBOXES.filter(entry => entry.researchFoundationPresent).length
  const personal = new Set(reviewed.filter(validMilestone)).size
  return {
    total: MILESTONES.length,
    researchFoundations: foundations,
    fullyAccepted: accepted,
    acceptanceOutstanding: MILESTONES.length - accepted,
    personallyReviewed: personal,
    externallyVerifiedByCheckbox: 0 as const,
    productionFinancialServicesEnabled: false as const,
  }
}

/** Extra isolation against accidentally deriving any settlement permission from user review. */
export function isMilestoneReleaseAccepted(milestone: Milestone, _personalReviews: readonly number[]): boolean {
  return milestone.state === 'implemented'
}
