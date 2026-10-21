import { useState } from 'react'
import { ArrowRight, CheckCircle2, CircleAlert, ExternalLink, LockKeyhole, RefreshCw, Send, Wallet } from 'lucide-react'
import { MAX_TESTNET_SEND_BDX, isTestnet, validateTestnetSend } from '../lib/testnet'
import { type useBeldexWallet } from '../hooks/useBeldexWallet'

type WalletHook = ReturnType<typeof useBeldexWallet>

/** BDX native testnet transfer ONLY — unrelated to demo Swap, Perps or Lend. */
export function BeldexTestnetPage({ wallet }: { wallet: WalletHook }) {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('0.1')
  const [acknowledged, setAcknowledged] = useState(false)
  const connection = wallet.connection
  const testnet = isTestnet(connection?.network)
  let validation = ''
  if (connection?.unlockedAtomic !== null && connection?.unlockedAtomic !== undefined) {
    try { validateTestnetSend(connection.network, recipient, amount, connection.unlockedAtomic) }
    catch (e) { validation = e instanceof Error ? e.message : 'Invalid testnet request' }
  } else validation = 'Connect and refresh a Beldex TESTNET wallet to read an available BDX balance'
  const previousUnknown = Boolean(wallet.unresolvedLock) || wallet.transaction?.status === 'unknown'
  const canSend = testnet && !validation && acknowledged && !wallet.busySend && !previousUnknown
  return <div className="stack">
    <div className="section-header">
      <div><div className="eyebrow">MILESTONE 1 / REAL TESTNET INTEGRATION</div><h1>Beldex Testnet</h1>
        <p>Authorise an actual testnet-only BDX transaction in your own wallet. This is a native privacy-chain transfer — not a swap or a Privacy Token transaction.</p></div>
      <span className="subtle-pill">TESTNET BDX ONLY</span>
    </div>
    <div className="simulation-banner"><div><LockKeyhole size={17}/><span><b>Network safety:</b> This page refuses mainnet payments. Testnet BDX has no market value. Your wallet controls signing, and this app has no access to your keys.</span></div><span className="banner-label">NO MAINNET</span></div>
    <div className="overview-columns">
      <section className="panel">
        <div className="card-heading"><h3>Testnet wallet</h3><span className="subtle-pill">{testnet ? 'TESTNET VERIFIED' : connection ? 'WRONG NETWORK' : 'DISCONNECTED'}</span></div>
        <div className="route-result">
          <div className="route-result-title"><strong>Network</strong><span>{connection?.network || 'Not connected'}</span></div>
          <div className="route-result-metrics"><span>Unlocked test BDX<b>{connection ? connection.unlocked + ' BDX' : '—'}</b></span><span>Wallet sync height<b>{connection?.height === null || connection?.height === undefined ? 'Unavailable' : String(connection.height)}</b></span></div>
          {connection?.approximate && <p className="muted smaller"><CircleAlert size={13}/> Wallet balance is approximate while it completes syncing.</p>}
          {connection && <p className="muted smaller" style={{ overflowWrap: 'anywhere' }}>{connection.address}</p>}
        </div>
        {!connection && <button className="btn btn-primary" disabled={wallet.busy} onClick={() => void wallet.connect()}><Wallet size={16}/>{wallet.busy ? 'Connecting…' : 'Connect Beldex wallet'}</button>}
        {connection && <button className="btn btn-outline" onClick={() => void wallet.refresh()}><RefreshCw size={15}/> Refresh balance</button>}
        {connection && !testnet && <div className="wallet-error" style={{ marginTop: 14 }}><CircleAlert size={16}/> Mainnet detected. Sending is blocked. Switch to the Beldex Wallet testnet build and reconnect.</div>}
        <div className="privacy-box" style={{ marginTop: 18 }}><LockKeyhole size={18}/><div><b>Privacy scope</b><p>Beldex native UTXO transfers protect transaction details on-chain. This application still sees the recipient and amount you type. Never paste a seed phrase; metadata can be visible to your wallet or network provider.</p></div></div>
        <div className="route-field" style={{ marginTop: 14 }}><span>Get test BDX / explore testnet</span><div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <a className="mini-btn" target="_blank" rel="noreferrer" href="https://faucet.beldex.dev">Official testnet faucet <ExternalLink size={13}/></a>
          <a className="mini-btn" target="_blank" rel="noreferrer" href="https://testnet.beldex.dev">Testnet explorer <ExternalLink size={13}/></a>
        </div></div>
      </section>
      <section className="panel">
        <div className="card-heading"><h3>Private BDX testnet transfer</h3><span className="subtle-pill">WALLET APPROVAL REQUIRED</span></div>
        {wallet.unresolvedLock && <div className="wallet-error" style={{ display: 'block', marginBottom: 20 }}><b>Unresolved wallet operation — new sends locked</b><p>HOXO recorded an in-progress testnet send, possibly from a previous page session. Check the sending wallet's testnet history and receiving wallet, and confirm whether the payment occurred. Do not blindly send again.</p><label style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '14px 0' }}><input type="checkbox" checked={acknowledged} onChange={e => setAcknowledged(e.target.checked)}/> I have reconciled this operation directly in the wallet.</label><button className="btn btn-outline" disabled={!acknowledged || wallet.busySend} onClick={() => { wallet.clearReconciled(); setAcknowledged(false) }}>I verified the outcome — unlock new requests</button></div>}
        <div className="route-fields" style={{ gridTemplateColumns: '1fr' }}>
          <label className="route-field">Recipient's Beldex testnet address
            <input type="text" value={recipient} onChange={e => { setRecipient(e.target.value); setAcknowledged(false) }} placeholder="Paste a full Beldex wallet address" autoComplete="off" spellCheck={false}/>
          </label>
          <label className="route-field">Amount (test BDX)
            <input type="text" inputMode="decimal" value={amount} onChange={e => { setAmount(e.target.value); setAcknowledged(false) }} placeholder="0.1"/>
          </label>
        </div>
        <p className="muted smaller">Safety cap: {MAX_TESTNET_SEND_BDX} test BDX per wallet approval. Leave at least 0.01 test BDX unspent as a preliminary fee buffer. The wallet may charge a higher network fee.</p>
        {connection && validation && <p className="negative-text smaller">{validation}</p>}
        <label style={{ display: 'flex', gap: 10, alignItems: 'start', fontSize: 12, lineHeight: 1.5, margin: '18px 0' }}>
          <input type="checkbox" checked={acknowledged} onChange={e => setAcknowledged(e.target.checked)} style={{ marginTop: 4 }}/>
          <span>I checked the recipient and amount, and I understand this sends actual testnet BDX with a separate wallet approval. It does not execute an exchange trade.</span>
        </label>
        <button className="btn btn-primary full-width trade-cta" disabled={!canSend} onClick={() => { setAcknowledged(false); void wallet.sendTestnet(recipient, amount) }}>
          <Send size={17}/>{wallet.busySend ? 'Waiting for wallet approval…' : previousUnknown ? 'Previous outcome unknown — do not resend' : 'Request TESTNET wallet transfer'}<ArrowRight size={16}/>
        </button>
        {wallet.transaction && <div className="route-result" style={{ marginTop: 16 }}>
          <div className="route-result-title"><strong>Wallet operation: {wallet.transaction.status}</strong>{wallet.transaction.status === 'broadcast' ? <CheckCircle2 size={18}/> : <CircleAlert size={18}/>}</div>
          <p className="muted smaller">{wallet.transaction.message}</p>
          {wallet.transaction.txHash && <p className="smaller" style={{ overflowWrap: 'anywhere' }}>Wallet transaction hash: <code>{wallet.transaction.txHash}</code> <a href={"https://testnet.beldex.dev/tx/" + encodeURIComponent(wallet.transaction.txHash)} target="_blank" rel="noreferrer">Check on Beldex testnet explorer <ExternalLink size={13}/></a></p>}
          {wallet.transaction.fee && <p className="muted smaller">Wallet-reported network fee: {wallet.transaction.fee} test BDX</p>}
          {wallet.transaction.operationId && <button className="mini-btn" onClick={() => void wallet.refreshTransferStatus()}><RefreshCw size={13}/> Check wallet operation status</button>}
          {wallet.transaction.status === 'unknown' && <p className="negative-text smaller">Do not send the same payment again without resolving it in the Beldex wallet. A local timeout does not prove failure.</p>}
        </div>}
      </section>
    </div>
    <section className="panel">
      <div className="card-heading"><h3>Testnet wallet signature verification</h3><span className="subtle-pill">NON-CUSTODIAL</span></div>
      <p className="muted smaller">Prove control of this Beldex testnet wallet using a fresh one-time message approved inside the wallet. The browser verifies its signature through the official SDK. This demonstrates wallet signing, not a financial trade, not token privacy and not authenticated server login.</p>
      <button className="btn btn-outline" disabled={!testnet || wallet.busyProof} onClick={() => void wallet.proveTestnetWallet()}>
        <LockKeyhole size={15}/>{wallet.busyProof ? 'Approve the signature in your wallet…' : 'Sign and verify testnet ownership'}
      </button>
      {wallet.localProof && <div className="route-result" style={{ marginTop: 16 }}>
        <div className="route-result-title"><b>Testnet signature</b><span className="subtle-pill">{wallet.localProof.verified ? 'VERIFIED' : 'NOT VERIFIED'}</span></div>
        <p className="muted smaller" style={{ overflowWrap: 'anywhere' }}>Message: {wallet.localProof.message}</p>
        <p className="muted smaller" style={{ overflowWrap: 'anywhere' }}>Signature: {wallet.localProof.signature}</p>
        <p className="muted smaller">This proof is kept in memory only and is not a server-issued authentication challenge.</p>
      </div>}
    </section>
    <section className="panel">
      <div className="card-heading"><h3>Privacy Token support — next integration</h3><span className="subtle-pill">PENDING PUBLISHED API</span></div>
      <p className="muted smaller">Beldex Confidential Assets (Privacy Tokens) launched on testnet. The public `@bdxi/web3js` v1.0.1 SDK presently documents BDX native send and read operations but does not expose a documented Privacy Token issuance/transfer method. HOXO will not claim to issue a token or construct a private asset transfer using an invented RPC call.</p>
      <p className="muted smaller">Required: obtain the Beldex-supported Privacy Token creation/transfer interface, integrate asset-specific balances and exact units, use in-wallet authorisation, test issuance and two-wallet transfers, and verify confirmation in an owned testnet wallet before enabling any real private exchange flow.</p>
    </section>
  </div>
}
