import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AlwayzzInside, ALWAYZZ_AVATAR_IMAGE, ALWAYZZ_HERO_IMAGE } from './AlwayzzInside'

const rendered=renderToStaticMarkup(<AlwayzzInside onNavigate={()=>{}}/>)

describe('Alwayzz inside app landing hero and interaction controls',()=>{
  it('preserves the provided marketing copy, wordmark, CTA and avatar source',()=>{
    expect(rendered).toContain('Alwayzz')
    expect(rendered).toContain('Premium creative')
    expect(rendered).toContain('<em>alwayzz</em><sup>®</sup> on demand.')
    expect(rendered).toContain('A flexible design partnership for founders, brands, and agencies who want top craft delivered on their timeline.')
    expect(rendered).toContain('View Plans')
    expect(rendered).toContain('Chat for 15 minutes')
    expect(rendered).toContain('Pick a slot')
    expect(rendered).toContain(ALWAYZZ_AVATAR_IMAGE)
    expect(ALWAYZZ_HERO_IMAGE).toBe('https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260626_041422_4a459e05-abce-4150-9fb7-4ededc423cd1.png&w=1280&q=85')
  })
  it('has a working collapsible full-screen menu with exactly five requested links',()=>{
    expect(rendered).toContain('aria-controls="alwayzz-menu-drawer"')
    expect(rendered).toContain('aria-expanded="false"')
    for(const label of ['Projects','Plans','Team','FAQs','Get in Touch']){
      expect(rendered).toContain('>'+label+'</a>')
    }
    expect(rendered).toContain('© 2026 Alwayzz. All rights reserved.')
    expect(rendered).toContain('alwayzz-drawer')
  })
  it('renders twenty left, twenty right and twenty responsive top decorative arcs',()=>{
    for(const kind of ['left','right','top']){
      const rx = new RegExp(kind==='top'?'alwayzz-top-line\\b':'alwayzz-side-line--'+kind+'\\b','g')
      expect((rendered.match(rx)??[]).length).toBe(20)
    }
    expect(rendered).toContain('animation-delay:4.75s')
    expect(rendered).toContain('--alwayzz-line-width:250px')
  })
  it('duplicates five services four times and ten company references twice',()=>{
    for(const service of ['Brand Identity','App Development','Visual Design','Creative Video','Iconography']){
      expect((rendered.match(new RegExp(service,'g'))??[])).toHaveLength(4)
    }
    for(const partner of ['Airbnb','Shopify','Notion','Linear','Webflow','Figma','Slack','Stripe','Vercel','Framer']){
      expect((rendered.match(new RegExp(partner,'g'))??[])).toHaveLength(2)
    }
    expect(rendered).toContain('illustrative design references')
  })
  it('uses no Tailwind utility classes and claims no booked appointment',()=>{
    expect(rendered).toContain('data-section="overview"')
    expect(rendered).not.toContain('halo-bg-')
    expect(rendered).not.toContain('Book A Demo')
    expect(rendered).not.toContain('Simulate')
    expect(rendered).not.toContain('Appointment confirmed')
  })
})
