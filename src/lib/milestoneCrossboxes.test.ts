import { describe, expect, it } from 'vitest'
import { MILESTONES } from './milestones'
import { assertCapabilityOperation } from './capabilities'
import { MILESTONE_CROSSBOXES, MILESTONE_PHASES, MILESTONE_REVIEW_STORAGE,
  crossboxOverview, readMilestoneReviews, writeMilestoneReview,
  clearMilestoneReviews, isMilestoneReleaseAccepted } from './milestoneCrossboxes'

const storage=()=>{
  const map=new Map<string,string>()
  return {
    getItem:(key:string)=>map.get(key)??null,
    setItem:(key:string,text:string)=>{map.set(key,text)},
    map,
  }
}
describe('All-20 evidence-based milestone crossboxes',()=>{
 it('covers each milestone exactly once with a real existing-source proof label',()=>{
  expect(MILESTONE_CROSSBOXES.map(x=>x.number)).toEqual(Array.from({length:20},(_,i)=>i+1))
  expect(MILESTONE_CROSSBOXES.every(x=>x.codePath.startsWith('src/')||x.codePath.startsWith('api/'))).toBe(true)
  expect(MILESTONE_CROSSBOXES.every(x=>x.researchFoundationPresent)).toBe(true)
  expect(MILESTONE_CROSSBOXES.filter(x=>x.liveAcceptanceMet).map(x=>x.number))
    .toEqual(MILESTONES.filter(x=>x.state==='implemented').map(x=>x.number))
  const members=MILESTONE_PHASES.flatMap(p=>Array.from({length:p.end-p.start+1},(_,i)=>p.start+i))
  expect(members).toEqual(Array.from({length:20},(_,i)=>i+1))
 })
 it('persists only bounded numeric personal review marks; corrupted data cannot become a review',()=>{
  const s=storage()
  expect(writeMilestoneReview(s,20,true)).toEqual([20])
  expect(writeMilestoneReview(s,1,true)).toEqual([1,20])
  expect(writeMilestoneReview(s,1,true)).toEqual([1,20])
  expect(readMilestoneReviews(s)).toEqual([1,20])
  expect(writeMilestoneReview(s,20,false)).toEqual([1])
  expect(()=>writeMilestoneReview(s,21,true)).toThrow(/Unknown/)
  expect(()=>writeMilestoneReview(s,NaN,true)).toThrow()
  expect(()=>writeMilestoneReview(s,1.5,true)).toThrow()
  s.setItem(MILESTONE_REVIEW_STORAGE,JSON.stringify([1,1]))
  expect(readMilestoneReviews(s)).toEqual([])
  s.setItem(MILESTONE_REVIEW_STORAGE,JSON.stringify(['1']))
  expect(readMilestoneReviews(s)).toEqual([])
  s.setItem(MILESTONE_REVIEW_STORAGE,'malformed')
  expect(readMilestoneReviews(s)).toEqual([])
  expect(clearMilestoneReviews(s)).toEqual([])
  expect(s.map.get(MILESTONE_REVIEW_STORAGE)).toBe('[]')
 })
 it('even 20 manually reviewed milestones cannot be recorded as complete or unlock live DeFi',()=>{
  const all=Array.from({length:20},(_,i)=>i+1)
  const status=crossboxOverview(all)
  expect(status.total).toBe(20)
  expect(status.researchFoundations).toBe(20)
  expect(status.personallyReviewed).toBe(20)
  expect(status.fullyAccepted).toBe(1)
  expect(status.externallyVerifiedByCheckbox).toBe(0)
  expect(status.productionFinancialServicesEnabled).toBe(false)
  for(const milestone of MILESTONES){
    expect(isMilestoneReleaseAccepted(milestone,all)).toBe(milestone.state==='implemented')
  }
  for(const feature of ['swap-settlement','lend-settlement','perps-settlement','bridge-settlement'] as const){
    expect(()=>assertCapabilityOperation(feature,'settlement')).toThrow(/blocked/)
  }
 })
})
