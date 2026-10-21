import { ArrowLeftRight, ArrowRight, Database, LockKeyhole, ShieldCheck, Wallet } from 'lucide-react'
import type { useBeldexWallet } from '../hooks/useBeldexWallet'
import { privateAssetMethodReadiness } from '../lib/privacyCapabilities'
import { TestnetAssetCatalogue } from './TestnetAssets'

type Wallet = ReturnType<typeof useBeldexWallet>

/** Native BDX movement is never represented as a token swap. */
export function SwapSection({ wallet, onOpenTestnet }: { wallet: Wallet; onOpenTestnet: () => void }) {
  const bridge = privateAssetMethodReadiness()
  return <div className="stack" data-section="swap">
    <div className="section-header">
      <div><div className="eyebrow">HOXO / SWAP</div><h1><ArrowLeftRight size={29}/> Swap</h1>
        <p>Dedicated Beldex asset-exchange workspace: token discovery, integration checks and real-settlement requirements.</p></div>
      <span className="subtle-pill">TRADING UNAVAILABLE</span>
    </div>
    <section className="panel">
      <div className="card-heading"><h3><LockKeyhole size={17}/> Swap execution</h3><span className="side-pill short">DISABLED</span></div>
      <div className="privacy-box"><ShieldCheck size={18}/><div>
        <b>No fake swaps or estimated market prices</b>
        <p>There is no verified liquidity pool, execution venue, private-token wallet transfer or two-sided settlement. HOXO will not request funds or display fabricated quotes.</p>
      </div></div>
      <div className="route-result-metrics" style={{ marginTop: 15 }}>
        <span>Connected Beldex wallet<b>{wallet.connection ? wallet.connection.network.toUpperCase() : 'Not connected'}</b></span>
        <span>Private-token transfer API<b>{bridge.privateAssetTransfer ? 'Supported' : 'Not published'}</b></span>
        <span>Swap settlement<b>Not deployed</b></span>
      </div>
      <button className="btn btn-outline" onClick={onOpenTestnet}><Wallet size={15}/> Open actual testnet wallet <ArrowRight size={15}/></button>
      <p className="muted smaller">The wallet's supported native BDX transfer is not a Swap transaction.</p>
    </section>
    <div className="protocol-section-grid">
      <section className="panel">
        <div className="card-heading"><h3><Database size={16}/> Asset discovery</h3></div>
        <p className="muted smaller">Discover public Privacy Token identifiers in the network registry. Metadata alone cannot confirm available liquidity or private balances.</p>
      </section>
      <section className="panel">
        <div className="card-heading"><h3><ShieldCheck size={16}/> Real swap activation gates</h3></div>
        <ul className="protocol-requirements">
          <li>Wallet-authorised confidential asset transfers</li>
          <li>Authenticated and funded executable market-maker quotes</li>
          <li>Audited atomic or enforceable two-party settlement</li>
          <li>Independent testnet wallet-to-wallet reconciliation</li>
        </ul>
      </section>
    </div>
    <TestnetAssetCatalogue purpose="swap"/>
  </div>
}
