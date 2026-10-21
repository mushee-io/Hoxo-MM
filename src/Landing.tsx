import { ArrowRight, ArrowUpRight, ExternalLink } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import './landing.css'

export type LandingDestination = 'Overview' | 'Testnet' | 'Swap' | 'Perps' | 'Lend' | 'Routes' | 'Portfolio' | 'Security' | 'Launch'
type Props = { onEnter: (destination?: LandingDestination) => void }

const HERO_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4'
const COMMERCE_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_183428_ab5e672a-f608-4dcb-b319-f3e040f02e2d.mp4'
const SAVINGS_IMAGE = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260423_164207_f243351d-ed59-48ec-83a0-a5e996bdbe3c.png&w=1280&q=85'

export function LogoIcon({ className = '' }: { className?: string }) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 256 256" fill="currentColor">
    <path d="M 128.005 191.173 C 128.448 156.208 156.93 128 192 128 L 192 64 L 128 64 C 128 99.346 99.346 128 64 128 L 64 192 L 128 192 Z M 192 256 L 64 256 C 28.654 256 0 227.346 0 192 L 0 64 L 64 64 L 64 0 L 192 0 C 227.346 0 256 28.654 256 64 L 256 192 L 192 192 Z" />
  </svg>
}
type Brand = { name: string; style: CSSProperties }
const HERO_BRANDS: Brand[] = [
  { name: 'Stripe', style: {fontFamily:'Georgia, serif',fontWeight:700,letterSpacing:'-0.02em',fontSize:15} },
  { name: 'Coinbase', style: {fontFamily:'Arial, sans-serif',fontWeight:900,letterSpacing:'0.08em',fontSize:13,textTransform:'uppercase'} },
  { name: 'Uniswap', style: {fontFamily:'Trebuchet MS, sans-serif',fontWeight:600,letterSpacing:'0.01em',fontSize:15,fontStyle:'italic'} },
  { name: 'Aave', style: {fontFamily:'Courier New, monospace',fontWeight:700,letterSpacing:'0.12em',fontSize:13,textTransform:'uppercase'} },
  { name: 'Compound', style: {fontFamily:'Palatino, Book Antiqua, serif',fontWeight:400,letterSpacing:'-0.01em',fontSize:16} },
  { name: 'MakerDAO', style: {fontFamily:'Impact, Arial Narrow, sans-serif',fontWeight:400,letterSpacing:'0.04em',fontSize:14} },
  { name: 'Chainlink', style: {fontFamily:'Verdana, sans-serif',fontWeight:700,letterSpacing:'-0.03em',fontSize:13} },
]
const BACKERS: Brand[] = [
  { name:'Fundamental Labs',style:{fontFamily:'Times New Roman, serif',fontWeight:400,letterSpacing:'0.02em',fontSize:14} },
  { name:'KUCOIN',style:{fontFamily:'Arial Black, Arial, sans-serif',fontWeight:900,letterSpacing:'0.08em',fontSize:16} },
  { name:'NGC',style:{fontFamily:'Impact, sans-serif',fontWeight:700,letterSpacing:'0.05em',fontSize:18} },
  { name:'NxGen',style:{fontFamily:'Georgia, serif',fontWeight:600,letterSpacing:'-0.02em',fontSize:17} },
  { name:'Matter Labs',style:{fontFamily:'Helvetica, sans-serif',fontWeight:700,letterSpacing:'-0.01em',fontSize:15} },
  { name:'DEXTools',style:{fontFamily:'Verdana, sans-serif',fontWeight:700,letterSpacing:'0.06em',fontSize:14,textTransform:'uppercase'} },
  { name:'NGRAVE',style:{fontFamily:'Courier New, monospace',fontWeight:700,letterSpacing:'0.18em',fontSize:14} },
  { name:'Polychain',style:{fontFamily:'Palatino, serif',fontWeight:500,letterSpacing:'0.03em',fontSize:15} },
]
const marqueeCss = [
  '@keyframes halo-marquee {from{transform:translateX(0)}to{transform:translateX(-50%)}}',
  '@keyframes halo-backers-marquee {from{transform:translateX(0)}to{transform:translateX(-50%)}}',
  '.halo-marquee-track{display:flex;width:max-content;animation:halo-marquee 22s linear infinite}',
  '.halo-backers-track{display:flex;width:max-content;animation:halo-backers-marquee 30s linear infinite}',
  '@media(prefers-reduced-motion:reduce){.halo-marquee-track,.halo-backers-track{animation:none}}',
].join('\n')

