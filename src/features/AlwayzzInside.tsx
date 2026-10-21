import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ChevronUp } from 'lucide-react'
import type { LivePage } from '../lib/liveNavigation'
import './alwayzz-inside.css'

export const ALWAYZZ_HERO_IMAGE = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260626_041422_4a459e05-abce-4150-9fb7-4ededc423cd1.png&w=1280&q=85'
export const ALWAYZZ_AVATAR_IMAGE = 'https://framerusercontent.com/images/hfneFL6CHBi5BnNvCeOaqU9HqE4.png'

const SERVICES = [
  'Brand Identity',
  'App Development',
  'Visual Design',
  'Creative Video',
  'Iconography',
] as const

const PARTNERS = [
  { name: 'Airbnb', family: '"Cedarville Cursive", cursive', weight: 700 },
  { name: 'Shopify', family: 'system-ui, sans-serif', weight: 800 },
  { name: 'Notion', family: 'Georgia, serif', weight: 500 },
  { name: 'Linear', family: 'Inter, sans-serif', weight: 600 },
  { name: 'Webflow', family: 'Inter, sans-serif', weight: 700 },
  { name: 'Figma', family: 'system-ui, sans-serif', weight: 600 },
  { name: 'Slack', family: 'Georgia, serif', weight: 700 },
  { name: 'Stripe', family: 'system-ui, sans-serif', weight: 800 },
  { name: 'Vercel', family: 'Inter, sans-serif', weight: 600 },
  { name: 'Framer', family: '"Source Serif 4", Georgia, serif', weight: 600 },
] as const

const MENU_ITEMS: ReadonlyArray<{ label: string; destination?: LivePage; contact?: true }> = [
  { label: 'Projects', destination: 'Swap' },
  { label: 'Plans', destination: 'Launch' },
  { label: 'Team', destination: 'Portfolio' },
  { label: 'FAQs', destination: 'Security' },
  { label: 'Get in Touch', contact: true },
]

function AnimatedLines() {
  return <div className="alwayzz-line-art" aria-hidden="true">
    {(['left', 'right'] as const).flatMap(side =>
      Array.from({length:20}, (_,i) => <span
        key={side+'-'+i}
        className={'alwayzz-side-line alwayzz-side-line--'+side}
        style={{
          '--alwayzz-line-index':i,
          '--alwayzz-line-offset':(i*15)+'px',
          '--alwayzz-top-offset':(i*10)+'px',
          '--alwayzz-line-width':(60+i*10)+'px',
          animationDelay:(i*0.25)+'s',
        } as CSSProperties}
      />)
    )}
    {Array.from({length:20}, (_,i) => <span key={'top-'+i}
      className="alwayzz-top-line"
      style={{
        '--alwayzz-line-index':i,
        '--alwayzz-line-offset':(i*15)+'px',
        '--alwayzz-top-offset':(i*10)+'px',
        '--alwayzz-line-width':(60+i*10)+'px',
        animationDelay:(i*0.25)+'s',
      } as CSSProperties}
    />)}
  </div>
}

function ServiceTicker() {
  return <div className="alwayzz-ticker" aria-label="Creative services">
    <div className="alwayzz-marquee-track">
      {Array.from({length:4},(_,copy) => <div className="alwayzz-marquee-unit" key={copy} aria-hidden={copy!==0}>
        {SERVICES.map(name => <span className="alwayzz-service-pill" key={name}>{name}</span>)}
      </div>)}
    </div>
  </div>
}

function TrustedBy() {
  return <section className="alwayzz-trusted" aria-label="Company name references">
    <div className="alwayzz-trusted-inner">
      <p className="alwayzz-trusted-label">Partnered with top-tier companies globally</p>
      <div className="alwayzz-trusted-marquee">
        <div className="alwayzz-marquee-track">
          {[0,1].map(copy => <div className="alwayzz-partner-unit" key={copy} aria-hidden={copy===1}>
            {PARTNERS.map(partner => <span className="alwayzz-partner" key={partner.name}
              style={{fontFamily:partner.family,fontWeight:partner.weight}}>{partner.name}</span>)}
          </div>)}
        </div>
      </div>
    </div>
    <p className="alwayzz-partner-disclosure">Company names are illustrative design references, not verified endorsements or partnerships.</p>
  </section>
}

