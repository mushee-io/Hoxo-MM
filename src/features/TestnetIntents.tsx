import { useState } from 'react'
import { ArrowRight, CheckCircle2, LockKeyhole, ShieldAlert, Wallet } from 'lucide-react'
import { type useBeldexWallet } from '../hooks/useBeldexWallet'

type WalletHook = ReturnType<typeof useBeldexWallet>
export function TestnetIntentPanel({ kind, wallet }: { kind: 'swap' | 'lend'; wallet: WalletHook }) {
  const [amount, setAmount] = useState('0.1')
  const [desiredAsset, setDesiredAsset] = useState('PRIVACY_TOKEN')
  const [apr, setApr] = useState('500')
  const isTestnet = wallet.connection?.network === 'testnet'
  const latest = wallet.signedIntents.find(i => i.kind === kind)
  return <section className="panel">
    <div className="card-heading">
      <h3>{kind === 'swap' ? 'Beldex testnet swap readiness' : 'Beldex testnet lending readiness'}</h3>
      <span className="subtle-pill">WALLET SIGNATURE · NOT SETTLEMENT</span>
    </div>
    <div className="privacy-box"><ShieldAlert size={19}/><div>
      <b>{kind === 'swap' ? 'Real swap settlement is not yet connected' : 'Real collateralised lending is not yet connected'}</b>
      <p>{kind === 'swap'
        ? 'The public wallet SDK does not expose Privacy Token transfers or atomic token-for-token exchange. You can approve and verify a proposed testnet swap intent, but this does NOT transfer or exchange assets.'
        : 'The public wallet interface does not enforce collateral deposits, borrowing, repayment or liquidation. You can approve and verify a lending proposal, but this does NOT make a loan or accrue yield.'}</p>
    </div></div>
    <div className="route-fields" style={{ marginTop: 18 }}>
      <label className="route-field">Amount of proposed test BDX
        <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.1" />
      </label>
      {kind === 'swap' ? <label className="route-field">Proposed target asset label (not a verified testnet token)
        <input type="text" value={desiredAsset} onChange={e => setDesiredAsset(e.target.value.toUpperCase())} maxLength={20}/>
      </label> : <label className="route-field">Proposed annual rate (basis points; 500 = 5%)
        <input type="number" min="0" max="10000" step="1" value={apr} onChange={e => setApr(e.target.value)}/>
      </label>}
    </div>
    <p className="muted smaller">This is an off-chain message signed by your TESTNET wallet, not a transaction and not a quoted exchange rate. No assets are locked or sent. Signature data remains in browser memory only.</p>
    {!wallet.connection && <button className="btn btn-outline" onClick={() => void wallet.connect()} disabled={wallet.busy}><Wallet size={15}/> Connect testnet wallet</button>}
    {wallet.connection && !isTestnet && <p className="negative-text smaller">Switch your Beldex wallet to TESTNET. Mainnet signing is disabled for this flow.</p>}
    <button className="btn btn-primary full-width" style={{ marginTop: 12 }} disabled={!isTestnet || wallet.busyIntent}
      onClick={() => void wallet.signTestnetIntent(kind === 'swap'
        ? { kind: 'swap', amount, desiredAsset }
        : { kind: 'lend', amount, aprBps: Number(apr) })}>
      <LockKeyhole size={15}/>
      {wallet.busyIntent ? 'Waiting for wallet signature…' : kind === 'swap' ? 'Sign proposed swap — no transaction' : 'Sign proposed loan — no transaction'}
      <ArrowRight size={15}/>
    </button>
    {latest && <div className="route-result" style={{ marginTop: 16 }}>
      <div className="route-result-title"><strong><CheckCircle2 size={15}/> Signature verified</strong><span className="subtle-pill">NOT EXECUTED</span></div>
      <p className="muted smaller" style={{ overflowWrap: 'anywhere' }}>{latest.message}</p>
      <p className="muted smaller">No testnet swap, deposit, lending debt or exchange settlement occurred. The signed proposal expires five minutes after creation.</p>
    </div>}
    <p className="muted smaller" style={{ marginTop: 12 }}>
      <a href="https://github.com/mushee-io/Hoxo-MM/issues/3" rel="noreferrer" target="_blank">Privacy Token SDK integration requirements →</a>
    </p>
  </section>
}
