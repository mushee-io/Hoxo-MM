import { useState } from 'react'
import { ShieldAlert, FlaskConical, LockKeyhole } from 'lucide-react'
import { emptyPaperClearing, fundPaperAccount, openMatchedPaperPerps, applyPaperFunding,
  closeMatchedPaperPerps, type PaperClearing } from '../lib/perpsClearingResearch'
import { BRIDGE_RESEARCH_NETWORKS, draftBridgeResearch, recordBridgeResearchEvidence,
 assessBridgeReadiness, type BridgeResearchRoute } from '../lib/bridgeResearch'
import { type ChainId } from '../lib/routes'

const USD_SCALE=100_000_000n
function parseAmount(raw:string):bigint {
 if(!/^(0|[1-9]\d{0,9})(?:\.\d{1,8})?$/.test(raw))throw new Error('Use a nonnegative decimal with up to eight places')
 const [int,dec='']=raw.split('.')
 const num=BigInt(int)*USD_SCALE+BigInt(dec.padEnd(8,'0')||'0')
 if(num<=0n)throw new Error('Enter an amount greater than zero')
 return num
}
function fmt(raw:bigint):string {
 const neg=raw<0n
 const n=neg?-raw:raw
 const frac=(n%USD_SCALE).toString().padStart(8,'0').replace(/0+$/,'')
 return (neg?'-':'')+(n/USD_SCALE).toString()+(frac?'.'+frac:'')
}
function fixture(raw:string,now:number){
 return { priceUsdE8:parseAmount(raw),observedAtMs:now,source:'research-fixture' as const }
}
/**
 * M18: matched virtual perps, with physically unspendable toy balances,
 * zero-sum funding and P&L, rejection of bankrupt fictional positions.
 */
