import { assertResearchPrice, type ResearchPrice } from './riskResearch'
export type ResearchOracleObservation=Readonly<{provider:string;priceUsdE8:bigint;observedAtMs:number;mode:'fixture'}>
export type ResearchOracleConsensus=Readonly<{
  price:ResearchPrice;observations:number;maximumDeviationBps:bigint;execution:'research-only'
}>
/**
 * M17: reproducible multi-provider fixture consensus, NOT an authenticated
 * onchain oracle. Missing sources, stale prices or divergence fail closed.
 */
export function researchOracleConsensus(
  observations:readonly ResearchOracleObservation[],now:number,
  maxAgeMs=60_000,maxDeviationBps=500,
):ResearchOracleConsensus{
  if(!Number.isSafeInteger(now)||now<=0||
     !Number.isSafeInteger(maxAgeMs)||maxAgeMs<1||
     !Number.isInteger(maxDeviationBps)||maxDeviationBps<1||maxDeviationBps>1000||
     observations.length<3||observations.length>16){
    throw new Error('Research oracle requires 3–16 bounded independent fixtures')
  }
  const names=new Set<string>()
  for(const row of observations){
    if(!/^[A-Za-z0-9._-]{3,64}$/.test(row.provider)||names.has(row.provider)||
       row.mode!=='fixture')throw new Error('Untrusted or duplicate research oracle source')
    names.add(row.provider)
    assertResearchPrice({priceUsdE8:row.priceUsdE8,observedAtMs:row.observedAtMs,source:'research-fixture'},now,maxAgeMs)
  }
  const sorted=[...observations].sort((a,b)=>a.priceUsdE8<b.priceUsdE8?-1:a.priceUsdE8>b.priceUsdE8?1:0)
  const m=Math.floor(sorted.length/2)
  const median=sorted.length%2?sorted[m].priceUsdE8:(sorted[m-1].priceUsdE8+sorted[m].priceUsdE8)/2n
  let maxDeviation=0n
  for(const row of sorted){
    const deviation=(row.priceUsdE8>median?row.priceUsdE8-median:median-row.priceUsdE8)*10000n/median
    if(deviation>maxDeviation)maxDeviation=deviation
  }
  if(maxDeviation>BigInt(maxDeviationBps))throw new Error('Research oracle sources disagree beyond the safe threshold')
  return {price:{priceUsdE8:median,observedAtMs:Math.min(...observations.map(x=>x.observedAtMs)),source:'research-fixture'},
    observations:observations.length,maximumDeviationBps:maxDeviation,execution:'research-only'}
}
