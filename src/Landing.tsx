import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown,
  Menu, ShieldCheck, Wallet, X
} from 'lucide-react'
import './landing.css'

export type LandingDestination =
  | 'Overview' | 'Testnet' | 'Swap' | 'Perps' | 'Lend'
  | 'Routes' | 'Portfolio' | 'Security' | 'Launch'

type LandingProps = { onEnter: (destination?: LandingDestination) => void }

const MARKET_SECTIONS: { id: LandingDestination; number: string; label: string; description: string }[] = [
  { id: 'Swap', number: '01', label: 'Swap', description: 'A new home for asset exchange.' },
  { id: 'Perps', number: '02', label: 'Perpetuals', description: 'A framework for directional markets.' },
  { id: 'Lend', number: '03', label: 'Lending', description: 'A vision for more efficient capital.' },
  { id: 'Routes', number: '04', label: 'Routes', description: 'An easier way to move between markets.' },
]

const EXPLORE: { id: LandingDestination; number: string; label: string; eyebrow: string; description: string; className: string }[] = [
  { id: 'Overview', number: '01', label: 'Enter HOXO', eyebrow: 'START HERE', description: 'Discover the protocol workspace and what is available now.', className: 'card-violet' },
  { id: 'Testnet', number: '02', label: 'Beldex Testnet', eyebrow: 'GET CONNECTED', description: 'Explore wallet-controlled native BDX testnet tools.', className: 'card-cyan' },
  { id: 'Security', number: '03', label: 'Security', eyebrow: 'BUILT WITH CARE', description: 'Understand permissions, wallet controls and current limitations.', className: 'card-ink' },
  { id: 'Swap', number: '04', label: 'Swap', eyebrow: 'IN DEVELOPMENT', description: 'See the roadmap for decentralized asset exchange.', className: 'card-violet' },
  { id: 'Perps', number: '05', label: 'Perpetuals', eyebrow: 'IN DEVELOPMENT', description: 'Explore planned markets and risk-aware trading.', className: 'card-cyan' },
]

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

function OrbitArtwork() {
  return <div className="hoxo-orbit" aria-hidden="true">
    <div className="hoxo-orbit-glow" />
    <div className="hoxo-orbit-ring hoxo-orbit-ring-outer" />
    <div className="hoxo-orbit-ring hoxo-orbit-ring-inner" />
    <div className="hoxo-orbit-sphere">
      <div className="hoxo-orbit-shine" />
      <div className="hoxo-orbit-latitude latitude-a" />
      <div className="hoxo-orbit-latitude latitude-b" />
      <div className="hoxo-orbit-latitude latitude-c" />
      <div className="hoxo-orbit-shade" />
    </div>
    <div className="hoxo-orbit-sweep" />
    <div className="hoxo-orbit-spark spark-one" />
    <div className="hoxo-orbit-spark spark-two" />
    <div className="hoxo-orbit-spark spark-three" />
    <div className="hoxo-floating-label hoxo-floating-label-top">
      <span className="hoxo-label-symbol">✳</span>
      <span>MADE FOR THE <b>BELDEX NETWORK</b></span>
    </div>
    <div className="hoxo-floating-label hoxo-floating-label-bottom">
      <span className="hoxo-signal"><i /><i /><i /><i /><i /></span>
      <span>ONCHAIN, ON YOUR TERMS</span>
    </div>
    <svg className="hoxo-orbit-line" viewBox="0 0 920 720" fill="none" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="hoxoLineGradient" x1="0" y1="0" x2="920" y2="720">
          <stop offset="0" stopColor="#8CF4F2" stopOpacity="0" />
          <stop offset=".35" stopColor="#8CF4F2" stopOpacity=".8" />
          <stop offset=".75" stopColor="#B79AFF" stopOpacity=".85" />
          <stop offset="1" stopColor="#B79AFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M58 520C190 530 229 393 336 407C467 423 467 270 589 285C720 304 759 188 865 170" stroke="url(#hoxoLineGradient)" strokeWidth="2" />
      <circle cx="336" cy="407" r="5" fill="#9BE8FF" />
      <circle cx="589" cy="285" r="5" fill="#C0ACFF" />
      <circle cx="589" cy="285" r="12" stroke="#C0ACFF" strokeOpacity=".35" />
    </svg>
  </div>
}

function HoxoMark() {
  return <span className="hoxo-mark" aria-hidden="true">
    <span /><span /><span /><span />
  </span>
}

