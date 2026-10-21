/**
 * M20 launch / research checklist. A checkbox set by a visitor is ONLY
 * a local attestation. It NEVER changes verified release gates, wallet
 * capabilities or LIVE_SETTLEMENT_ENABLED. No custody can be unlocked here.
 */
export type ResearchChecklistItem = Readonly<{
  id: string
  milestone: 18 | 19 | 20
  label: string
  evidence: string
  mode: 'code-observed' | 'external-gate'
  codeReady: boolean
}>
export const RELEASE_RESEARCH_CHECKS: readonly ResearchChecklistItem[] = Object.freeze([
  {id:'m18-match',milestone:18,label:'Matched paper orders enforce opposite sides and equal notional',
    evidence:'perpsClearingResearch.ts + tests',mode:'code-observed',codeReady:true},
  {id:'m18-funding',milestone:18,label:'Funding is a zero-sum paper accounting transfer',
    evidence:'Funding and conservation regression tests',mode:'code-observed',codeReady:true},
  {id:'m18-liq',milestone:18,label:'Research rejects stale prices and bankrupt settlement',
    evidence:'Perps risk kernel and bankruptcy rejection tests',mode:'code-observed',codeReady:true},
  {id:'m18-custody',milestone:18,label:'Audited testnet margin escrow, liquidation and oracle installed',
    evidence:'Requires external Beldex execution primitive and independent review',mode:'external-gate',codeReady:false},
  {id:'m18-e2e',milestone:18,label:'Funded two-wallet perp open, funding, close and forced liquidation verified',
    evidence:'Missing on-chain receipts and human E2E record',mode:'external-gate',codeReady:false},
  {id:'m19-matrix',milestone:19,label:'Bridge routes report zero verified deployed integrations',
    evidence:'bridgeResearch.ts fail-closed matrix and negative tests',mode:'code-observed',codeReady:true},
  {id:'m19-timeout',milestone:19,label:'Local bridge-state model covers timeout, disputes and refund notes',
    evidence:'Bridge research state-machine tests (NOT actual refunds)',mode:'code-observed',codeReady:true},
  {id:'m19-adapters',milestone:19,label:'Bridge contracts, custody and relayer deployments independently verified',
    evidence:'Missing trusted contract addresses, permissions and audit',mode:'external-gate',codeReady:false},
  {id:'m19-e2e',milestone:19,label:'Cross-chain funds and refunds reconciled on both chains',
    evidence:'Missing funded end-to-end bridge receipts',mode:'external-gate',codeReady:false},
  {id:'m20-ci',milestone:20,label:'Automated tests, TypeScript, Vite build and production dependency audit',
    evidence:'GitHub Actions .github/workflows/ci.yml',mode:'code-observed',codeReady:true},
  {id:'m20-gates',milestone:20,label:'Settlement is disabled independently of checklist state',
    evidence:'capabilities.ts fail-closed runtime guard and regression tests',mode:'code-observed',codeReady:true},
  {id:'m20-policy',milestone:20,label:'Public security policy and incident/runbook drafts documented',
    evidence:'SECURITY.md, docs/OPERATIONS.md, docs/RELEASE.md',mode:'code-observed',codeReady:true},
  {id:'m20-audit',milestone:20,label:'Third-party security and economic audits signed off',
    evidence:'Independent reports and remediation proof not provided',mode:'external-gate',codeReady:false},
  {id:'m20-operations',milestone:20,label:'Live monitoring, incident rotation, tested backups and recovery drills',
    evidence:'Service operator evidence not provided',mode:'external-gate',codeReady:false},
  {id:'m20-legal',milestone:20,label:'Legal and jurisdiction-specific derivatives/lending review completed',
    evidence:'Professional legal review not provided',mode:'external-gate',codeReady:false},
  {id:'m20-release',milestone:20,label:'Production launch authorised with independently confirmed settlement',
    evidence:'Blocked: testnet settlement and external evidence missing',mode:'external-gate',codeReady:false},
].map(x=>Object.freeze(x)))

export const RELEASE_CHECKLIST_STORAGE_KEY='hoxo-m18-m20-personal-review-v1'
const MANUAL_IDS = new Set(RELEASE_RESEARCH_CHECKS.filter(c=>c.mode==='external-gate').map(c=>c.id))
export function readPersonalReviews(storage: Pick<Storage,'getItem'>): string[] {
  try {
    const raw=storage.getItem(RELEASE_CHECKLIST_STORAGE_KEY)
    if(!raw) return []
    const ids:unknown=JSON.parse(raw)
    if(!Array.isArray(ids)||ids.length>MANUAL_IDS.size||ids.some(id=>typeof id!=='string'||!MANUAL_IDS.has(id))||
      new Set(ids).size!==ids.length)return []
    return [...ids]
  }catch{return []}
}
export function setPersonalReview(storage: Pick<Storage,'getItem'|'setItem'>, id:string, done:boolean): string[] {
  if(!MANUAL_IDS.has(id)) throw new Error('Only external/manual review items may be self-attested')
  const previous=new Set(readPersonalReviews(storage))
  if(done) previous.add(id); else previous.delete(id)
  const updated=[...previous].sort()
  storage.setItem(RELEASE_CHECKLIST_STORAGE_KEY,JSON.stringify(updated))
  return updated
}
export function releaseResearchSummary(personalReviews: readonly string[] = []) {
  const codeChecks=RELEASE_RESEARCH_CHECKS.filter(x=>x.mode==='code-observed')
  const external=RELEASE_RESEARCH_CHECKS.filter(x=>x.mode==='external-gate')
  const personalCount=external.filter(x=>personalReviews.includes(x.id)).length
  return {
    implementedCodeChecks:codeChecks.filter(x=>x.codeReady).length,
    codeChecks:codeChecks.length,manualReviewCount:personalCount,manualGates:external.length,
    externallyVerifiedChecks:0 as const,
    productionApproved:false as const,
  }
}
