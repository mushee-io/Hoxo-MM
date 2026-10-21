import { CHAINS, type ChainId } from './routes'
import { hexTokenId } from './testnetCatalogue'
import { assertCapabilityOperation } from './capabilities'

/**
 * M19: off-chain bridge risk and receipt tracking only.
 * No deployed HOXO bridge, chain adapter, custody address or settlement API.
 * User-provided 'evidence' is text and must NEVER be called a chain receipt.
 */
export type BridgeResearchStatus =
  | 'draft'
  | 'source-evidence-recorded'
  | 'destination-evidence-recorded'
  | 'refund-evidence-recorded'
  | 'timed-out'
  | 'disputed'
export type BridgeResearchRoute = Readonly<{
  id: string
  network: 'beldex-testnet'
  source: ChainId
  destination: ChainId
  assetId: string
  amountAtomic: bigint
  createdAt: number
  expiresAt: number
  status: BridgeResearchStatus
  notes: readonly string[]
  execution: 'disabled'
}>
const LIMIT = 60_000
const ID = /^[a-z0-9-]{8,64}$/
function validTime(t: number): boolean { return Number.isSafeInteger(t) && t>0 }

/** Only a draft. Explicitly rejects supposed same-network 'bridges'. */
export function draftBridgeResearch(input: {
  id: string; source: ChainId; destination: ChainId
  assetId: string; amountAtomic: bigint; expiresAt: number
}, now: number): BridgeResearchRoute {
  if(!ID.test(input.id) || !validTime(now) || !validTime(input.expiresAt) ||
     input.expiresAt<=now || input.expiresAt-now>LIMIT ||
     !Object.prototype.hasOwnProperty.call(CHAINS,input.source) ||
     !Object.prototype.hasOwnProperty.call(CHAINS,input.destination) ||
     input.source===input.destination || input.source!=='beldex-testnet' ||
     !hexTokenId(input.assetId) ||
     typeof input.amountAtomic!=='bigint' || input.amountAtomic<=0n ||
     input.amountAtomic.toString().length>40){
    throw new Error('Unsupported or unsafe Beldex cross-chain research draft')
  }
  return Object.freeze({id:input.id,network:'beldex-testnet',source:input.source,
    destination:input.destination,assetId:input.assetId.toLowerCase(),
    amountAtomic:input.amountAtomic,createdAt:now,expiresAt:input.expiresAt,
    status:'draft',notes:[],execution:'disabled'})
}
export function recordBridgeResearchEvidence(
  route: BridgeResearchRoute,
  next: BridgeResearchStatus,
  statement: string,
  now: number,
): BridgeResearchRoute {
  if(route.execution!=='disabled' || !validTime(now) || now<route.createdAt ||
     route.notes.length>=8 || statement.length<10 || statement.length>200 ||
     /[\u0000-\u001f\u007f]/.test(statement)) {
    throw new Error('Invalid bridge research evidence')
  }
  const allowed: Record<BridgeResearchStatus,readonly BridgeResearchStatus[]> = {
    draft:['source-evidence-recorded','timed-out','disputed'],
    'source-evidence-recorded':['destination-evidence-recorded','timed-out','disputed'],
    'destination-evidence-recorded':['disputed'],
    'timed-out':['refund-evidence-recorded','disputed'],
    'refund-evidence-recorded':['disputed'],
    disputed:[],
  }
  if(!allowed[route.status].includes(next) ||
    (next!=='disputed' && next!=='timed-out' && next!=='refund-evidence-recorded' && now>route.expiresAt) ||
    (next==='timed-out' && now<=route.expiresAt)){
    throw new Error('Invalid, premature or expired bridge research state transition')
  }
  return Object.freeze({...route,status:next,notes:[...route.notes,statement]})
}
export function assessBridgeReadiness(route: BridgeResearchRoute): {
  available:false;independentlyVerified:false;onchainReceipts:0;reason:string
} {
  if(route.execution!=='disabled')throw new Error('Unsupported live bridge status')
  return {
    available:false,independentlyVerified:false,onchainReceipts:0,
    reason:'Beldex/external bridge adapters, custody, refund logic and both chain confirmations are not independently verified. Text notes are not receipt proofs.',
  }
}
export function executeBridgeResearch(_route: BridgeResearchRoute): never {
  assertCapabilityOperation('bridge-settlement','settlement')
  throw new Error('No verified cross-chain route exists')
}
/** Explicit source/destination trust matrix — not a catalogue of real deployments. */
export const BRIDGE_RESEARCH_NETWORKS=Object.freeze(
  (Object.keys(CHAINS) as ChainId[]).map(id=>Object.freeze({
    id,label:CHAINS[id].label,adapterDeployed:false,
    externalConfirmationsVerified:false,custodyAudited:false,refundVerified:false,
  }))
)
