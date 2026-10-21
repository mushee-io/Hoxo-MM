import { describe, expect, it } from 'vitest'
import { inspectRfqDraft } from './researchRfq'
import { SpotResearchBook, rankComparableResearchQuotes, simulateResearchAtomicSwap } from './spotResearch'
const now=1_797_100_000_000, a='a'.repeat(64), b='b'.repeat(64)
const quote=(suffix:string,out='200')=>inspectRfqDraft({
  network:'beldex-testnet',quoteId:'12345678-1234-4234-8234-'+suffix,
  makerLabel:'Research Maker',fromAssetId:a,toAssetId:b,amountInAtomic:'100',
  expectedOutAtomic:out,minimumOutAtomic:'180',expiresAtMs:now+30000,
},now)
describe('M11–M14 safe research spot order pipeline',()=>{
  it('rejects duplicate review, unauthorized cancellation, expiry and all execution',()=>{
    const book=new SpotResearchBook(), q=quote('123456789abc')
    expect(book.create('research-wallet',q,now).settlement).toBe('disabled')
    expect(()=>book.create('research-wallet',q,now)).toThrow(/repeated/)
    expect(()=>book.cancel(q.quoteId,'someone-else',now)).toThrow()
    expect(book.cancel(q.quoteId,'research-wallet',now).state).toBe('cancelled')
    expect(()=>book.settle(q.quoteId)).toThrow(/cannot execute/)
    const second=new SpotResearchBook();second.create('research-wallet',q,now)
    expect(second.get(q.quoteId,now+30000)?.state).toBe('expired')
    expect(()=>second.cancel(q.quoteId,'research-wallet',now+30001)).toThrow()
  })
  it('ranks only comparable same-size quotes without phantom liquidity',()=>{
    const q=quote('123456789abc'), higher=quote('abcdef012345','220')
    expect(rankComparableResearchQuotes([q,higher],now).map(x=>x.quoteId)).toEqual([higher.quoteId,q.quoteId])
    expect(()=>rankComparableResearchQuotes([q,q],now)).toThrow(/Duplicate/)
    expect(()=>rankComparableResearchQuotes([q],now+40000)).toThrow(/stale/)
    expect(()=>rankComparableResearchQuotes([q,{...higher,amountInAtomic:200n}],now)).toThrow(/incomparable/)
  })
  it('simulates two-sided conservation atomically without mutating either input ledger',()=>{
    const q=quote('123456789abc')
    const balances={taker:{[a]:100n,[b]:2n},maker:{[a]:7n,[b]:300n}}
    const saved=JSON.stringify(balances,(_k,v)=>typeof v==='bigint'?v.toString():v)
    const result=simulateResearchAtomicSwap(balances,q,190n,now)
    expect(result.settlement).toBe('simulated-only')
    expect(result.balances.taker[a]).toBe(0n)
    expect(result.balances.taker[b]).toBe(192n)
    expect(result.balances.maker[a]).toBe(107n)
    expect(result.balances.maker[b]).toBe(110n)
    expect(JSON.stringify(balances,(_k,v)=>typeof v==='bigint'?v.toString():v)).toBe(saved)
    expect(()=>simulateResearchAtomicSwap(balances,q,179n,now)).toThrow(/minimum/)
    expect(()=>simulateResearchAtomicSwap({...balances,maker:{[a]:7n,[b]:100n}},q,190n,now)).toThrow(/Insufficient/)
    expect(()=>simulateResearchAtomicSwap(balances,q,190n,now+30000)).toThrow(/expired/)
  })
})
