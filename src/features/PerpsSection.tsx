import { Activity, BarChart3, LockKeyhole, ShieldAlert, ShieldCheck, Wallet } from 'lucide-react'
import type { useBeldexWallet } from '../hooks/useBeldexWallet'

type Wallet = ReturnType<typeof useBeldexWallet>
/** Isolated derivatives section: no paper balances or simulated orderbook. */
export function PerpsSection({ wallet, onOpenTestnet }: { wallet: Wallet; onOpenTestnet: () => void }) {
  return <div className="stack" data-section="perps">
    <div className="section-header">
      <div><div className="eyebrow">HOXO / PERPETUALS</div><h1><BarChart3 size={29}/> Perps</h1>
        <p>Margin-trading infrastructure, position security and oracle readiness for future Beldex perpetual markets.</p></div>
      <span className="subtle-pill">MARKETS NOT OPEN</span>
    </div>
    <section className="panel">
      <div className="card-heading"><h3><ShieldAlert size={17}/> Trading engine status</h3><span className="side-pill short">NOT DEPLOYED</span></div>
      <p className="muted smaller">No real orders can be opened or liquidated. HOXO does not show made-up positions, charts, funding rates or leverages.</p>
      <div className="route-result-metrics">
        <span>Connected network<b>{wallet.connection?.network ?? 'Not connected'}</b></span>
        <span>Perps order execution<b>Disabled</b></span>
        <span>Margin custody<b>Unverified</b></span>
        <span>Live price oracle<b>Unavailable</b></span>
      </div>
    </section>
    <div className="protocol-section-grid">
      <section className="panel">
        <div className="card-heading"><h3><LockKeyhole size={17}/> Margin and custody</h3></div>
        <p className="muted smaller">User collateral cannot be deposited into a HOXO perpetual vault. No escrow, insurance pool or protocol account is configured.</p>
        <span className="side-pill short">DEPOSITS BLOCKED</span>
      </section>
      <section className="panel">
        <div className="card-heading"><h3><Activity size={17}/> Pricing and liquidation</h3></div>
        <p className="muted smaller">Real positions require independent, authenticated mark prices, funding indexes, margin limits and enforceable liquidations.</p>
        <span className="side-pill short">LIQUIDATION NOT VERIFIED</span>
      </section>
    </div>
    <section className="panel">
      <div className="card-heading"><h3><ShieldCheck size={17}/> Conditions for the first real perps market</h3></div>
      <ul className="protocol-requirements">
        <li>Reviewed Beldex-compatible position and collateral custody</li>
        <li>Authenticated matching, position lifecycle and funding settlement</li>
        <li>Production oracle with freshness, deviation and failure controls</li>
        <li>Independent security and economic audits plus funded testnet E2E</li>
      </ul>
      <button className="btn btn-outline" onClick={onOpenTestnet}><Wallet size={15}/> Inspect wallet connection</button>
    </section>
  </div>
}
