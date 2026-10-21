import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import type { useBeldexWallet } from '../hooks/useBeldexWallet'
import { SwapSection } from './SwapSection'
import { PerpsSection } from './PerpsSection'
import { LendSection } from './LendSection'
import { RoutesSection } from './RoutesSection'
import { LiveSecurityPage } from './LiveProtocol'
import { assertCapabilityOperation } from '../lib/capabilities'

const wallet = { connection: null } as unknown as ReturnType<typeof useBeldexWallet>
describe('HOXO has separate non-simulated sections for every financial product',()=>{
  it('opens a dedicated Swap section with public Beldex token discovery',()=>{
    const html=renderToString(<SwapSection wallet={wallet} onOpenTestnet={()=>{}}/>)
    expect(html).toContain('data-section="swap"')
    expect(html).toContain('Swap execution')
    expect(html).toContain('Asset discovery')
    expect(html).toContain('Beldex testnet public Privacy Token catalogue')
    expect(html).toContain('TRADING UNAVAILABLE')
    expect(html).not.toContain('Simulate swap')
    expect(html).not.toContain('Place order')
  })
  it('opens a separate Perps section with custody and oracle readiness',()=>{
    const html=renderToString(<PerpsSection wallet={wallet} onOpenTestnet={()=>{}}/>)
    expect(html).toContain('data-section="perps"')
    expect(html).toContain('Margin and custody')
    expect(html).toContain('Pricing and liquidation')
    expect(html).toContain('MARKETS NOT OPEN')
    expect(html).not.toContain('Open long')
    expect(html).not.toContain('FakeChart')
  })
  it('opens a separate Lend section for supply, borrow and collateral safety',()=>{
    const html=renderToString(<LendSection wallet={wallet} onOpenTestnet={()=>{}}/>)
    expect(html).toContain('data-section="lend"')
    expect(html).toContain('Supply and withdraw')
    expect(html).toContain('Borrow and repay')
    expect(html).toContain('Collateral risk')
    expect(html).toContain('LENDING UNAVAILABLE')
    expect(html).not.toContain('Simulate borrow')
  })
  it('opens a separate Routes section with unverified adapter directory',()=>{
    const html=renderToString(<RoutesSection/>)
    expect(html).toContain('data-section="routes"')
    expect(html).toContain('Select prospective destination')
    expect(html).toContain('Verified destination status')
    expect(html).toContain('BRIDGING UNAVAILABLE')
    expect(html).toContain('NO TRANSFER POSSIBLE')
    expect(html).not.toContain('Simulate route')
  })
  it('preserves source-controlled settlement safety independently of navigation',()=>{
    const html=renderToString(<LiveSecurityPage/>)
    expect(html).toContain('FINANCIAL SETTLEMENT OFF')
    expect(html).toContain('DISABLED')
    for(const feature of ['swap-settlement','lend-settlement','perps-settlement','bridge-settlement'] as const) {
      expect(()=>assertCapabilityOperation(feature,'settlement')).toThrow(/blocked/)
    }
  })
})
