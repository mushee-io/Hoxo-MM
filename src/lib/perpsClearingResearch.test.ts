import { describe, expect, it } from 'vitest'
import { emptyPaperClearing, fundPaperAccount, openMatchedPaperPerps,
  applyPaperFunding, closeMatchedPaperPerps, assertPaperClearingInvariant,
  refusePaperPerpsSettlement } from './perpsClearingResearch'
const now=1793000000000
const usd=(value:number)=>BigInt(value)*100000000n
const px=(value:number, observed=now)=>({priceUsdE8:usd(value),observedAtMs:observed,source:'research-fixture' as const})
const opened=()=>{
  let v=fundPaperAccount(emptyPaperClearing(),'paper-long',usd(1000))
  v=fundPaperAccount(v,'paper-short',usd(1000))
  return openMatchedPaperPerps(v,'paper-long','paper-short','match-0001',usd(100),5,px(200),now)
}
describe('M18 matched perp paper clearing with zero-sum invariants',()=>{
  it('opens equal opposite positions and tracks reserved margin conservatively',()=>{
    const start=opened()
    expect(start.positions.map(p=>p.side)).toEqual(['long','short'])
    expect(start.balances['paper-long'].availableUsdE8).toBe(usd(900))
    expect(start.injectedUsdE8).toBe(usd(2000))
    assertPaperClearingInvariant(start)
    expect(()=>refusePaperPerpsSettlement()).toThrow(/no real/)
    expect(()=>openMatchedPaperPerps(start,'paper-long','paper-short','match-0001',usd(100),5,px(200),now)).toThrow(/duplicate/)
  })
  it('charges funding to longs or shorts as a zero-sum transfer',()=>{
    const start=opened()
    const v=applyPaperFunding(start,'match-0001',10)
    expect(v.balances['paper-long'].availableUsdE8).toBe(usd(899)+usd(1)/2n)
    expect(v.balances['paper-short'].availableUsdE8).toBe(usd(900)+usd(1)/2n)
    expect(v.balances['paper-long'].fundingUsdE8+v.balances['paper-short'].fundingUsdE8).toBe(0n)
    assertPaperClearingInvariant(v)
    expect(()=>applyPaperFunding(start,'match-0001',101)).toThrow()
  })
  it('closes both paper positions with zero-sum realised P&L and no minted funds',()=>{
    const initial=opened()
    const end=closeMatchedPaperPerps(initial,'match-0001',px(210),now)
    expect(end.positions).toHaveLength(0)
    expect(end.balances['paper-long'].realisedPnlUsdE8).toBe(usd(25))
    expect(end.balances['paper-short'].realisedPnlUsdE8).toBe(-usd(25))
    expect(end.balances['paper-long'].availableUsdE8).toBe(usd(1025))
    expect(end.balances['paper-short'].availableUsdE8).toBe(usd(975))
    assertPaperClearingInvariant(end)
    expect(initial.positions).toHaveLength(2)
  })
  it('refuses bankrupt matched settlement and stale prices instead of making fake insurance',()=>{
    const v=opened()
    expect(()=>closeMatchedPaperPerps(v,'match-0001',px(300),now)).toThrow(/bankruptcy/)
    expect(()=>closeMatchedPaperPerps(v,'match-0001',px(200,now-70000),now)).toThrow(/stale/)
    expect(()=>openMatchedPaperPerps(v,'paper-long','paper-short','match-0002',usd(2000),5,px(200),now)).toThrow(/insufficient/)
    expect(()=>openMatchedPaperPerps(v,'paper-long','paper-long','match-0002',usd(100),5,px(200),now)).toThrow()
  })
})