export function AlwayzzInside({ onNavigate }:{onNavigate:(page:LivePage)=>void}) {
  const [menuOpen,setMenuOpen] = useState(false)
  const [bookingNotice,setBookingNotice] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const bookButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if(!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow='hidden'
    const closeOnEscape=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){
        setMenuOpen(false)
        menuButton.current?.focus()
      }
    }
    window.addEventListener('keydown',closeOnEscape)
    return () => {
      document.body.style.overflow=previous
      window.removeEventListener('keydown',closeOnEscape)
    }
  },[menuOpen])

  const requestBooking = () => {
    setMenuOpen(false)
    setBookingNotice(true)
    window.setTimeout(()=>bookButton.current?.focus(),0)
  }

  return <div className="alwayzz-root" data-section="overview">
    <header className="alwayzz-header">
      <div className="alwayzz-header-inner">
        <a className="alwayzz-logo" href="/app" aria-label="Alwayzz home" onClick={event=>{
          event.preventDefault()
          setMenuOpen(false)
          window.scrollTo({top:0,behavior:'smooth'})
        }}>
          <span className="alwayzz-wordmark">Alwayzz</span><sup>®</sup>
        </a>
        <button ref={menuButton} type="button"
          className="alwayzz-menu-button"
          onClick={()=>setMenuOpen(open=>!open)}
          aria-expanded={menuOpen} aria-controls="alwayzz-menu-drawer">
          {menuOpen?'Close':'Menu'} <ChevronUp aria-hidden="true" size={16} className={menuOpen?'alwayzz-menu-chevron alwayzz-menu-chevron--open':'alwayzz-menu-chevron'}/>
        </button>
      </div>
    </header>
    <aside id="alwayzz-menu-drawer" className={'alwayzz-drawer'+(menuOpen?' alwayzz-drawer--open':'')}
      aria-hidden={!menuOpen} aria-label="Alwayzz navigation">
      <nav className="alwayzz-drawer-links">
        {MENU_ITEMS.map(item=><a key={item.label}
          href={item.contact?'#alwayzz-book':'/app/'+(item.destination==='Launch'?'launch':item.destination?.toLowerCase())}
          tabIndex={menuOpen?0:-1}
          onClick={event=>{
            event.preventDefault()
            if(item.contact) requestBooking()
            else if(item.destination){setMenuOpen(false);onNavigate(item.destination)}
          }}>{item.label}</a>)}
      </nav>
      <footer className="alwayzz-drawer-footer">
        <span>© 2026 Alwayzz. All rights reserved.</span>
      </footer>
    </aside>
    <main>
      <section className="alwayzz-hero" aria-label="Premium creative on demand">
        <AnimatedLines/>
        <div className="alwayzz-hero-content">
          <ServiceTicker/>
          <h1>Premium creative <em>alwayzz</em><sup>®</sup> on demand.</h1>
          <p className="alwayzz-description">A flexible design partnership for founders, brands, and agencies who want top craft delivered on their timeline.</p>
          <div className="alwayzz-cta-row">
            <button className="alwayzz-primary-cta" type="button" onClick={()=>onNavigate('Launch')}>View Plans</button>
            <button className="alwayzz-book-cta" id="alwayzz-book" ref={bookButton} type="button" onClick={requestBooking}>
              <img src={ALWAYZZ_AVATAR_IMAGE} alt="Chat host portrait" width="40" height="40"/>
              <span className="alwayzz-book-cta-copy">
                <strong>Chat for 15 minutes</strong>
                <span><i aria-hidden="true" className="alwayzz-availability-dot"/>Pick a slot</span>
              </span>
            </button>
          </div>
          {bookingNotice&&<p className="alwayzz-booking-notice" role="status">
            A booking calendar has not been connected. No appointment has been scheduled.
          </p>}
        </div>
        <div className="alwayzz-bottom-blur" aria-hidden="true"/>
      </section>
      <TrustedBy/>
    </main>
  </div>
}
