import { useEffect, useState } from 'react'
import {
  ArrowLeftRight, BarChart3, CheckCircle2, CircleAlert,
  Copy, ExternalLink, Landmark, LayoutDashboard, LockKeyhole, Menu, RefreshCw,
  ShieldCheck, Wallet, Zap
} from 'lucide-react'
import Landing from './Landing'
import { AlwayzzInside } from './features/AlwayzzInside'
import { useBeldexWallet } from './hooks/useBeldexWallet'
import { BeldexTestnetPage } from './features/BeldexTestnet'
import { TestnetAssetCatalogue } from './features/TestnetAssets'
import { LiveLaunchPage, LiveSecurityPage } from './features/LiveProtocol'
import { SwapSection } from './features/SwapSection'
import { PerpsSection } from './features/PerpsSection'
import { LendSection } from './features/LendSection'
import { RoutesSection } from './features/RoutesSection'
import { LIVE_PAGES, livePageForPath, type LivePage } from './lib/liveNavigation'

const ICONS = {
  Overview: LayoutDashboard, Testnet: ShieldCheck, Swap: ArrowLeftRight,
  Perps: BarChart3, Lend: Landmark, Routes: ArrowLeftRight,
  Portfolio: Wallet, Security: LockKeyhole, Launch: Zap,
} as const
function pathFor(page: LivePage): string {
  return page === 'Overview' ? '/app' : '/app/' + page.toLowerCase()
}
function LivePortfolio({wallet}: {wallet: ReturnType<typeof useBeldexWallet>}) {
  const {connection}=wallet
  return <div className="stack" data-section="portfolio">
    <div className="section-header"><div><div className="eyebrow">BELDEX EXTENSION WALLET</div><h1>Portfolio</h1>
      <p>Only balances authorised and returned by your connected Beldex wallet are displayed. No invented holdings or prices.</p></div>
      <span className="subtle-pill">WALLET DATA ONLY</span></div>
    <section className="panel">
      <div className="card-heading"><h3>Native BDX wallet</h3><span className="subtle-pill">{connection?connection.network.toUpperCase():'NOT CONNECTED'}</span></div>
      {connection ? <>
        <div className="route-result-metrics">
          <span>Unlocked native BDX<b>{connection.unlocked}{connection.approximate?' (approx.)':''}</b></span>
          <span>Total native BDX<b>{connection.total}{connection.approximate?' (approx.)':''}</b></span>
          <span>Wallet scan height<b>{connection.height??'Not available'}</b></span>
        </div>
        <p className="muted smaller" style={{overflowWrap:'anywhere'}}>Wallet address: <code>{connection.address}</code></p>
        <button className="btn btn-outline" disabled={wallet.busy} onClick={()=>void wallet.refresh()}><RefreshCw size={15}/> Refresh wallet data</button>
      </> : <p className="muted smaller">Connect your Beldex Extension Wallet to read its actual native BDX balance.</p>}
      {connection?.approximate && <p className="negative-text smaller">This wallet balance is approximate until synchronisation finishes. Transfers remain disabled until an exact balance is available.</p>}
      <p className="muted smaller">Private-token holdings cannot be shown because the published extension dApp API does not provide wallet-authorised Privacy Token balances. Public token bookmarks below are not holdings.</p>
    </section>
    <TestnetAssetCatalogue purpose="portfolio"/>
  </div>
}

