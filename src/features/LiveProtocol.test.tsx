import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { LiveUnavailableProduct, LiveSecurityPage } from './LiveProtocol'
import { LIVE_PRODUCT_CAPABILITIES } from '../lib/liveNavigation'
import { assertCapabilityOperation } from '../lib/capabilities'

describe('HOXO wallet-only, non-fictional financial interface',()=>{
  for (const feature of ['Swap','Perps','Lend','Routes'] as const) {
    it('disables unsupported '+feature+' settlement instead of rendering a trade button',()=>{
      const html=renderToString(<LiveUnavailableProduct type={feature} onOpenWallet={()=>{}}/>)
      expect(html).toContain('SETTLEMENT UNAVAILABLE')
      expect(html).toContain(LIVE_PRODUCT_CAPABILITIES[feature].requirement)
      expect(html).not.toContain('Execute local simulation')
      expect(html).not.toContain('Simulate swap')
      expect(html).not.toContain('Place demo order')
    })
  }
  it('shows code-level settlement lock, not an ineffective local pause button',()=>{
    const html=renderToString(<LiveSecurityPage/>)
    expect(html).toContain('FINANCIAL SETTLEMENT OFF')
    expect(html).toContain('DISABLED')
    expect(html).not.toContain('Resume demo actions')
    for (const capability of ['swap-settlement','perps-settlement','lend-settlement','bridge-settlement'] as const)
      expect(()=>assertCapabilityOperation(capability,'settlement')).toThrow(/blocked/)
  })
})
