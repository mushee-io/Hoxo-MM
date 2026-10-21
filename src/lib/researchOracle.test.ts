import { describe, expect, it } from 'vitest'
import { researchOracleConsensus } from './researchOracle'
const now=1_797_100_000_000
const fixture=(name:string,price:number,t=now)=>({provider:name,priceUsdE8:BigInt(price)*100_000_000n,
  observedAtMs:t,mode:'fixture' as const})
const feed=[fixture('provider-a',100),fixture('provider-b',101),fixture('provider-c',99)]
describe('M17 oracle consensus research gating',()=>{
  it('uses a reproducible conservative median without claiming real feed validity',()=>{
    const result=researchOracleConsensus(feed,now)
    expect(result.price.priceUsdE8).toBe(100n*100_000_000n)
    expect(result.maximumDeviationBps).toBe(100n)
    expect(result.execution).toBe('research-only')
  })
  it('refuses one source, duplicates, stale, future, malicious or divergent reports',()=>{
    expect(()=>researchOracleConsensus(feed.slice(0,2),now)).toThrow()
    expect(()=>researchOracleConsensus([...feed.slice(0,2),{...feed[2],provider:'provider-a'}],now)).toThrow(/duplicate/)
    expect(()=>researchOracleConsensus([...feed.slice(0,2),fixture('provider-c',150)],now)).toThrow(/disagree/)
    expect(()=>researchOracleConsensus([...feed.slice(0,2),fixture('provider-c',100,now-61000)],now)).toThrow(/stale/)
    expect(()=>researchOracleConsensus([...feed.slice(0,2),fixture('provider-c',100,now+1)],now)).toThrow(/future/)
    expect(()=>researchOracleConsensus([...feed.slice(0,2),{...feed[2],mode:'live' as 'fixture'}],now)).toThrow(/Untrusted/)
  })
})
