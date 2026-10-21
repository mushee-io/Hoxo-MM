import { describe, expect, it } from 'vitest'
import { LIVE_PAGES, LIVE_PRODUCT_CAPABILITIES, livePageForPath } from './liveNavigation'
import { assertCapabilityOperation } from './capabilities'
describe('Real-wallet-only HOXO application navigation',()=>{
  it('exposes only the requested pages and no simulated financial routes',()=>{
    expect(LIVE_PAGES).toHaveLength(9)
    expect(new Set(LIVE_PAGES).size).toBe(9)
    expect(LIVE_PAGES.map(x=>livePageForPath('/app/'+x.toLowerCase()))).toEqual(LIVE_PAGES)
    expect(LIVE_PAGES.map(x=>x.toLowerCase())).toEqual(['overview','testnet','swap','perps','lend','routes','portfolio','security','launch'])
    expect(livePageForPath('/app/swap')).toBe('Swap')
    expect(livePageForPath('/app/perps')).toBe('Perps')
    expect(livePageForPath('/app/portfolio')).toBe('Portfolio')
    expect(livePageForPath('/')).toBeNull()
    expect(livePageForPath('/app')).toBe('Overview')
    expect(Object.values(LIVE_PRODUCT_CAPABILITIES).every(x=>!x.active)).toBe(true)
  })
  it('never allows any disabled financial operation through source guard',()=>{
    for(const id of ['swap-settlement','perps-settlement','lend-settlement','bridge-settlement'] as const)
      expect(()=>assertCapabilityOperation(id,'settlement')).toThrow(/blocked/)
  })
})