export default function Landing({ onEnter }: LandingProps) {
  const storyRef = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)
  const [cardIndex, setCardIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const story = storyRef.current
    if (!story) return
    let animationFrame = 0
    let previousStep = -1
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      animationFrame = 0
      const distance = Math.max(1, story.offsetHeight - window.innerHeight)
      const progress = clamp((window.scrollY - (story.getBoundingClientRect().top + window.scrollY)) / distance)
      const nextStep = Math.min(3, Math.floor(progress * 4))
      story.style.setProperty('--story-progress', String(progress))
      story.style.setProperty('--scene-drift', String(motion.matches ? 0 : progress * 76))
      if (nextStep !== previousStep) {
        previousStep = nextStep
        setStep(nextStep)
      }
    }
    const requestUpdate = () => { if (!animationFrame) animationFrame = window.requestAnimationFrame(update) }
    const onPointer = (event: PointerEvent) => {
      if (motion.matches) return
      story.style.setProperty('--cursor-x', String((event.clientX / window.innerWidth - .5) * 18))
      story.style.setProperty('--cursor-y', String((event.clientY / window.innerHeight - .5) * 18))
    }
    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [])

  const goToStep = (destination: number) => {
    const story = storyRef.current
    if (!story) return
    const distance = story.offsetHeight - window.innerHeight
    const target = story.getBoundingClientRect().top + window.scrollY + (destination === 0 ? 0 : distance * (destination + .12) / 4)
    window.scrollTo({ top: target, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    setMenuOpen(false)
  }

  const cards = [0, 1, 2].map(offset => EXPLORE[(cardIndex + offset) % EXPLORE.length])
  const moveCards = (direction: number) => setCardIndex(index => (index + direction + EXPLORE.length) % EXPLORE.length)

  return <main className="hoxo-home" data-step={step}>
    <section className="hoxo-scroll-story" ref={storyRef} id="home" aria-label="HOXO on Beldex">
      <div className="hoxo-sticky">
        <div className="hoxo-background" aria-hidden="true">
          <div className="hoxo-grid-surface" />
          <div className="hoxo-starlight" />
          <div className="hoxo-aura" />
          <OrbitArtwork />
          <div className="hoxo-vignette" />
        </div>

        <header className="hoxo-header">
          <button type="button" className="hoxo-brand" aria-label="HOXO homepage" onClick={() => goToStep(0)}>
            <HoxoMark />
            <span className="hoxo-brand-name">HOXO</span>
            <span className="hoxo-brand-chain">ON BELDEX</span>
          </button>
          <nav className="hoxo-navigation" aria-label="Primary navigation">
            {['Home', 'Why HOXO', 'Markets', 'Explore'].map((label, index) =>
              <button key={label} type="button" className={step === index ? 'is-current' : ''} onClick={() => goToStep(index)}>
                {label}
              </button>
            )}
          </nav>
          <div className="hoxo-header-actions">
            <span className="hoxo-network-marker"><i /> BELDEX TESTNET</span>
            <button className="hoxo-launch-button" type="button" onClick={() => onEnter('Overview')}>
              Launch App <ArrowUpRight size={16} strokeWidth={2} />
            </button>
            <button className="hoxo-menu-button" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </header>
        {menuOpen && <nav className="hoxo-mobile-navigation" aria-label="Mobile navigation">
          {['Home', 'Why HOXO', 'Markets', 'Explore'].map((label, index) =>
            <button key={label} type="button" onClick={() => goToStep(index)}>{label}<ArrowUpRight size={16}/></button>)}
          <button type="button" onClick={() => {setMenuOpen(false); onEnter('Overview')}}>Launch App <ArrowUpRight size={16}/></button>
        </nav>}

        <div className="hoxo-content">
          <section className={'hoxo-scene hoxo-scene-hero '+(step === 0 ? 'is-active' : '')} aria-hidden={step !== 0}>
            <div className="hoxo-kicker"><span className="hoxo-tiny-diamond" /> INTRODUCING HOXO <span className="hoxo-kicker-rule" /> ON BELDEX</div>
            <h1>Finance in<br/><em>new orbit.</em></h1>
            <p className="hoxo-hero-copy">A new frontier for onchain markets on Beldex. Built around your wallet, with a testnet foundation and bigger possibilities ahead.</p>
            <div className="hoxo-hero-actions">
              <button type="button" className="hoxo-primary-cta" onClick={() => onEnter('Overview')} tabIndex={step === 0 ? 0 : -1}>
                Enter HOXO <ArrowUpRight size={18} />
              </button>
              <button type="button" className="hoxo-secondary-cta" onClick={() => onEnter('Testnet')} tabIndex={step === 0 ? 0 : -1}>
                Explore Testnet <ArrowRight size={17} />
              </button>
            </div>
            <div className="hoxo-hero-note"><ShieldCheck size={15}/> WALLET-CONTROLLED. TESTNET-FIRST.</div>
          </section>

          <section className={'hoxo-scene hoxo-scene-wallet '+(step === 1 ? 'is-active' : '')} aria-hidden={step !== 1}>
            <div className="hoxo-narrative-copy">
              <div className="hoxo-kicker"><span className="hoxo-tiny-diamond"/> 01 / THE FOUNDATION</div>
              <h2>Your wallet.<br/><em>Your rules.</em></h2>
              <p>On HOXO, wallet actions stay under your control. Explore native BDX testnet tools with explicit approvals and no invented balances.</p>
              <button className="hoxo-inline-link" type="button" onClick={() => onEnter('Testnet')} tabIndex={step === 1 ? 0 : -1}>Explore Beldex testnet <ArrowUpRight size={18}/></button>
            </div>
            <div className="hoxo-wallet-panel">
              <div className="hoxo-wallet-top"><span><HoxoMark/> HOXO / WALLET</span><span className="hoxo-panel-dots"><i/><i/><i/></span></div>
              <div className="hoxo-wallet-icon"><Wallet size={30} strokeWidth={1.5}/></div>
              <span className="hoxo-panel-eyebrow">BELDEX EXTENSION WALLET</span>
              <h3>Connected to you.</h3>
              <p>Wallet data is displayed only when your wallet grants access.</p>
              <div className="hoxo-wallet-divider"/>
              <div className="hoxo-wallet-list"><span>Native BDX balance</span><b>From connected wallet</b></div>
              <div className="hoxo-wallet-list"><span>Transaction approvals</span><b>Always yours</b></div>
              <div className="hoxo-wallet-safe"><Check size={14}/> NO SIMULATED BALANCES</div>
            </div>
          </section>

          <section className={'hoxo-scene hoxo-scene-markets '+(step === 2 ? 'is-active' : '')} aria-hidden={step !== 2}>
            <div className="hoxo-narrative-copy">
              <div className="hoxo-kicker"><span className="hoxo-tiny-diamond"/> 02 / THE VISION</div>
              <h2>One destination.<br/><em>More possibilities.</em></h2>
              <p>From swaps to perpetuals, lending and routes, the HOXO roadmap is designed to bring the next generation of markets together.</p>
              <span className="hoxo-in-development"><span/> MARKETS IN DEVELOPMENT</span>
            </div>
            <div className="hoxo-market-panel">
              <div className="hoxo-market-top"><span>MARKET ECOSYSTEM</span><span>ROADMAP / 04</span></div>
              {MARKET_SECTIONS.map(item =>
                <button key={item.id} type="button" className="hoxo-market-row" onClick={() => onEnter(item.id)} tabIndex={step === 2 ? 0 : -1}>
                  <span className="market-index">{item.number}</span>
                  <span className="market-info"><b>{item.label}</b><small>{item.description}</small></span>
                  <ArrowUpRight size={23} strokeWidth={1.5}/>
                </button>
              )}
              <div className="hoxo-market-foot">EXPLORATION ≠ LIVE TRADING <span>↗</span></div>
            </div>
          </section>

          <section className={'hoxo-scene hoxo-scene-explore '+(step === 3 ? 'is-active' : '')} aria-hidden={step !== 3}>
            <div className="hoxo-explore-heading">
              <div><div className="hoxo-kicker"><span className="hoxo-tiny-diamond"/> 03 / EXPLORE HOXO</div>
                <h2>Find your <em>next move.</em></h2>
              </div>
              <div className="hoxo-carousel-buttons">
                <button type="button" aria-label="Previous feature" onClick={() => moveCards(-1)} tabIndex={step === 3 ? 0 : -1}><ArrowLeft size={18}/></button>
                <button type="button" aria-label="Next feature" onClick={() => moveCards(1)} tabIndex={step === 3 ? 0 : -1}><ArrowRight size={18}/></button>
              </div>
            </div>
            <div className="hoxo-feature-carousel">
              {cards.map((card) =>
                <button type="button" key={card.number} className={'hoxo-feature-card '+card.className} onClick={() => onEnter(card.id)} tabIndex={step === 3 ? 0 : -1}>
                  <span className="hoxo-feature-top"><span>{card.eyebrow}</span><ArrowUpRight size={20}/></span>
                  <span className="hoxo-feature-mark" aria-hidden="true">✳</span>
                  <span className="hoxo-feature-number">{card.number} / 05</span>
                  <span className="hoxo-feature-title">{card.label}</span>
                  <span className="hoxo-feature-description">{card.description}</span>
                </button>
              )}
            </div>
            <div className="hoxo-explore-bottom"><span>BUILT ON BELDEX. DEVELOPED BY MUSHEE.</span><span>{String(cardIndex + 1).padStart(2, '0')} / 05</span></div>
          </section>
        </div>

        <div className="hoxo-bottom-bar">
          <div className="hoxo-scroll-indicator"><ArrowDown size={15} /> <span>SCROLL TO EXPLORE</span></div>
          <div className="hoxo-chapters" aria-label="Story chapters">
            {[0, 1, 2, 3].map(index =>
              <button key={index} type="button" aria-label={'Go to chapter '+(index + 1)} aria-current={step === index ? 'step' : undefined}
                className={step === index ? 'is-current' : ''} onClick={() => goToStep(index)} />)}
          </div>
          <div className="hoxo-chapter-count">0{step + 1} <span>/ 04</span> <ChevronDown size={15}/></div>
        </div>
      </div>
    </section>
    <footer className="hoxo-footer">
      <div><HoxoMark/><b>HOXO</b><span>ON BELDEX</span></div>
      <p>Explore what comes next. HOXO is an early-stage Beldex testnet project; swap, perpetuals, lending and routes are not live trading services.</p>
      <button type="button" onClick={() => onEnter('Overview')}>Launch App <ArrowUpRight size={16}/></button>
    </footer>
  </main>
}
