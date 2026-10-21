import { ArrowRight } from 'lucide-react'
import { BoomerangVideoBg } from './features/BoomerangVideoBg'
import './landing.css'

export type LandingDestination =
  | 'Overview' | 'Testnet' | 'Swap' | 'Perps' | 'Lend'
  | 'Routes' | 'Portfolio' | 'Security' | 'Launch'

type LandingProps = { onEnter: (destination?: LandingDestination) => void }

const FEATURES = [
  { number: '01', label: 'Conversational', page: 'Overview' },
  { number: '02', label: 'Connected', page: 'Testnet' },
  { number: '03', label: 'Compliant', page: 'Security' },
] as const

/** Exact 256x256 Boomerang monogram supplied in the design brief. */
export function LogoIcon({ className = '' }: { className?: string }) {
  return <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 256 256"
    fill="currentColor"
  >
    <path d="M 144 256 L 27.598 256 L 144 139.598 Z M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z M 0 204.402 L 0 112 L 92.402 112 Z" />
  </svg>
}

function Navbar({ onEnter }: LandingProps) {
  return <nav
    aria-label="Boomerang primary navigation"
    className="halo-fixed halo-left-0 halo-right-0 halo-top-0 halo-z-50 halo-px-6 halo-py-4 sm:halo-px-10 sm:halo-py-5 md:halo-px-14"
  >
    <div className="halo-mx-auto halo-flex halo-w-full halo-max-w-[88rem] halo-items-center halo-justify-between halo-gap-5">
      <a
        href="/"
        className="halo-flex halo-shrink-0 halo-items-center halo-gap-2.5 halo-text-[#191919]"
        aria-label="Boomerang home"
      >
        <LogoIcon className="halo-h-6 halo-w-6 halo-text-[#191919]" />
        <span className="halo-text-base halo-font-semibold halo-tracking-tight">Boomerang</span>
      </a>
      <div className="halo-hidden halo-items-center halo-gap-8 md:halo-flex">
        {[
          ['Product', '#product'],
          ['Solutions', '#solutions'],
          ['Pricing', '#pricing'],
          ['Company', '#company'],
        ].map(([label, href]) => <a
          key={label}
          href={href}
          className="halo-text-sm halo-text-[#191919]/70 halo-transition-colors halo-duration-200 hover:halo-text-[#191919]"
        >{label}</a>)}
      </div>
      <button
        type="button"
        onClick={() => onEnter('Overview')}
        className="halo-shrink-0 halo-rounded-lg halo-bg-[#191919] halo-px-5 halo-py-2.5 halo-text-sm halo-font-medium halo-text-white halo-transition-colors halo-duration-200 hover:halo-bg-[#191919]/90"
      >Book A Demo</button>
    </div>
  </nav>
}

function FeatureRows({ onEnter }: LandingProps) {
  return <div className="halo-grid halo-grid-cols-1 halo-gap-2 sm:halo-grid-cols-3 sm:halo-gap-3">
    {FEATURES.map((feature, index) => <button
      key={feature.number}
      id={index === 1 ? 'pricing' : index === 2 ? 'company' : undefined}
      type="button"
      onClick={() => onEnter(feature.page)}
      className="halo-group halo-flex halo-items-center halo-justify-between halo-bg-[#F4F3F3] halo-px-4 halo-py-3.5 halo-text-left halo-text-sm halo-text-[#191919] halo-transition-all halo-duration-200 hover:halo-bg-[#eaeaea] sm:halo-px-6 sm:halo-py-4"
    >
      <span className="halo-flex halo-items-center">
        <span className="halo-text-[#191919]/40">{feature.number}</span>
        <span className="halo-mx-2 halo-text-[#191919]/30">/</span>
        <span className="halo-font-medium">{feature.label}</span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="halo-h-4 halo-w-4 halo-shrink-0 halo-text-gray-400 halo-transition-all halo-duration-200 group-hover:halo-translate-x-0.5 group-hover:halo-text-gray-700"
      />
    </button>)}
  </div>
}

function InfoPanel({ onEnter }: LandingProps) {
  return <div
    id="solutions"
    className="halo-relative halo-z-10 halo-mt-auto halo-w-full halo-max-w-5xl halo-px-4 sm:halo-px-6"
  >
    <div className="halo-border halo-border-b-0 halo-border-gray-200 halo-bg-white/90 halo-px-5 halo-pb-0 halo-pt-8 halo-shadow-sm halo-backdrop-blur-sm sm:halo-px-8 sm:halo-pt-12 md:halo-px-12 md:halo-pt-16">
      <div className="halo-grid halo-grid-cols-1 halo-items-end halo-gap-6 sm:halo-gap-8 md:halo-grid-cols-2 md:halo-gap-16">
        <div>
          <p className="halo-text-[11px] halo-font-medium halo-uppercase halo-tracking-[0.2em] halo-text-[#191919]/50">WHAT DO WE DO?</p>
          <h2 className="halo-mt-3 halo-font-serif halo-text-2xl halo-font-normal halo-leading-tight halo-tracking-tight halo-text-[#191919] sm:halo-text-3xl md:halo-text-4xl">
            Conversations that<br className="halo-hidden sm:halo-block"/> build momentum
          </h2>
        </div>
        <p className="halo-text-sm halo-leading-relaxed halo-text-[#191919]/70 md:halo-text-[15px]">
          Conversational AI built for regulated financial institutions. Agents that hold a real conversation, plug into the systems you run, and show their work.
        </p>
      </div>
      <div className="halo-mt-6 halo-h-px halo-w-full halo-bg-gray-200 sm:halo-mt-8 md:halo-mt-10"/>
      <FeatureRows onEnter={onEnter}/>
    </div>
  </div>
}

export default function Landing({ onEnter }: LandingProps) {
  return <div className="boomerang-landing halo-min-h-screen halo-overflow-x-hidden halo-bg-white">
    <Navbar onEnter={onEnter}/>
    <main
      aria-label="Boomerang conversational AI"
      className="halo-relative halo-flex halo-h-screen halo-flex-col halo-items-center halo-overflow-hidden"
    >
      <BoomerangVideoBg/>
      <div
        id="product"
        className="halo-relative halo-z-10 halo-flex halo-w-full halo-flex-col halo-items-center halo-px-4 halo-pt-24 halo-text-center sm:halo-px-6 sm:halo-pt-26 md:halo-pt-32"
      >
        <h1 className="halo-font-serif halo-text-4xl halo-font-normal halo-leading-[1.1] halo-tracking-tighter halo-text-[#191919] sm:halo-text-5xl md:halo-text-7xl lg:halo-text-8xl">
          Build lasting<br/>relationships.
        </h1>
        <p className="halo-mt-5 halo-max-w-sm halo-text-sm halo-leading-relaxed halo-text-[#191919]/70 sm:halo-mt-6 sm:halo-max-w-md md:halo-mt-8 md:halo-text-base">
          Conversational AI platform for modern financial institutions — agents that handle the full borrower lifecycle across email, SMS, and voice.
        </p>
        <button
          type="button"
          onClick={() => onEnter('Overview')}
          className="halo-mt-6 halo-rounded-lg halo-bg-[#191919] halo-px-6 halo-py-3 halo-text-sm halo-font-medium halo-text-white halo-transition-colors halo-duration-200 hover:halo-bg-[#191919]/90 sm:halo-mt-8 sm:halo-px-8 sm:halo-py-3.5 md:halo-mt-10"
        >Book A Demo</button>
      </div>
      <InfoPanel onEnter={onEnter}/>
    </main>
  </div>
}