export default function App(){
  const [page,setPage]=useState<LivePage|null>(()=>livePageForPath(window.location.pathname))
  const [menuOpen,setMenuOpen]=useState(false)
  const [copyError,setCopyError]=useState('')
  const wallet=useBeldexWallet()
  useEffect(()=>{
    const navigate=()=>setPage(livePageForPath(window.location.pathname))
    window.addEventListener('popstate',navigate)
    return ()=>window.removeEventListener('popstate',navigate)
  },[])
  function go(destination:LivePage='Overview'){
    window.history.pushState({},'',pathFor(destination))
    setPage(destination)
    setMenuOpen(false)
    window.scrollTo(0,0)
  }
  if(page===null)return <Landing onEnter={go}/>
  if(page==='Overview')return <AlwayzzInside onNavigate={go}/>
  return <div className="app-shell">
    <aside className={'sidebar '+(menuOpen?'sidebar-open':'')}>
      <div className="sidebar-brand"><div className="logo-shape"><span>H</span></div>
        <div className="brand-name">HOXO<span className="brand-dot">.</span><small>ON BELDEX</small></div>
      </div>
      <p className="nav-label">WALLET AND PROTOCOL</p>
      <nav aria-label="HOXO navigation">
        {LIVE_PAGES.map(item=>{
          const Icon=ICONS[item]
          return <button key={item} type="button" className={'nav-item '+(item===page?'active':'')} aria-current={item===page?'page':undefined}
            onClick={()=>go(item)}><Icon size={18}/><span>{item}</span></button>
        })}
      </nav>
      <div className="sidebar-bottom" style={{marginTop:'auto'}}>
        <p className="muted smaller">Official Beldex wallet · Native BDX testnet transfers only</p>
        <a href="https://github.com/mushee-io/Hoxo-MM" target="_blank" rel="noreferrer" className="muted smaller">Source and security notes <ExternalLink size={12}/></a>
      </div>
    </aside>
    {menuOpen&&<button className="mobile-scrim" aria-label="Close navigation" onClick={()=>setMenuOpen(false)}/>}
    <div className="main-area">
      <header className="topbar">
        <div className="topbar-left">
          <button className="menu-toggle" title="Menu" aria-label="Open navigation" onClick={()=>setMenuOpen(x=>!x)}><Menu size={20}/></button>
          <span className="muted smaller">HOXO / {page}</span>
        </div>
        <div className="topbar-right">
          <span className="subtle-pill">{wallet.connection?.network==='testnet'?'BELDEX TESTNET':wallet.connection?.network==='mainnet'?'MAINNET READ ONLY':'NO WALLET CONNECTED'}</span>
          {wallet.connection?<button className="btn btn-outline" onClick={()=>void wallet.disconnect()} disabled={wallet.busy}>Disconnect</button>
          :<button className="btn btn-primary" onClick={()=>void wallet.connect()} disabled={wallet.busy}><Wallet size={15}/>{wallet.busy?'Connecting…':'Connect wallet'}</button>}
        </div>
      </header>
      <main className="content">
        <div className="live-safety-strip"><ShieldCheck size={16}/>
          <span>Live wallet data only. Native testnet BDX can be sent with wallet approval. No simulated balances, orders or trading. Swap, perps, lending and bridges are unavailable.</span>
        </div>
        {wallet.error&&<div className="wallet-error"><CircleAlert size={16}/><span>{wallet.error}</span></div>}
        {copyError&&<div className="wallet-error"><CircleAlert size={16}/><span>{copyError}</span><button className="mini-btn" onClick={()=>setCopyError('')}>Dismiss</button></div>}
        {wallet.connection&&<div className="connected-readout">
          <CheckCircle2 size={15}/><span>{wallet.connection.network} wallet</span>
          <span className="wallet-address">{wallet.connection.address}</span>
          <button title="Copy wallet address" aria-label="Copy wallet address" onClick={()=>void navigator.clipboard.writeText(wallet.connection!.address).catch(()=>setCopyError('Could not copy wallet address'))}><Copy size={14}/></button>
          <span className="live-balance">Unlocked: {wallet.connection.unlocked} BDX{wallet.connection.approximate?' (approx.)':''}</span>
        </div>}
        {page==='Testnet'&&<BeldexTestnetPage wallet={wallet}/>}
        {page==='Swap'&&<SwapSection wallet={wallet} onOpenTestnet={()=>go('Testnet')}/>}
        {page==='Perps'&&<PerpsSection wallet={wallet} onOpenTestnet={()=>go('Testnet')}/>}
        {page==='Lend'&&<LendSection wallet={wallet} onOpenTestnet={()=>go('Testnet')}/>}
        {page==='Routes'&&<RoutesSection/>}
        {page==='Portfolio'&&<LivePortfolio wallet={wallet}/>}
        {page==='Security'&&<LiveSecurityPage/>}
        {page==='Launch'&&<LiveLaunchPage wallet={wallet}/>}
        <footer className="main-footer"><span>© 2026 HOXO. Developed by Mushee.</span>
          <span><LockKeyhole size={13}/> Beldex testnet · Wallet-controlled approvals</span>
        </footer>
      </main>
    </div>
  </div>
}
