import { ArrowLeftRight, ArrowRight, ArrowUpRight, BarChart3, Check, ChevronRight, Coins, ExternalLink, Landmark, LockKeyhole, ShieldCheck, Wallet, Zap } from 'lucide-react'
import './landing.css'

export type LandingDestination = 'Overview' | 'Testnet' | 'Swap' | 'Perps' | 'Lend' | 'Routes' | 'Portfolio' | 'Security' | 'Launch'

type Props = {
  onEnter: (destination?: LandingDestination) => void
}

const products = [
  { name: 'Swap', subtitle: 'Trade privately, by design', description: 'Explore token exchange and quotes with the HOXO swap simulator.', icon: ArrowLeftRight, destination: 'Swap' as const, className: 'swap' },
  { name: 'Lend', subtitle: 'Put assets to work', description: 'Explore collateral, borrowing and interest models in a demo market.', icon: Landmark, destination: 'Lend' as const, className: 'lend' },
  { name: 'Perps', subtitle: 'A sharper trading edge', description: 'Test long and short strategies in a risk-aware derivatives simulator.', icon: BarChart3, destination: 'Perps' as const, className: 'perps' },
  { name: 'Launch', subtitle: 'Build the ecosystem', description: 'Explore Beldex testnet asset discovery and integration readiness.', icon: Zap, destination: 'Launch' as const, className: 'launch' },
  { name: 'Portfolio', subtitle: 'Everything in one view', description: 'View your wallet-authorised BDX balance, separately from demo assets.', icon: Wallet, destination: 'Portfolio' as const, className: 'portfolio' },
]