function ArrowPill({children,onClick,small=false}:{
  children:ReactNode;onClick:()=>void;small?:boolean
}) {
  return <button type="button" onClick={onClick} className={'halo-group halo-inline-flex halo-items-center halo-gap-3 halo-rounded-full halo-bg-black halo-pl-8 halo-pr-2 halo-py-2 halo-font-semibold halo-text-white halo-transition-colors halo-duration-200 hover:halo-bg-gray-800 '+(small?'halo-text-base':'halo-text-base md:halo-text-lg')}>
    <span>{children}</span>
    <span className="halo-grid halo-h-9 halo-w-9 halo-place-items-center halo-rounded-full halo-bg-white halo-transition-colors halo-duration-200 group-hover:halo-bg-gray-100"><ArrowRight size={20} className="halo-text-black"/></span>
  </button>
}
function BrandMarquee({brands,backers=false}:{brands:readonly Brand[];backers?:boolean}) {
  const css=backers?'halo-mx-10 halo-shrink-0 halo-whitespace-nowrap halo-text-black/50':'halo-mx-7 halo-shrink-0 halo-whitespace-nowrap halo-text-black/60'
  return <div className="halo-w-full halo-overflow-hidden" aria-label={backers?'Illustrative finance industry names':'Illustrative finance ecosystem names'}>
    <div className={backers?'halo-backers-track':'halo-marquee-track'}>
      {[0,1].map(copy=><div className="halo-flex halo-shrink-0" aria-hidden={copy===1} key={copy}>
        {brands.map(brand=><span key={brand.name} style={brand.style} className={css}>{brand.name}</span>)}
      </div>)}
    </div>
  </div>
}
function Navbar({onEnter}:Props) {
  const link='halo-text-base halo-font-semibold halo-text-gray-700 halo-transition-colors halo-duration-200 hover:halo-text-black'
  return <nav className="halo-absolute halo-inset-x-0 halo-top-0 halo-z-20 halo-px-6 halo-py-5" aria-label="Halo homepage navigation">
    <div className="halo-mx-auto halo-flex halo-max-w-halo halo-items-center halo-justify-between">
      <a href="/" className="halo-inline-flex halo-items-center halo-gap-2 halo-text-black" aria-label="Halo home"><LogoIcon className="halo-h-7 halo-w-7"/><span className="halo-text-2xl halo-font-semibold halo-tracking-tight">Halo</span></a>
      <div className="halo-hidden halo-items-center halo-gap-8 md:halo-flex">
        <a className={link} href="#network">Network</a><a className={link} href="#ecosystem">Ecosystem</a>
        <a className={link} href="#rewards">Rewards</a><a className={link} href="#help">Help</a>
        <a className={link} href="https://github.com/mushee-io/Hoxo-MM/releases" target="_blank" rel="noreferrer">News</a>
      </div>
      <button type="button" onClick={()=>onEnter('Testnet')} className="halo-rounded-full halo-bg-black halo-px-7 halo-py-2.5 halo-text-base halo-font-semibold halo-text-white halo-transition-colors halo-duration-200 hover:halo-bg-gray-800">Open Wallet</button>
    </div>
  </nav>
}
function HeroSection({onEnter}:Props) {
  return <section className="halo-flex halo-min-h-0 halo-flex-1 halo-items-end halo-px-6 halo-pb-6 halo-pt-20" aria-label="Halo introduction">
    <div className="halo-hero-card halo-relative halo-w-full halo-overflow-hidden halo-rounded-2xl" style={{height:'calc(100vh - 96px)'}}>
      <video aria-hidden="true" className="halo-absolute halo-inset-0 halo-h-full halo-w-full halo-object-cover" autoPlay muted loop playsInline preload="metadata">
        <source src={HERO_VIDEO} type="video/mp4"/>
      </video>
      <div className="halo-pointer-events-none halo-absolute halo-inset-0 halo-hero-video-wash" aria-hidden="true"/>
      <div className="halo-relative halo-z-10 halo-flex halo-h-full halo-flex-col halo-items-start halo-justify-start halo-p-7 halo-pt-28 sm:halo-p-12 sm:halo-pt-36">
        <div className="halo-mx-auto halo-flex halo-w-full halo-max-w-halo halo-flex-1 halo-flex-col halo-items-start">
          <h1 className="halo-mb-4 halo-max-w-xl halo-text-5xl halo-font-semibold halo-leading-tight halo-text-black md:halo-text-6xl" style={{letterSpacing:'-0.04em'}}>Your Wealth<br/>Works</h1>
          <p className="halo-mb-8 halo-max-w-md halo-text-base halo-leading-relaxed halo-text-black/70 md:halo-text-lg" style={{fontFamily:"'Inter', ui-sans-serif, system-ui, sans-serif"}}>
            An automated, reward-powered digital dollar built for native passive earnings and effortless connection into DeFi.
          </p>
          <ArrowPill onClick={()=>onEnter('Overview')}>Join us</ArrowPill>
          <div className="halo-mt-24 halo-w-full halo-max-w-md max-sm:halo-mt-10"><BrandMarquee brands={HERO_BRANDS}/></div>
          <p className="halo-mt-4 halo-text-xs halo-text-black/60">Concept preview · Industry logos do not imply a partnership.</p>
        </div>
      </div>
    </div>
  </section>
}
function InfoSection({onEnter}:Props) {
  return <section id="network" className="halo-bg-halopage halo-px-6 halo-py-24">
    <div className="halo-mx-auto halo-max-w-halo">
      <div className="halo-mb-16 halo-grid halo-grid-cols-1 halo-items-start halo-gap-12 md:halo-grid-cols-2">
        <div><h2 className="halo-mb-8 halo-text-4xl halo-font-semibold halo-leading-tight halo-text-black md:halo-text-5xl" style={{letterSpacing:'-0.03em'}}>Meet USD Halo.</h2>
          <ArrowPill small onClick={()=>onEnter('Launch')}>Discover it</ArrowPill>
        </div>
        <p className="halo-text-2xl halo-leading-relaxed halo-text-black/70 md:halo-text-3xl">USD Halo is a reward-earning dollar coin that lets your savings grow while remaining tied to the U.S. dollar.</p>
      </div>
      <div id="rewards" className="halo-grid halo-grid-cols-1 halo-gap-4 sm:halo-grid-cols-2 lg:halo-grid-cols-4">
        <article className="halo-feature-image halo-relative halo-flex halo-min-h-80 halo-flex-col halo-justify-between halo-overflow-hidden halo-rounded-2xl halo-p-7 lg:halo-col-span-2" style={{backgroundImage:'url('+SAVINGS_IMAGE+')',backgroundSize:'cover',backgroundPosition:'center'}}>
          <div className="halo-feature-image-wash" aria-hidden="true"/>
          <h3 className="halo-relative halo-text-2xl halo-font-semibold halo-leading-snug halo-text-black" style={{letterSpacing:'-0.02em'}}>Savings that bloom</h3>
          <p className="halo-relative halo-max-w-xs halo-text-base halo-text-black/70">Gain steady returns as your dollar tokens are routed into top-performing DeFi strategies.</p>
        </article>
        <article className="halo-flex halo-min-h-80 halo-flex-col halo-justify-between halo-rounded-2xl halo-bg-halonight halo-p-7">
          <h3 className="halo-text-2xl halo-font-semibold halo-text-white">Always fluid,<br/>always pegged.</h3>
          <p className="halo-text-base halo-text-white/60">Keep fully dollar-anchored with on-demand access to funds — no lockups or waits.</p>
        </article>
        <article className="halo-flex halo-min-h-80 halo-flex-col halo-justify-between halo-rounded-2xl halo-bg-halonight halo-p-7">
          <h3 className="halo-text-2xl halo-font-semibold halo-text-white">Fully<br/>automated</h3>
          <p className="halo-text-base halo-text-white/60">Skip the task of tuning positions yourself. USD Halo runs in the background for you.</p>
        </article>
      </div>
      <p className="halo-mt-5 halo-text-xs halo-leading-relaxed halo-text-black/50">Illustrative product concept only. Stablecoin issuance, reserves, redemptions, yields and peg are not verified. Returns cannot be guaranteed.</p>
    </div>
  </section>
}
function BackedBySection(){
  return <section id="ecosystem" className="halo-bg-halopage halo-px-6 halo-py-8">
    <div className="halo-mx-auto halo-grid halo-max-w-halo halo-grid-cols-1 halo-items-center halo-gap-8 md:halo-grid-cols-4">
      <div>
        <p className="halo-whitespace-pre-line halo-text-base halo-leading-relaxed halo-text-black/70">Funded by premier partners{'\n'}and forward-thinking leaders.</p>
        <p className="halo-mt-2 halo-text-xs halo-text-black/50">Illustrative logos only — no funding, backing or endorsement is claimed.</p>
      </div>
      <div className="halo-min-w-0 md:halo-col-span-3"><BrandMarquee brands={BACKERS} backers/></div>
    </div>
  </section>
}
function UseCasesSection({onEnter}:Props){
  return <section id="help" className="halo-bg-halopage halo-px-6 halo-py-24">
    <div className="halo-mx-auto halo-grid halo-max-w-halo halo-grid-cols-1 halo-items-start halo-gap-8 md:halo-grid-cols-2">
      <div className="md:halo-pr-12 md:halo-pt-2">
        <p className="halo-mb-2 halo-text-sm halo-text-black/60">USD Halo in Practice</p>
        <h2 className="halo-mb-6 halo-text-5xl halo-font-semibold halo-leading-none halo-text-black md:halo-text-6xl" style={{letterSpacing:'-0.04em'}}>Use modes</h2>
        <p className="halo-max-w-sm halo-text-base halo-leading-relaxed halo-text-black/60">USD Halo powers a wide range of modes for builders, companies and treasuries wanting safe and rewarding stablecoin integrations plus more</p>
        <div className="halo-mt-10 halo-max-w-sm halo-rounded-2xl halo-border halo-border-black/10 halo-p-6">
          <p className="halo-mb-3 halo-text-sm halo-font-semibold halo-text-black">Explore the underlying workspace</p>
          <p className="halo-mb-5 halo-text-sm halo-leading-relaxed halo-text-black/60">The current connected app supports Beldex wallet data and native BDX testnet operations; USD Halo stablecoin issuance and DeFi integrations are not live.</p>
          <button type="button" className="halo-inline-flex halo-items-center halo-gap-2 halo-text-base halo-font-semibold halo-text-black hover:halo-underline" onClick={()=>onEnter('Overview')}>Go to app <ArrowUpRight size={17}/></button>
        </div>
      </div>
      <article className="halo-commerce-card halo-relative halo-min-h-[720px] halo-overflow-hidden halo-rounded-3xl">
        <video aria-hidden="true" className="halo-absolute halo-inset-0 halo-h-full halo-w-full halo-object-cover" autoPlay muted loop playsInline preload="metadata">
          <source src={COMMERCE_VIDEO} type="video/mp4"/>
        </video>
        <div className="halo-pointer-events-none halo-absolute halo-inset-0 halo-commerce-video-wash" aria-hidden="true"/>
        <div className="halo-relative halo-z-10 halo-p-10 md:halo-p-12">
          <h3 className="halo-mb-5 halo-text-4xl halo-font-semibold halo-leading-tight halo-text-black md:halo-text-5xl" style={{letterSpacing:'-0.03em'}}>Commerce</h3>
          <p className="halo-mb-8 halo-max-w-md halo-text-base halo-leading-relaxed halo-text-black/70">Lift customer retention by offering USD Halo, a trusted dollar-backed stablecoin with strong yields, letting your patrons earn with zero effort on your platform.</p>
          <button type="button" onClick={()=>onEnter('Launch')} className="halo-group halo-inline-flex halo-items-center halo-gap-3 halo-font-semibold halo-text-black">
            <span className="halo-flex halo-h-9 halo-w-9 halo-items-center halo-justify-center halo-rounded-full halo-bg-white/80 halo-backdrop-blur halo-transition-colors halo-duration-200 group-hover:halo-bg-white"><ArrowRight size={16} className="halo-text-black"/></span>Know more
          </button>
        </div>
      </article>
    </div>
    <footer className="halo-mx-auto halo-mt-16 halo-flex halo-max-w-halo halo-flex-col halo-justify-between halo-gap-4 halo-border-t halo-border-black/10 halo-pt-7 halo-text-sm halo-text-black/60 md:halo-flex-row">
      <span>© 2026 Halo · Concept preview</span>
      <span>Stablecoin backing, earnings and listed brand relationships are unverified.</span>
      <a href="https://github.com/mushee-io/Hoxo-MM" target="_blank" rel="noreferrer" className="halo-inline-flex halo-items-center halo-gap-1 hover:halo-text-black">Source <ExternalLink size={14}/></a>
    </footer>
  </section>
}
export default function Landing({onEnter}:Props){
  return <div className="halo-landing halo-flex halo-min-h-screen halo-flex-col halo-bg-halopage halo-text-black">
    <style>{marqueeCss}</style>
    <div className="halo-relative halo-flex halo-h-screen halo-flex-col halo-overflow-hidden">
      <Navbar onEnter={onEnter}/>
      <HeroSection onEnter={onEnter}/>
    </div>
    <InfoSection onEnter={onEnter}/>
    <BackedBySection/>
    <UseCasesSection onEnter={onEnter}/>
  </div>
}
