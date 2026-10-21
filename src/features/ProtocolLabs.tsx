import { useRef, useState } from 'react'
import { ArrowRight, FlaskConical, LockKeyhole, ShieldAlert } from 'lucide-react'
import { prepareRegistrationReview, verifyRegisteredPublicDescriptor, type RegistrationReview } from '../lib/tokenRegistration'
import { preparePrivateTransfer } from '../lib/privateTransferReview'
import { inspectRfqDraft } from '../lib/researchRfq'
import { SpotResearchBook, simulateResearchAtomicSwap } from '../lib/spotResearch'
import { emptyResearchVault, applyResearchVaultAction, accrueResearchVaultInterest,
  simulateResearchLiquidation, type VaultAction, type VaultResearchState } from '../lib/researchLendingVault'
import { researchOracleConsensus } from '../lib/researchOracle'
import { formatAtomicAssetBalance, parseVerifiedPublicTokenLookup } from '../lib/testnetCatalogue'

const TOKEN_ID_A = 'a'.repeat(64)
const TOKEN_ID_B = 'b'.repeat(64)
const RESULT_STYLE = { overflowWrap: 'anywhere' as const }
function researchUsd(input: string): bigint {
  if (!/^(0|[1-9]\d{0,9})(?:\.\d{1,8})?$/.test(input)) throw new Error('Enter an exact USD research amount, maximum eight decimals')
  const [whole, fraction=''] = input.split('.')
  const atomic=BigInt(whole)*100_000_000n+BigInt(fraction.padEnd(8,'0')||'0')
  if (atomic<=0n) throw new Error('Enter a positive research amount')
  return atomic
}
function showUsd(n: bigint): string { return formatAtomicAssetBalance(n.toString(),8) }
function DemoWarning({ children }: { children: React.ReactNode }) {
  return <div className="privacy-box"><ShieldAlert size={18}/><div><b>Testnet research · not a transaction</b><p>{children}</p></div></div>
}

/** M9 / M10: no wallet registration or asset-transfer RPC calls. */
export function TokenIntegrationLab() {
  const [ticker,setTicker]=useState('HOXO')
  const [name,setName]=useState('Hoxo Test Token')
  const [decimals,setDecimals]=useState('9')
  const [initial,setInitial]=useState('1000')
  const [max,setMax]=useState('100000')
  const [review,setReview]=useState<RegistrationReview|null>(null)
  const [assetId,setAssetId]=useState('')
  const [recipient,setRecipient]=useState('')
  const [amount,setAmount]=useState('1')
  const [result,setResult]=useState('')
  const [error,setError]=useState('')
  async function verify() {
    if(!review) return setError('Review your token parameters first')
    setError('');setResult('')
    try{
      const response=await fetch('/api/testnet-token?id='+encodeURIComponent(assetId),{cache:'no-store'})
      if(!response.ok)throw new Error('Public Beldex testnet registry did not confirm the asset ID')
      const body:unknown=await response.json()
      const token=parseVerifiedPublicTokenLookup(body,assetId)
      if(!token)throw new Error('Registry descriptor did not match the requested public asset ID')
      const verdict=verifyRegisteredPublicDescriptor(review,token)
      setResult(verdict.reason)
      if(!verdict.match)setError(verdict.reason)
    }catch(cause){setError(cause instanceof Error?cause.message:'Could not verify public metadata')}
  }
  function registerReview(){
    try {setReview(prepareRegistrationReview({ticker,name,decimals:Number(decimals),initialSupply:initial,maxSupply:max}));setError('');setResult('')}
    catch(cause){setError(cause instanceof Error?cause.message:'Invalid registration review')}
  }
  function transferReview(){
    try {
      const plan=preparePrivateTransfer({network:'beldex-testnet',assetId,recipient,amount,decimals:Number(decimals)})
      setResult('Preview only: '+plan.amountAtomic.toString()+' atomic units of '+plan.assetId.slice(0,12)+'… for '+plan.recipient.slice(0,12)+'… . No token was transferred.')
      setError('')
    }catch(cause){setError(cause instanceof Error?cause.message:'Invalid private token review')}
  }
  return <section className="panel">
    <div className="card-heading"><h3><FlaskConical size={16}/> M9–10 / Beldex Privacy Token workflow</h3><span className="subtle-pill">OFFICIAL WALLET REQUIRED</span></div>
    <DemoWarning>HOXO can validate intended token parameters and public testnet metadata. The published wallet SDK does not permit dApps to issue or send Privacy Tokens. Use the extension's own registration workflow; never submit keys to HOXO.</DemoWarning>
    <div className="route-fields" style={{marginTop:14}}>
      <label className="route-field">Token ticker<input value={ticker} onChange={e=>setTicker(e.target.value.toUpperCase())} maxLength={12}/></label>
      <label className="route-field">Public token name<input value={name} onChange={e=>setName(e.target.value)} maxLength={64}/></label>
      <label className="route-field">Decimals<input type="number" min="0" max="18" value={decimals} onChange={e=>setDecimals(e.target.value)}/></label>
      <label className="route-field">Initial supply<input value={initial} onChange={e=>setInitial(e.target.value)}/></label>
      <label className="route-field">Maximum supply<input value={max} onChange={e=>setMax(e.target.value)}/></label>
    </div>
    <button className="btn btn-outline" onClick={registerReview}>Validate token-registration parameters <ArrowRight size={14}/></button>
    {review && <p className="muted smaller">Reviewed {review.ticker}: {review.initialAtomic.toString()} initial atomic units, maximum {review.maximumAtomic.toString()}. Register through the official TESTNET wallet, not this page.</p>}
    <div className="route-fields" style={{marginTop:16}}>
      <label className="route-field">Registered asset ID (64 hex)<input value={assetId} onChange={e=>setAssetId(e.target.value)} maxLength={64}/></label>
      <label className="route-field">Transfer recipient (review only)<input value={recipient} onChange={e=>setRecipient(e.target.value)} autoComplete="off"/></label>
      <label className="route-field">Transfer amount (review only)<input value={amount} onChange={e=>setAmount(e.target.value)}/></label>
    </div>
    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
      <button className="btn btn-outline" onClick={()=>void verify()}>Compare public registry descriptor</button>
      <button className="btn btn-outline" onClick={transferReview}>Validate future token transfer — no send</button>
    </div>
    {result && <p className="muted smaller" style={RESULT_STYLE}>{result}</p>}
    {error && <p className="negative-text smaller" role="alert">{error}</p>}
  </section>
}

