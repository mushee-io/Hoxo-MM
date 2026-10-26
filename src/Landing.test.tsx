import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import Landing from './Landing'

const html=renderToStaticMarkup(<Landing onEnter={()=>{}}/>)

describe('HOXO cinematic Beldex homepage',()=>{
  it('uses HOXO and Beldex branding instead of the previous template',()=>{
    expect(html).toContain('HOXO')
    expect(html).toContain('ON BELDEX')
    expect(html).toContain('HOXO cinematic Beldex homepage')
    expect(html).not.toContain('Boomerang')
    expect(html).not.toContain('Book A Demo')
    expect(html).not.toContain('Conversational AI')
  })
  it('renders the layered cinematic scene with the correct document order',()=>{
    for(const role of ['sky-img','back-four','back-bazaar','splitframe-left','splitframe-right','bridge-img','frame-two-img','shade']){
      expect(html).toContain(role)
    }
    expect(html.indexOf('sky-img')).toBeLessThan(html.indexOf('back-four'))
    expect(html.indexOf('back-four')).toBeLessThan(html.indexOf('back-bazaar'))
    expect(html.indexOf('back-bazaar')).toBeLessThan(html.indexOf('hero-title'))
    expect(html.indexOf('hero-title')).toBeLessThan(html.indexOf('bridge-img'))
    expect(html.indexOf('bridge-img')).toBeLessThan(html.indexOf('frame-two-img'))
    expect(html.indexOf('frame-two-img')).toBeLessThan(html.indexOf('class="shade"'))
    expect(html).toContain('class="intro-copy"')
    expect(html).toContain('story-panel-bridge')
    expect(html).toContain('story-panel-bazaar')
  })
  it('provides five real feature cards repeated in three carousel sets',()=>{
    expect((html.match(/class="sight-card"/g)||[])).toHaveLength(15)
    expect(html).toContain('data-sight-index="5"')
    expect(html).toContain('data-sight-index="14"')
    for(const name of ['Overview','Beldex Testnet','Swap','Perpetuals','Security']){
      expect(html).toContain('Open '+name+' section')
    }
    expect(html).toContain('Previous feature')
    expect(html).toContain('Next feature')
  })
  it('describes only live BDX testnet tools and clearly labels upcoming markets',()=>{
    expect(html).toContain('native BDX testnet transfers')
    expect(html).toContain('wallet data is never simulated')
    expect(html).toContain('in development')
    expect(html).toContain('Explore HOXO')
    expect(html).toContain('Open HOXO app')
  })
})
