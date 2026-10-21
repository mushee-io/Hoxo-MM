import { ArrowRight, Landmark, LockKeyhole, ShieldAlert, ShieldCheck, Wallet } from 'lucide-react'
import type { useBeldexWallet } from '../hooks/useBeldexWallet'
import { privateAssetMethodReadiness } from '../lib/privacyCapabilities'
import { TestnetAssetCatalogue } from './TestnetAssets'

type Wallet = ReturnType<typeof useBeldexWallet>
/** Real-token discovery without faux lending APYs, positions, collateral or borrow controls. */
export function LendSection({ wallet, onOpenTestnet }: { wallet: Wallet; onOpenTestnet: () => void }) {
  const capability = privateAssetMethodReadiness()
  return <div className="stack" data-section="lend">
    <div className="section-header">
      <div><div className="eyebrow">HOXO / LENDING</div><h1><Landmark size={29}/> Lend</h1>
        <p>Separate supply, collateral and borrowing integration workspace for Beldex. No synthetic yield or debt.</p></div>
      <span className="subtle-pill">LENDING UNAVAILABLE</span>
    </div>
    <section className="panel">
      <div className="card-heading"><h3><LockKeyhole size={17}/> Lending availability</h3><span className="side-pill short">NO LOAN MARKET</span></div>
      <div className="privacy-box"><ShieldAlert size={18}/><div><b>Assets cannot be deposited or borrowed</b><p>HOXO has no verified lending escrow, loan liquidity, debt ledger or contract-enforced collateral release. We do not display fictitious APRs or available liquidity.</p></div></div>
      <div className="route-result-metrics" style={{ marginTop: 15 }}>
        <span>Wallet network<b>{wallet.connection?.network ?? 'Not connected'}</b></span>
        <span>Token balances via wallet API<b>{capability.privateAssetBalance ? 'Supported' : 'Unavailable'}</b></span>
        <span>Supplied collateral<b>No onchain vault</b></span>
        <span>Borrowable liquidity<b>Not verified</b></span>
      </div>
    </section>
    <div className="protocol-section-grid">
      <section className="panel">
        <div className="card-heading"><h3>Supply and withdraw</h3><span className="side-pill short">BLOCKED</span></div>
        <p className="muted smaller">Deposits and withdrawals require a verified custody mechanism and a direct Beldex wallet authorisation. HOXO cannot hold supplied assets.</p>
      </section>
      <section className="panel">
        <div className="card-heading"><h3>Borrow and repay</h3><span className="side-pill short">BLOCKED</span></div>
        <p className="muted smaller">Real lending needs measured utilisation, enforceable principal and interest, debt repayment, and collateral conservation.</p>
      </section>
      <section className="panel">
        <div className="card-heading"><h3>Collateral risk</h3><span className="side-pill short">UNVERIFIED</span></div>
        <p className="muted smaller">Fresh, independent asset-price oracles, loan-to-value limits, and economically safe liquidation are required before borrowing can launch.</p>
      </section>
      <section className="panel">
        <div className="card-heading"><h3><ShieldCheck size={16}/> Audit requirements</h3></div>
        <p className="muted smaller">Funded two-wallet supply, borrow, repay and release trials plus independent contract and economic review must pass first.</p>
      </section>
    </div>
    <button className="btn btn-outline protocol-inline-action" onClick={onOpenTestnet}><Wallet size={15}/> View native BDX wallet <ArrowRight size={14}/></button>
    <TestnetAssetCatalogue purpose="lend"/>
  </div>
}