/** M11–14: visual, untrusted local quotes and conservative spot accounting. */
export function SpotResearchLab(){
  const book=useRef(new SpotResearchBook())
  const [from,setFrom]=useState(TOKEN_ID_A)
  const [to,setTo]=useState(TOKEN_ID_B)
  const [amount,setAmount]=useState('100')
  const [out,setOut]=useState('200')
  const [min,setMin]=useState('190')
  const [info,setInfo]=useState('')
  const [error,setError]=useState('')
  function prepare(){
    try{
      const now=Date.now()
      const quote=inspectRfqDraft({
        network:'beldex-testnet',quoteId:crypto.randomUUID(),
        makerLabel:'HOXO Research Fixture',fromAssetId:from,toAssetId:to,
        amountInAtomic:amount,expectedOutAtomic:out,minimumOutAtomic:min,expiresAtMs:now+30000,
      },now)
      const ticket=book.current.create('offline-research-account',quote,now)
      const ledgers={taker:{[quote.fromAssetId]:quote.amountInAtomic,[quote.toAssetId]:0n},
        maker:{[quote.fromAssetId]:0n,[quote.toAssetId]:quote.expectedOutAtomic}}
      const model=simulateResearchAtomicSwap(ledgers,quote,quote.expectedOutAtomic,now)
      setInfo('Offline quote '+ticket.quoteId.slice(0,8)+'… REVIEWED. Hypothetical settlement output: '+
        model.outputAtomic.toString()+' atomic units, assets conserved. Onchain settlement: DISABLED.')
      setError('')
    }catch(cause){setError(cause instanceof Error?cause.message:'Invalid research swap');setInfo('')}
  }
  return <section className="panel">
    <div className="card-heading"><h3><FlaskConical size={16}/> M11–14 / Spot clearing research</h3><span className="subtle-pill">SWAP EXECUTION BLOCKED</span></div>
    <DemoWarning>Build an untrusted example quote, validate expiry and minimum output, and run an atomic two-sided accounting fixture. These test tokens and liquidity are imaginary; there is no real market maker, custody, asset transfer, or wallet approval.</DemoWarning>
    <div className="route-fields" style={{marginTop:14}}>
      <label className="route-field">Input test asset ID<input value={from} onChange={e=>setFrom(e.target.value)} maxLength={64}/></label>
      <label className="route-field">Output test asset ID<input value={to} onChange={e=>setTo(e.target.value)} maxLength={64}/></label>
      <label className="route-field">Input amount (atomic)<input value={amount} onChange={e=>setAmount(e.target.value)}/></label>
      <label className="route-field">Quoted output (atomic)<input value={out} onChange={e=>setOut(e.target.value)}/></label>
      <label className="route-field">Minimum output (atomic)<input value={min} onChange={e=>setMin(e.target.value)}/></label>
    </div>
    <button className="btn btn-outline" onClick={prepare}><LockKeyhole size={15}/> Inspect and simulate hypothetical two-sided exchange</button>
    {info && <p className="muted smaller" style={RESULT_STYLE}>{info}</p>}
    {error && <p className="negative-text smaller" role="alert">{error}</p>}
  </section>
}