export function PerpsClearingLab(){
 const [ledger,setLedger]=useState<PaperClearing>(emptyPaperClearing)
 const [entry,setEntry]=useState('200')
 const [mark,setMark]=useState('210')
 const [margin,setMargin]=useState('100')
 const [leverage,setLeverage]=useState('5')
 const [funding,setFunding]=useState('10')
 const [message,setMessage]=useState('')
 const [error,setError]=useState('')
 const livePair=ledger.positions[0]?.pairId
 function apply(action:'fund'|'open'|'funding'|'close'){
  try {
   const now=Date.now()
   let next=ledger
   if(action==='fund'){
    next=fundPaperAccount(next,'paper-long',parseAmount('1000'))
    next=fundPaperAccount(next,'paper-short',parseAmount('1000'))
   }else if(action==='open'){
    next=openMatchedPaperPerps(next,'paper-long','paper-short','paper-'+crypto.randomUUID(),
      parseAmount(margin),Number(leverage),fixture(entry,now),now)
   }else if(action==='funding'){
    if(!livePair)throw new Error('Fund and open paper positions first')
    next=applyPaperFunding(next,livePair,Number(funding))
   }else if(action==='close'){
    if(!livePair)throw new Error('No paired paper position to close')
    next=closeMatchedPaperPerps(next,livePair,fixture(mark,now),now)
   }
   setLedger(next)
   setError('')
   setMessage(action==='fund'?'Added 1000 fictional USD to each paper account.'
      :action==='open'?'Opened opposite paper positions. The model requires two fictional parties.'
      :action==='funding'?'Virtual funding transferred between accounts; ledger total conserved.'
      :'Simulated both counterparties closing; no chain settlement occurred.')
  }catch(cause){setError(cause instanceof Error?cause.message:'Paper perps operation refused');setMessage('')}
 }
 return <section className="panel">
  <div className="card-heading"><h3><FlaskConical size={16}/> M18 / Matched perpetuals clearing research</h3><span className="subtle-pill">NO LIVE PERPS</span></div>
  <div className="privacy-box"><ShieldAlert size={18}/><div><b>Offline account model only</b><p>No market-maker, margin escrow, liquidation keeper, price oracle or on-chain settlement is connected. Account cash, funding, P&amp;L and insurance shortfalls here are entirely virtual.</p></div></div>
  <div className="route-result-metrics" style={{marginTop:14}}>
   <span>Paper long available<b>{fmt(ledger.balances['paper-long']?.availableUsdE8??0n)}</b></span>
   <span>Paper short available<b>{fmt(ledger.balances['paper-short']?.availableUsdE8??0n)}</b></span>
   <span>Virtual ledger funding<b>{fmt(ledger.injectedUsdE8)}</b></span>
   <span>Open paper positions<b>{ledger.positions.length}</b></span>
  </div>
  <div className="route-fields" style={{marginTop:14}}>
   <label className="route-field">Entry price (USD fixture)<input value={entry} onChange={e=>setEntry(e.target.value)}/></label>
   <label className="route-field">Exit mark (USD fixture)<input value={mark} onChange={e=>setMark(e.target.value)}/></label>
   <label className="route-field">Margin USD per side<input value={margin} onChange={e=>setMargin(e.target.value)}/></label>
   <label className="route-field">Leverage (1–10)<input type="number" min="1" max="10" value={leverage} onChange={e=>setLeverage(e.target.value)}/></label>
   <label className="route-field">Funding bps (long pays if positive)<input type="number" min="-100" max="100" value={funding} onChange={e=>setFunding(e.target.value)}/></label>
  </div>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}>
   <button className="btn btn-outline" onClick={()=>apply('fund')}>Fund paper accounts</button>
   <button className="btn btn-outline" onClick={()=>apply('open')}>Open matched paper orders</button>
   <button className="btn btn-outline" onClick={()=>apply('funding')}>Apply virtual funding</button>
   <button className="btn btn-outline" onClick={()=>apply('close')}>Close paired paper orders</button>
   <button className="btn btn-outline" onClick={()=>{setLedger(emptyPaperClearing());setError('');setMessage('Paper book reset')}}>Reset</button>
  </div>
  {message&&<p className="muted smaller">{message}</p>}
  {error&&<p role="alert" className="negative-text smaller">{error}</p>}
  <p className="muted smaller"><LockKeyhole size={13}/> Insurance pool, real margin deposits, automatic liquidation and actual derivatives fills remain blocked. Negative-equity paper closure is refused rather than inventing an insurance payout.</p>
 </section>
}
/** M19: honest external bridge readiness and note-only incident lifecycle. */
export function BridgeResearchLab(){
 const [destination,setDestination]=useState<ChainId>('base')
 const [assetId,setAssetId]=useState('a'.repeat(64))
 const [amount,setAmount]=useState('1000000000')
 const [route,setRoute]=useState<BridgeResearchRoute|null>(null)
 const [notes,setNotes]=useState('User-reported source wallet entry, not verified')
 const [message,setMessage]=useState('')
 const [error,setError]=useState('')
 function draft(){
  try{
   const now=Date.now()
   const next=draftBridgeResearch({id:'bridge-'+crypto.randomUUID(),source:'beldex-testnet',
     destination,assetId,amountAtomic:BigInt(amount),expiresAt:now+60000},now)
   setRoute(next);setMessage(assessBridgeReadiness(next).reason);setError('')
  }catch(cause){setError(cause instanceof Error?cause.message:'Invalid bridge draft')}
 }
 function record(next:'source-evidence-recorded'|'destination-evidence-recorded'|'timed-out'|'refund-evidence-recorded'|'disputed'){
  try {
   if(!route)throw new Error('Create a research route first')
   const changed=recordBridgeResearchEvidence(route,next,notes,Date.now())
   setRoute(changed);setMessage('Research note recorded — neither chain receipt nor refund independently verified.');setError('')
  }catch(cause){setError(cause instanceof Error?cause.message:'Research transition refused')}
 }
 return <section className="panel">
  <div className="card-heading"><h3><FlaskConical size={16}/> M19 / Cross-chain route safety review</h3><span className="subtle-pill">NO VERIFIED BRIDGE</span></div>
  <div className="privacy-box"><ShieldAlert size={18}/><div><b>Do not deposit assets into HOXO</b><p>Bridge adapters, relayers, audited contracts and refund mechanisms are not deployed or verified. This form accepts hypothetical routes and user-entered notes only. It cannot initiate cross-chain transactions.</p></div></div>
  <div className="table-scroll" style={{marginTop:14}}><table className="data-table"><thead><tr><th>Network</th><th>Audited adapter</th><th>Refund evidence</th></tr></thead><tbody>
   {BRIDGE_RESEARCH_NETWORKS.map(n=><tr key={n.id}><td>{n.label}</td><td>Not verified</td><td>Not verified</td></tr>)}
  </tbody></table></div>
  <div className="route-fields" style={{marginTop:14}}>
   <label className="route-field">Destination<select value={destination} onChange={e=>setDestination(e.target.value as ChainId)}>
    {BRIDGE_RESEARCH_NETWORKS.filter(x=>x.id!=='beldex-testnet').map(x=><option value={x.id} key={x.id}>{x.label}</option>)}
   </select></label>
   <label className="route-field">Public testnet token ID<input value={assetId} maxLength={64} onChange={e=>setAssetId(e.target.value)}/></label>
   <label className="route-field">Hypothetical atomic amount<input value={amount} onChange={e=>setAmount(e.target.value)}/></label>
  </div>
  <button className="btn btn-outline" onClick={draft}>Create non-executable bridge review</button>
  {route&&<div className="route-result" style={{marginTop:14}}>
   <div className="route-result-title"><b>Research route: {route.status}</b><span className="subtle-pill">SETTLEMENT OFF</span></div>
   <p className="muted smaller">Beldex testnet → {route.destination}. Notes are not independent chain confirmations. This case expires after 60 seconds.</p>
   <label className="route-field">Unverified case note<input value={notes} maxLength={200} onChange={e=>setNotes(e.target.value)}/></label>
   <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>
    <button className="mini-btn" onClick={()=>record('source-evidence-recorded')}>Record source claim</button>
    <button className="mini-btn" onClick={()=>record('destination-evidence-recorded')}>Record destination claim</button>
    <button className="mini-btn" onClick={()=>record('timed-out')}>Record timeout</button>
    <button className="mini-btn" onClick={()=>record('refund-evidence-recorded')}>Record claimed refund</button>
    <button className="mini-btn" onClick={()=>record('disputed')}>Mark disputed</button>
   </div>
   {route.notes.map((x,i)=><p key={i} className="muted smaller">{i+1}. {x}</p>)}
  </div>}
  {message&&<p className="muted smaller">{message}</p>}
  {error&&<p className="negative-text smaller" role="alert">{error}</p>}
 </section>
}