export default function Landing({ onEnter }: Props) {
  return <div className="landing">
    <header className="landing-header">
      <div className="landing-header-inner">
        <a href="/" className="landing-brand" aria-label="HOXO homepage" onClick={event => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <span className="landing-brand-mark">H<span>✦</span></span>
          <span className="landing-wordmark">HOXO<span className="landing-brand-period">.</span><small>ON BELDEX</small></span>
        </a>
        <nav className="landing-header-links" aria-label="Homepage navigation">
          <a href="#ecosystem">Ecosystem</a>
          <a href="#approach">The approach</a>
          <a href="https://github.com/mushee-io/Hoxo-MM" target="_blank" rel="noreferrer">Docs <ExternalLink size={13}/></a>
        </nav>
        <button type="button" className="landing-nav-cta" onClick={() => onEnter('Overview')}>Enter App <ArrowUpRight size={16}/></button>
      </div>
    </header>

    <main>
      <section className="landing-hero">
        <div className="landing-background-grid" aria-hidden="true"/>
        <div className="landing-hero-glow" aria-hidden="true"/>
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <div className="landing-kicker"><span className="landing-pulse"/> A NEW FRONTIER FOR PRIVATE DEFI <span className="landing-kicker-divider"/> BELDEX ECOSYSTEM</div>
            <h1>Finance moves.<br/><em>Privacy stays.</em></h1>
            <p className="landing-hero-description">Welcome to HOXO — one destination to explore the future of private swaps, lending, perpetuals and onchain finance on Beldex.</p>
            <div className="landing-actions">
              <button type="button" className="landing-primary-btn" onClick={() => onEnter('Overview')}>Enter HOXO App <ArrowUpRight size={19}/></button>
              <a className="landing-outline-btn" href="#ecosystem">Explore ecosystem <ArrowRight size={18}/></a>
            </div>
            <div className="landing-hero-status"><ShieldCheck size={15}/><span>Research preview</span><i/> <span>Native BDX testnet transfers available</span></div>
          </div>
          <div className="landing-visual" aria-label="Illustration of the HOXO DeFi workspace">
            <div className="landing-orbit landing-orbit-one" aria-hidden="true"/>
            <div className="landing-orbit landing-orbit-two" aria-hidden="true"/>
            <div className="landing-window">
              <div className="landing-window-toolbar">
                <span className="landing-window-dots"><i/><i/><i/></span>
                <span>HOXO / WORKSPACE</span>
                <span className="landing-window-network"><span className="landing-pulse"/> BELDEX TESTNET</span>
              </div>
              <div className="landing-window-body">
                <div className="landing-window-title"><span><span className="landing-mini-mark">H</span><b>Your private DeFi gateway</b></span><LockKeyhole size={17}/></div>
                <p>Choose your destination</p>
                <div className="landing-window-items">
                  <button type="button" onClick={() => onEnter('Swap')}><span className="landing-window-icon teal"><ArrowLeftRight size={21}/></span><span><strong>Swap</strong><small>Explore asset exchange</small></span><ChevronRight size={18}/></button>
                  <button type="button" onClick={() => onEnter('Lend')}><span className="landing-window-icon blue"><Landmark size={21}/></span><span><strong>Lend</strong><small>Borrowing &amp; supply models</small></span><ChevronRight size={18}/></button>
                  <button type="button" onClick={() => onEnter('Perps')}><span className="landing-window-icon purple"><BarChart3 size={21}/></span><span><strong>Perpetuals</strong><small>Simulated long &amp; short</small></span><ChevronRight size={18}/></button>
                </div>
                <div className="landing-window-foot"><ShieldCheck size={15}/><span>Testnet BDX transfers are separate from demo trading.</span></div>
              </div>
            </div>
            <div className="landing-floating-chip landing-chip-top"><span className="landing-floating-icon"><LockKeyhole size={15}/></span> PRIVACY FIRST</div>
            <div className="landing-floating-chip landing-chip-bottom"><span className="landing-floating-icon"><Check size={15}/></span> NON-CUSTODIAL VISION</div>
          </div>
        </div>
        <div className="landing-hero-base">
          <span>ONE ECOSYSTEM. MULTIPLE POSSIBILITIES.</span>
          <div><span>SWAP</span><span className="landing-separator"/> <span>LEND</span><span className="landing-separator"/><span>PERPS</span><span className="landing-separator"/><span>PORTFOLIO</span></div>
        </div>
      </section>

      <section className="landing-products" id="ecosystem">
        <div className="landing-section-head"><div><div className="landing-eyebrow"><span/> THE HOXO ECOSYSTEM</div><h2>Everything you need.<br/><em>Connected in one place.</em></h2></div><p>One app, with dedicated spaces for every part of the HOXO ecosystem. Pick a product and go straight in.</p></div>
        <div className="landing-product-grid">
          {products.map(item => { const Icon = item.icon; return <button type="button" key={item.name} className={'landing-product-card ' + item.className} onClick={() => onEnter(item.destination)}>
            <span className="landing-product-top"><span className="landing-product-icon"><Icon size={23}/></span><ArrowUpRight size={20}/></span>
            <span className="landing-product-title">{item.name}</span>
            <span className="landing-product-subtitle">{item.subtitle}</span>
            <span className="landing-product-description">{item.description}</span>
            <span className="landing-product-link">Explore {item.name} <ArrowRight size={16}/></span>
          </button> })}
        </div>
      </section>

      <section className="landing-approach" id="approach">
        <div className="landing-approach-emblem"><span><LockKeyhole size={35}/></span><div className="landing-approach-ring"/></div>
        <div className="landing-approach-copy"><div className="landing-eyebrow"><span/> BUILT WITH PRIVACY IN MIND</div><h2>Control your assets.<br/><em>Explore your options.</em></h2><p>HOXO is being built around the Beldex ecosystem. The current release lets you explore our DeFi interfaces and test wallet-approved native BDX transfers on testnet while protocol settlement infrastructure is developed.</p><div className="landing-approach-points"><span><ShieldCheck size={16}/> Beldex ecosystem</span><span><Coins size={16}/> Testnet discovery</span><span><LockKeyhole size={16}/> Clear demo boundaries</span></div></div>
        <button type="button" className="landing-approach-btn" onClick={() => onEnter('Testnet')}>Explore Testnet <ArrowUpRight size={18}/></button>
      </section>

      <section className="landing-final">
        <span className="landing-eyebrow"><span/> YOUR ENTRY POINT</span>
        <h2>The future is yours to explore.</h2>
        <p>Start with the HOXO workspace and discover each product in one place.</p>
        <button type="button" className="landing-primary-btn" onClick={() => onEnter('Overview')}>Enter the App <ArrowUpRight size={19}/></button>
      </section>
    </main>

    <footer className="landing-footer"><div className="landing-footer-main"><span className="landing-wordmark">HOXO<span className="landing-brand-period">.</span></span><span>Privacy runs deep. Built for the Beldex ecosystem.</span><a href="https://github.com/mushee-io/Hoxo-MM" target="_blank" rel="noreferrer">GitHub <ExternalLink size={13}/></a></div><div className="landing-footer-disclaimer">© 2026 HOXO by Mushee · Research preview. Swap, Perps, Lend and Routes are demonstrations, not live financial products. Only explicitly approved native testnet BDX sends can broadcast actual testnet transfers. No real trades, loans or deposits.</div></footer>
  </div>
}