/** M15–17: local-only accounting with price-fixture oracle consensus. */
export function LendingResearchLab(){
  const [vault,setVault]=useState<VaultResearchState>(emptyResearchVault)
  const [owner,setOwner]=useState('research-user')
  const [action,setAction]=useState<VaultAction>('supply')
  const [amount,setAmount]=useState('100')
  const [price,setPrice]=useState('100')
  const [note,setNote]=useState('')
  const [error,setError]=useState('')
  const actions:VaultAction[]=['supply','withdraw-supply','deposit-collateral','withdraw-collateral','borrow','repay']
  function priceFixture(){
    const base=researchUsd(price)
    const now=Date.now()
    const result=researchOracleConsensus([
      {provider:'fixture-a',priceUsdE8:base,observedAtMs:now,mode:'fixture'},
      {provider:'fixture-b',priceUsdE8:base*1001n/1000n,observedAtMs:now,mode:'fixture'},
      {provider:'fixture-c',priceUsdE8:base*999n/1000n,observedAtMs:now,mode:'fixture'},
    ],now)
    return {price:result.price,now}
  }
  function run(){
    try{
      const {price:p,now}=priceFixture()
      const amt=action.includes('collateral')?researchUsd(amount)*10n:researchUsd(amount)
      const next=applyResearchVaultAction(vault,owner,action,amt,p,now)
      setVault(next)
      setNote('Research '+action+' updated only the local virtual ledger. Cash+debt=supply+interest.')
      setError('')
    }catch(e){setError(e instanceof Error?e.message:'Research action failed')}
  }
  function interest(){
    try{setVault(v=>accrueResearchVaultInterest(v,100));setNote('Applied 1% illustration to virtual outstanding debt; no real interest earned.');setError('')}
    catch(e){setError(e instanceof Error?e.message:'Could not accrue research interest')}
  }
  function liquidation(){
    try{
      const {price:p,now}=priceFixture()
      const updated=simulateResearchLiquidation(vault,owner,researchUsd(amount),p,now)
      setVault(updated.vault)
      setNote('Virtual liquidation applied; seized '+updated.seizedCollateralAtomic.toString()+' fictional collateral units. No actual token movement.')
      setError('')
    }catch(e){setError(e instanceof Error?e.message:'Research liquidation rejected')}
  }
  return <section className="panel">
    <div className="card-heading"><h3><FlaskConical size={16}/> M15–17 / Lending vault and oracle research</h3><span className="subtle-pill">SIMULATION ONLY</span></div>
    <DemoWarning>This is a separate BigInt accounting model, not a deployed collateral vault. Research oracle values are entered by you, not independently authenticated; no deposits, borrowing, interest or liquidation are real.</DemoWarning>
    <div className="route-result-metrics" style={{marginTop:14}}>
      <span>Fictional vault cash<b>{showUsd(vault.cashE8)}</b></span>
      <span>Fictional supplied<b>{showUsd(vault.suppliedE8)}</b></span>
      <span>Fictional total debt<b>{showUsd(vault.debtE8)}</b></span>
      <span>Fictional collateral (9 decimals)<b>{formatAtomicAssetBalance(vault.collateralAtomic.toString(),9)}</b></span>
      <span>Fictional accrued interest<b>{showUsd(vault.accruedInterestE8)}</b></span>
    </div>
    <div className="route-fields" style={{marginTop:14}}>
      <label className="route-field">Research account ID<input value={owner} onChange={e=>setOwner(e.target.value)} maxLength={64}/></label>
      <label className="route-field">Action<select value={action} onChange={e=>setAction(e.target.value as VaultAction)}>{actions.map(a=><option key={a} value={a}>{a}</option>)}</select></label>
      <label className="route-field">Amount (virtual USD, or collateral tokens)<input value={amount} onChange={e=>setAmount(e.target.value)}/></label>
      <label className="route-field">Fictional collateral price (USD)<input value={price} onChange={e=>setPrice(e.target.value)}/></label>
    </div>
    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
      <button className="btn btn-outline" onClick={run}>Apply local ledger action</button>
      <button className="btn btn-outline" onClick={interest}>Accrue 1% virtual debt interest</button>
      <button className="btn btn-outline" onClick={liquidation}>Test liquidation constraints</button>
      <button className="btn btn-outline" onClick={()=>{setVault(emptyResearchVault());setNote('Research vault reset');setError('')}}>Reset research vault</button>
    </div>
    {note&&<p className="muted smaller">{note}</p>}
    {error&&<p className="negative-text smaller" role="alert">{error}</p>}
  </section>
}
