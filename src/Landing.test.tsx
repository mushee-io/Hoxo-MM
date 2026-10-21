import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import Landing, { LogoIcon } from './Landing'

const home = renderToStaticMarkup(<Landing onEnter={() => undefined}/>)

describe('Halo / USD Halo premium marketing homepage', () => {
  it('renders provided Halo mark using currentColor without any third-party UI kit', () => {
    const logo=renderToStaticMarkup(<LogoIcon className="halo-h-7 halo-w-7"/>)
    expect(logo).toContain('viewBox="0 0 256 256"')
    expect(logo).toContain('fill="currentColor"')
    expect(logo).toContain('128.005 191.173')
  })
  it('renders all four requested sections in order with functional wallet destination', () => {
    const hero=home.indexOf('Your Wealth')
    const info=home.indexOf('Meet USD Halo.')
    const backers=home.indexOf('Funded by premier partners')
    const commerce=home.indexOf('Commerce</h3>')
    expect(hero).toBeGreaterThan(-1)
    expect(info).toBeGreaterThan(hero)
    expect(backers).toBeGreaterThan(info)
    expect(commerce).toBeGreaterThan(backers)
    expect(home).toContain('Open Wallet')
    expect(home).toContain('Join us')
    expect(home).toContain('Discover it')
    expect(home).toContain('Know more')
  })
  it('has the two source video URLs, autoplay and mobile-safe playback', () => {
    expect(home).toContain('hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4')
    expect(home).toContain('hf_20260423_183428_ab5e672a-f608-4dcb-b319-f3e040f02e2d.mp4')
    expect((home.match(/autoplay=""/g)??[]).length).toBe(2)
    expect((home.match(/playsinline=""/g)??[]).length).toBe(2)
    expect((home.match(/muted=""/g)??[]).length).toBe(2)
  })
  it('duplicates brand marquees, uses CSS animation and discloses brand-use limitations', () => {
    expect((home.match(/Coinbase/g)??[]).length).toBe(2)
    expect((home.match(/Fundamental Labs/g)??[]).length).toBe(2)
    expect(home).toContain('halo-marquee 22s linear infinite')
    expect(home).toContain('halo-backers-marquee 30s linear infinite')
    expect(home).toContain('no funding, backing or endorsement is claimed')
    expect(home).toContain('Stablecoin issuance, reserves, redemptions, yields and peg are not verified')
  })
  it('includes navigation targets and has no simulator controls', () => {
    for(const id of ['network','ecosystem','rewards','help']){
      expect(home).toContain('id="'+id+'"')
      expect(home).toContain('href="#'+id+'"')
    }
    expect(home).not.toContain('Simulate swap')
    expect(home).not.toContain('FakeChart')
  })
})
