import { describe, expect, it } from 'vitest'
import { draftBridgeResearch, recordBridgeResearchEvidence, assessBridgeReadiness,
  executeBridgeResearch, BRIDGE_RESEARCH_NETWORKS } from './bridgeResearch'
const now=1793000000000
const draft=()=>draftBridgeResearch({id:'bridge-research-001',source:'beldex-testnet',destination:'base',
  assetId:'a'.repeat(64),amountAtomic:1000000000n,expiresAt:now+30000},now)
describe('M19 non-executable cross-chain research state machine',()=>{
  it('allows only bounded notes, never treats notes as confirmed receipts',()=>{
    let r=draft()
    r=recordBridgeResearchEvidence(r,'source-evidence-recorded','Claimed source transaction pending independent verification',now+1000)
    r=recordBridgeResearchEvidence(r,'destination-evidence-recorded','Claimed destination transfer unverified',now+2000)
    expect(r.status).toBe('destination-evidence-recorded')
    expect(assessBridgeReadiness(r)).toMatchObject({available:false,independentlyVerified:false,onchainReceipts:0})
    expect(()=>executeBridgeResearch(r)).toThrow(/blocked/)
    expect(()=>recordBridgeResearchEvidence(r,'refund-evidence-recorded','Claimed refund after payout',now+3000)).toThrow()
  })
  it('models timeout/refund evidence paths without asserting real refunds',()=>{
    let r=draft()
    expect(()=>recordBridgeResearchEvidence(r,'timed-out','Bridge timed out',now+30000)).toThrow()
    r=recordBridgeResearchEvidence(r,'timed-out','Bridge expiry requires manual review',now+30001)
    r=recordBridgeResearchEvidence(r,'refund-evidence-recorded','The user reports refund to an external wallet',now+30002)
    expect(r.status).toBe('refund-evidence-recorded')
    expect(assessBridgeReadiness(r).available).toBe(false)
  })
  it('rejects unsupported networks, invalid assets and unchecked inputs',()=>{
    expect(()=>draftBridgeResearch({...draft(),destination:'beldex-testnet'},now)).toThrow()
    expect(()=>draftBridgeResearch({...draft(),source:'ethereum'},now)).toThrow()
    expect(()=>draftBridgeResearch({...draft(),assetId:'not-a-token'},now)).toThrow()
    expect(()=>draftBridgeResearch({...draft(),expiresAt:now+60001},now)).toThrow()
    expect(BRIDGE_RESEARCH_NETWORKS).toHaveLength(4)
    expect(BRIDGE_RESEARCH_NETWORKS.every(x=>!x.adapterDeployed&&!x.refundVerified)).toBe(true)
  })
})
