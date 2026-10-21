import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import Landing, { LogoIcon } from './Landing'

const rendered = renderToStaticMarkup(<Landing onEnter={()=>{}}/>)

describe('Boomerang full-viewport pixel-specific homepage',()=>{
  it('renders the exact SVG logo geometry and brand wordmark',()=>{
    const logo=renderToStaticMarkup(<LogoIcon className="halo-h-6 halo-w-6 halo-text-[#191919]"/>)
    expect(logo).toContain('viewBox="0 0 256 256"')
    expect(logo).toContain('fill="currentColor"')
    expect(logo).toContain('M 144 256 L 27.598 256 L 144 139.598 Z M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z M 0 204.402 L 0 112 L 92.402 112 Z')
    expect(rendered).toContain('Boomerang')
  })
  it('renders one fullscreen composition with prescribed heading, subcopy and panel',()=>{
    expect(rendered).toContain('Build lasting<br/>relationships.')
    expect(rendered).toContain('Conversational AI platform for modern financial institutions — agents that handle the full borrower lifecycle across email, SMS, and voice.')
    expect(rendered).toContain('WHAT DO WE DO?')
    expect(rendered).toContain('Conversations that')
    expect(rendered).toContain('build momentum')
    expect(rendered).toContain('Conversational AI built for regulated financial institutions. Agents that hold a real conversation, plug into the systems you run, and show their work.')
    expect(rendered).toContain('halo-h-screen')
    expect(rendered).toContain('halo-mt-auto')
    expect(rendered).toContain('halo-border-b-0')
  })
  it('renders fixed transparent nav and exact link labels and hrefs',()=>{
    expect(rendered).toContain('halo-fixed')
    for(const [label,link] of [['Product','#product'],['Solutions','#solutions'],['Pricing','#pricing'],['Company','#company']]){
      expect(rendered).toContain('href="'+link+'"')
      expect(rendered).toContain('>'+label+'</a>')
      expect(rendered).toContain('id="'+link.slice(1)+'"')
    }
    expect((rendered.match(/Book A Demo/g)??[])).toHaveLength(2)
  })
  it('renders precisely three interactive feature rows, not dashboard stats or cards',()=>{
    for(const label of ['01','02','03','Conversational','Connected','Compliant'])expect(rendered).toContain(label)
    expect((rendered.match(/halo-bg-\[#F4F3F3\]/g)??[])).toHaveLength(3)
    expect((rendered.match(/lucide-arrow-right/g)??[])).toHaveLength(3)
    expect(rendered).not.toContain('Savings that bloom')
    expect(rendered).not.toContain('Meet USD Halo')
    expect(rendered).not.toContain('Discover it')
    expect(rendered).not.toContain('FakeChart')
  })
})
