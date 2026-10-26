import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import Landing from './Landing'

const html=renderToStaticMarkup(<Landing onEnter={()=>{}}/>)

describe('HOXO orbital cinematic homepage',()=>{
  it('renders original HOXO branding with no abandoned template content',()=>{
    expect(html).toContain('HOXO')
    expect(html).toContain('ON BELDEX')
    expect(html).toContain('Finance in')
    expect(html).toContain('new orbit.')
    expect(html).not.toContain('Boomerang')
    expect(html).not.toContain('Mostar')
    expect(html).not.toContain('Book A Demo')
  })

  it('uses reliable self-contained SVG and CSS art instead of broken remote images',()=>{
    expect(html).toContain('hoxo-orbit-sphere')
    expect(html).toContain('hoxo-orbit-ring-outer')
    expect(html).toContain('hoxo-orbit-line')
    expect(html).toContain('hoxo-grid-surface')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('raft-blast-61784561')
  })

  it('contains four cinematic chapters with linked app destinations',()=>{
    expect(html).toContain('hoxo-scene-hero')
    expect(html).toContain('hoxo-scene-wallet')
    expect(html).toContain('hoxo-scene-markets')
    expect(html).toContain('hoxo-scene-explore')
    expect(html).toContain('Primary navigation')
    expect(html).toContain('Explore Testnet')
    expect(html).toContain('Launch App')
    expect(html).toContain('Previous feature')
    expect(html).toContain('Next feature')
    expect((html.match(/aria-label="Go to chapter/g)||[])).toHaveLength(4)
  })

  it('describes testnet availability truthfully and labels upcoming markets',()=>{
    expect(html).toContain('native BDX testnet tools')
    expect(html).toContain('no invented balances')
    expect(html).toContain('NO SIMULATED BALANCES')
    expect(html).toContain('MARKETS IN DEVELOPMENT')
    expect(html).toContain('not live trading services')
    for(const section of ['Swap','Perpetuals','Lending','Routes']){
      expect(html).toContain(section)
    }
  })
})
