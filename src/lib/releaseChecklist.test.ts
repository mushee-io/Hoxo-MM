import { describe, expect, it } from 'vitest'
import { RELEASE_RESEARCH_CHECKS, RELEASE_CHECKLIST_STORAGE_KEY,
  readPersonalReviews, setPersonalReview, releaseResearchSummary } from './releaseChecklist'
import { assertCapabilityOperation } from './capabilities'
const store=()=>{
 const map=new Map<string,string>()
 return {getItem:(id:string)=>map.get(id)??null,setItem:(id:string,v:string)=>{map.set(id,v)},map}
}
describe('M20 checkboxes never confer settlement permissions',()=>{
 it('has unique evidence-based M18–M20 checks, with no claimed real execution',()=>{
  expect(new Set(RELEASE_RESEARCH_CHECKS.map(x=>x.id)).size).toBe(RELEASE_RESEARCH_CHECKS.length)
  expect(RELEASE_RESEARCH_CHECKS.every(x=>[18,19,20].includes(x.milestone))).toBe(true)
  expect(RELEASE_RESEARCH_CHECKS.filter(x=>x.mode==='external-gate').every(x=>!x.codeReady)).toBe(true)
  expect(releaseResearchSummary().productionApproved).toBe(false)
  expect(releaseResearchSummary().externallyVerifiedChecks).toBe(0)
 })
 it('allows self-attestation only on non-code review tasks and persists without secrets',()=>{
  const s=store()
  expect(setPersonalReview(s,'m20-audit',true)).toEqual(['m20-audit'])
  expect(readPersonalReviews(s)).toEqual(['m20-audit'])
  expect(s.map.get(RELEASE_CHECKLIST_STORAGE_KEY)).not.toContain('privateKey')
  expect(()=>setPersonalReview(s,'m20-ci',true)).toThrow()
  expect(setPersonalReview(s,'m20-audit',false)).toEqual([])
  s.setItem(RELEASE_CHECKLIST_STORAGE_KEY,JSON.stringify(['fake-item']))
  expect(readPersonalReviews(s)).toEqual([])
 })
 it('does not unlock margin, bridge or swap even if every manual item is ticked',()=>{
  const reviews=RELEASE_RESEARCH_CHECKS.filter(x=>x.mode==='external-gate').map(x=>x.id)
  const summary=releaseResearchSummary(reviews)
  expect(summary.manualReviewCount).toBe(summary.manualGates)
  expect(summary.productionApproved).toBe(false)
  for(const id of ['perps-settlement','bridge-settlement','lend-settlement','swap-settlement'] as const){
   expect(()=>assertCapabilityOperation(id,'settlement')).toThrow(/blocked/)
  }
 })
})
