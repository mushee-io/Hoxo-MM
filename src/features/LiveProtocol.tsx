import { ExternalLink, ShieldCheck } from 'lucide-react'
import { type useBeldexWallet } from '../hooks/useBeldexWallet'
import { CAPABILITY_CATALOGUE, capabilityAvailability } from '../lib/capabilities'
import { productionReadiness, READINESS_GATES } from '../lib/readiness'
import { MILESTONES } from '../lib/milestones'
import { TestnetAssetCatalogue } from './TestnetAssets'
import { MilestoneCrossboxes } from './MilestoneCrossboxes'
import { ReleaseChecklist } from './ReleaseChecklist'

type Wallet=ReturnType<typeof useBeldexWallet>
export function LiveSecurityPage(){
  const state=productionReadiness()
  const allSettlementMethodsBlocked=CAPABILITY_CATALOGUE.filter(x=>x.operation==='settlement').every(x=>x.state==='blocked')
  return <div className="stack" data-section="security">
    <div className="section-header"><div><div className="eyebrow">SECURITY</div><h1>Execution controls</h1>
      <p>Financial execution is restricted at the capability boundary, not by a cosmetic toggle.</p></div>
      <span className="subtle-pill">FINANCIAL SETTLEMENT OFF</span></div>
    <section className="panel">
      <div className="card-heading"><h3>Settlement safety</h3><span className="subtle-pill">{allSettlementMethodsBlocked?'DISABLED':'UNVERIFIED'}</span></div>
      <div className="privacy-box"><ShieldCheck size={20}/><div>
        <b>Unsupported DeFi calls are rejected</b>
        <p>The official Beldex wallet can read native wallet balances and approve native BDX testnet sends. Private asset swaps, lending, perps and bridges require separately audited infrastructure.</p>
      </div></div>
      <p className="muted smaller">No browser-local pause switch, fake collateral, mock liquidity or illustrative returns are active in the application.</p>
      <p className="muted smaller">Security disclosure: <a href="https://github.com/mushee-io/Hoxo-MM/security" target="_blank" rel="noreferrer">View repository security guidance <ExternalLink size={13}/></a></p>
    </section>
    <section className="panel"><h3>Outstanding production conditions ({state.blockers.length})</h3>
      {READINESS_GATES.filter(g=>g.state==='blocked').map(g=>
        <div key={g.id} className="route-result" style={{marginTop:12}}><b>{g.label}</b><p className="muted smaller">{g.requirement}</p></div>)}
    </section>
  </div>
}
export function LiveLaunchPage({wallet}: {wallet:Wallet}){
  const connection=wallet.connection
  const state=productionReadiness()
  const ctx={network:connection?.network??null,walletConnected:!!connection,
    unlockedAtomic:connection?.unlockedAtomic??null,approximateBalance:connection?.approximate??true}
  return <div className="stack" data-section="launch">
    <div className="section-header"><div><div className="eyebrow">DEVELOPMENT AND ACCEPTANCE</div><h1>Launch readiness</h1>
      <p>Review independently verifiable integration work and outstanding security requirements. No simulated financial services are accessible.</p></div>
      <span className="subtle-pill">PRODUCTION FINANCE BLOCKED</span></div>
    <div className="metrics-grid three">
      <div className="metric-card"><div className="metric-top">Tracked milestones</div><strong>{MILESTONES.length}</strong><span className="metric-sub">Research work is distinct from full acceptance</span></div>
      <div className="metric-card"><div className="metric-top">Acceptance remaining</div><strong>{MILESTONES.filter(m=>m.state!=='implemented').length}</strong><span className="metric-sub">Requires evidence, not checkboxes</span></div>
      <div className="metric-card"><div className="metric-top">Real DeFi settlement</div><strong>Off</strong><span className="metric-sub">No verified protocol settlement integration</span></div>
    </div>
    <section className="panel">
      <div className="card-heading"><h3>Beldex wallet state</h3><span className="subtle-pill">{connection?.network==='testnet'?'TESTNET CONNECTED':'NOT TESTNET CONNECTED'}</span></div>
      <div className="route-result-metrics">
        <span>Network<b>{connection?.network??'Disconnected'}</b></span>
        <span>Wallet scan height<b>{connection?.height??'Unknown'}</b></span>
        <span>Wallet operation<b>{wallet.transaction?.status??'Not observed in this session'}</b></span>
      </div>
      <p className="muted smaller">Connection information is wallet reported; it does not independently prove transaction inclusion or ownership of Privacy Tokens.</p>
    </section>
    <section className="panel">
      <div className="card-heading"><h3>Enforced capabilities</h3><span className="subtle-pill">SOURCE-CONTROLLED</span></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>Capability</th><th>Status</th><th>Reason</th></tr></thead><tbody>
        {CAPABILITY_CATALOGUE.filter(cap=>cap.state!=='demo-only').map(cap=>{
          const available=capabilityAvailability(cap.id,ctx)
          return <tr key={cap.id}><td><b>{cap.label}</b></td>
            <td><span className={'side-pill '+(available.available?'neutral':'short')}>{available.available?'AVAILABLE':'BLOCKED'}</span></td>
            <td className="readiness-requirement">{available.explanation}</td></tr>
        })}
      </tbody></table></div>
    </section>
    <MilestoneCrossboxes/>
    <TestnetAssetCatalogue purpose="launch"/>
    <ReleaseChecklist/>
    <section className="panel">
      <div className="card-heading"><h3>Independent release gates</h3><span className="subtle-pill">{state.requiredChecks} CONDITIONS</span></div>
      {READINESS_GATES.map(g=><div key={g.id} className="route-result" style={{marginTop:12}}>
        <b>{g.label}</b><span className="subtle-pill" style={{marginLeft:8}}>{g.state.toUpperCase()}</span>
        <p className="muted smaller">{g.requirement}</p></div>)}
    </section>
  </div>
}
