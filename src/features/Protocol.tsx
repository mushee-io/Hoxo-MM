import { useMemo, useState } from 'react'
import { ArrowLeftRight, ArrowRight, RefreshCw, ShieldCheck, ShieldAlert, LockKeyhole } from 'lucide-react'
import { assetSymbols, displayNumber, money, priceOf, type Asset } from '../lib/markets'
import { CHAINS, findDemoRoutes, MAX_DEMO_TRADE_USD, type ChainId, type RoutePlan } from '../lib/routes'
import { POLICY, type DemoPolicyState, LIVE_SETTLEMENT_ENABLED } from '../lib/security'
import { productionReadiness, READINESS_GATES } from '../lib/readiness'
import { MILESTONES, milestoneOverview } from '../lib/milestones'
import { CAPABILITY_CATALOGUE, capabilityAvailability, type CapabilityContext } from '../lib/capabilities'
import { estimateDemoEconomics } from '../lib/economics'
import { TestnetAssetCatalogue } from './TestnetAssets'
import { TokenIntegrationLab } from './ProtocolLabs'
import { type DemoState } from '../lib/demo'

export function RoutesPage({ demo, policy, onExecute }: {
  demo: DemoState
  policy: DemoPolicyState
  onExecute: (route: RoutePlan) => void
}) {
  const [from, setFrom] = useState<Asset>('BDX')
  const [to, setTo] = useState<Asset>('ETH')
  const [amount, setAmount] = useState('1000')
  const [destination, setDestination] = useState<ChainId>('beldex-testnet')
  const [refresh, setRefresh] = useState(0)
  const amountNumber = Number(amount)
  const info = useMemo(() => {
    try {
      return { quotes: findDemoRoutes(from, to, amountNumber, 0.5, demo.pools, 'beldex-testnet', destination), error: '' }
    } catch (e) {
      return { quotes: [] as RoutePlan[], error: e instanceof Error ? e.message : 'Could not calculate example routes' }
    }
  }, [from, to, amountNumber, destination, demo.pools, refresh])
  return <div className="stack">
    <div className="section-header"><div><div className="eyebrow">MILESTONE 05 / LIQUIDITY ROUTING</div><h1>Route explorer</h1><p>Compare browser-local swap paths and inspect external-chain integration readiness. No real cross-chain transfers.</p></div><span className="subtle-pill">RESEARCH PREVIEW</span></div>
    <div className="overview-columns">
      <section className="panel">
        <div className="card-heading"><h3>Explore a route</h3><span className="subtle-pill">BDX TESTNET · DEMO</span></div>
        <div className="route-fields">
          <label className="route-field">From asset
            <select value={from} onChange={e => { const next = e.target.value as Asset; if (next === to) setTo(from); setFrom(next) }}>{assetSymbols.map(a => <option key={a} value={a}>{a}</option>)}</select>
          </label>
          <label className="route-field">To asset
            <select value={to} onChange={e => { const next = e.target.value as Asset; if (next === from) setFrom(to); setTo(next) }}>{assetSymbols.map(a => <option key={a} value={a}>{a}</option>)}</select>
          </label>
          <label className="route-field">Quantity (virtual)
            <input type="number" min="0" step="any" value={amount} onChange={e => setAmount(e.target.value)}/>
          </label>
          <label className="route-field">Destination network
            <select value={destination} onChange={e => setDestination(e.target.value as ChainId)}>
              {(Object.keys(CHAINS) as ChainId[]).map(chain => <option key={chain} value={chain}>{CHAINS[chain].label}</option>)}
            </select>
          </label>
        </div>
        <div className="privacy-box" style={{ marginTop: 16 }}><ShieldAlert size={20}/><div><b>Bridge execution disabled</b><p>Beldex and external-chain bridge addresses, operators and trust assumptions have not been integrated or audited. External networks can reveal public activity even if the Beldex leg is confidential.</p></div></div>
        <p className="muted smaller">Illustrative route cap: {money(MAX_DEMO_TRADE_USD)}. Preview expires after 30 seconds. All pool balances and token prices are fictional.</p>
      </section>
      <section className="panel">
        <div className="card-heading"><h3>Available local paths</h3><button className="mini-btn" onClick={() => setRefresh(v => v + 1)}><RefreshCw size={13}/> Refresh</button></div>
        {info.error && <div className="wallet-error">{info.error}</div>}
        {destination !== 'beldex-testnet' ? <div className="empty-table"><LockKeyhole size={28}/><b>Cross-chain routes unavailable</b><span>No verified adapter for {CHAINS[destination].label} is connected. We will not fabricate quotes or accept deposits.</span></div> :
          info.quotes.length ? info.quotes.map(route => <div className="route-result" key={route.id}>
            <div className="route-result-title"><strong>{route.id === 'direct' ? 'Direct pool' : 'Two-hop via demo USDT'}</strong><span className="subtle-pill">LOCAL ONLY</span></div>
            <div className="route-path"><ArrowLeftRight size={16}/> {route.path.join(' → ')}</div>
            <div className="route-result-metrics"><span>Example output <b>{displayNumber(route.estimatedOut, 6)} {to}</b></span><span>Min. received <b>{displayNumber(route.minOut, 6)} {to}</b></span></div>
            <button className="btn btn-primary full-width" disabled={policy.paused || amountNumber > demo.balances[from]} onClick={() => onExecute(route)}>Execute local simulation <ArrowRight size={15}/></button>
          </div>) : !info.error && <div className="empty-table"><ArrowLeftRight size={26}/><b>No routes available</b><span>Choose an amount and two different assets.</span></div>}
        {destination === 'beldex-testnet' && <p className="muted smaller">Simulated USD value: {Number.isFinite(amountNumber) && amountNumber > 0 ? money(amountNumber * priceOf(from)) : '—'}. This interface never calls a bridge.</p>}
      </section>
    </div>
  </div>
}

export function SecurityPage({ policy, poolFeesUsd, onPause }: { policy: DemoPolicyState; poolFeesUsd: number; onPause: () => void }) {
  const fees = estimateDemoEconomics(poolFeesUsd)
  return <div className="stack">
    <div className="section-header"><div><div className="eyebrow">MILESTONE 06 / PROTOCOL CONTROLS</div><h1>Safety centre</h1><p>Protective guardrails for HOXO's offline simulator. These controls do not secure real assets.</p></div><span className="subtle-pill">DEMO POLICY</span></div>
    <div className="panel">
      <div className="card-heading"><h3>Session-wide demo pause</h3><span className="subtle-pill">{policy.paused ? 'PAUSED' : 'ACTIVE · DEMO'}</span></div>
      <div className="privacy-box"><ShieldCheck size={22}/><div><b>Reduce risk, even when paused</b><p>Pausing prevents new demo swaps, routed trades, leveraged positions, loans and collateral withdrawals. Position closes, repayments and collateral supply remain available. Reloading resets this session-only control.</p></div></div>
      <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={onPause}>{policy.paused ? 'Resume demo actions' : 'Pause new demo risk actions'}</button>
    </div>
    <div className="metrics-grid three">
      <div className="metric-card"><div className="metric-top">Swap trade cap</div><strong>{money(POLICY.maxSwapUsd)}</strong><span className="metric-sub">Per browser-local action</span></div>
      <div className="metric-card"><div className="metric-top">Perpetual leverage cap</div><strong>{POLICY.maxLeverage}×</strong><span className="metric-sub">{money(POLICY.maxPerpNotionalUsd)} demo notional cap</span></div>
      <div className="metric-card"><div className="metric-top">New loan cap</div><strong>{money(POLICY.maxNewBorrowUsd)}</strong><span className="metric-sub">Plus 70% LTV checks</span></div>
    </div>
    <div className="panel"><div className="card-heading"><h3>Example protocol economics</h3><span className="subtle-pill">LOCAL SIMULATION · NO REAL FUNDS</span></div>
      <p className="muted smaller">Hypothetical allocation of 0.3% AMM pool fees generated by your local swaps. The proposal gives 90% of the pool fees to liquidity providers, with 10% to the protocol; protocol revenue is then allocated 25% to a potential BDX buyback, 50% to security reserves and 25% to operations. No BDX is purchased or burned.</p>
      <div className="metrics-grid three">
        <div className="metric-card"><div className="metric-top">Example total pool fees</div><strong>{money(fees.poolFeesUsd)}</strong><span className="metric-sub">Virtual trade fee accounting</span></div>
        <div className="metric-card"><div className="metric-top">Example protocol revenue</div><strong>{money(fees.protocolRevenueUsd)}</strong><span className="metric-sub">10% illustrative protocol share</span></div>
        <div className="metric-card"><div className="metric-top">Potential BDX allocation</div><strong>{money(fees.proposedBuybackUsd)}</strong><span className="metric-sub">Not a purchase or burn</span></div>
      </div><p className="muted smaller">Estimated liquidity-provider share: {money(fees.liquidityProviderFeesUsd)} · Security reserve: {money(fees.securityReserveUsd)} · Operating budget: {money(fees.operationsUsd)}. All figures use synthetic demo token prices.</p>
    </div>
    <div className="panel"><h3>Production protection is not enabled</h3><p className="muted smaller">This frontend cannot enforce global kill switches or prove privacy, and it contains no settlement key, vault, market-maker wallet or authorised financial operator. A real launch requires authenticated service controls, independently audited contracts, incident-response procedures and externally verifiable settlement.</p><p className="muted smaller">Live execution flag: <strong>{LIVE_SETTLEMENT_ENABLED ? 'enabled' : 'disabled by code'}</strong></p></div>
  </div>
}

export function LaunchPage({ walletNetwork, walletHeight, walletTransfer, walletBalanceAtomic, walletBalanceApproximate }: {
  walletNetwork: string | null
  walletHeight: number | null
  walletTransfer: string | null
  walletBalanceAtomic: bigint | null
  walletBalanceApproximate: boolean
}) {
  const state = productionReadiness()
  const context: CapabilityContext = {
    network: walletNetwork, walletConnected: walletNetwork !== null,
    unlockedAtomic: walletBalanceAtomic, approximateBalance: walletBalanceApproximate,
  }
  return <div className="stack">
    <div className="section-header"><div><div className="eyebrow">MILESTONE 07 / RELEASE READINESS</div><h1>Launch readiness</h1><p>Track what is in the functioning prototype and what still blocks mainnet financial products.</p></div><span className="subtle-pill">MAINNET BLOCKED</span></div>
    <div className="metrics-grid three">
      <div className="metric-card"><div className="metric-top">Prototype components</div><strong>{state.prototypeCount}</strong><span className="metric-sub">Implementation previews, not audits</span></div>
      <div className="metric-card"><div className="metric-top">Production blockers</div><strong>{state.blockers.length}</strong><span className="metric-sub">Required before live DeFi</span></div>
      <div className="metric-card"><div className="metric-top">DeFi settlement</div><strong>OFF</strong><span className="metric-sub">Only wallet-approved TESTNET native BDX sends can broadcast</span></div>
    </div>
    <div className="panel">
      <div className="card-heading"><h3>Beldex testnet connection checks</h3><span className="subtle-pill">{walletNetwork === 'testnet' ? 'TESTNET WALLET CONNECTED' : 'NOT VERIFIED'}</span></div>
      <div className="route-result-metrics">
        <span>Active wallet network<b>{walletNetwork ?? 'No wallet connected'}</b></span>
        <span>Wallet scan height<b>{walletHeight ?? 'Not available'}</b></span>
        <span>Latest native BDX send<b>{walletTransfer ?? 'Not attempted in session'}</b></span>
      </div>
      <p className="muted smaller">Live wallet connection uses the official Beldex SDK. Wallet scan height and wallet-returned hashes are not independent proof that a particular transaction reached finality. Swap settlement, lending contracts and private-asset transfer remain unavailable.</p>
      <p className="muted smaller">The release dashboard is operational on testnet as a readiness viewer; it does not deploy contracts or unlock exchange functionality.</p>
    </div>
    <section className="panel">
      <div className="card-heading"><h3>M1 / Runtime execution capabilities</h3><span className="subtle-pill">FAIL CLOSED</span></div>
      <p className="muted smaller">Capability status is sourced from the enforced execution boundary. A wallet-supported BDX transfer still needs user approval and funded two-wallet test evidence; browser simulations cannot become real trades.</p>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>Feature</th><th>Capability class</th><th>Availability</th><th>Trust boundary / blocker</th></tr></thead><tbody>
        {CAPABILITY_CATALOGUE.map(cap => {
          const available = capabilityAvailability(cap.id, context)
          return <tr key={cap.id}>
            <td><b>{cap.label}</b></td>
            <td>{cap.state === 'testnet-wallet' ? 'SDK testnet transfer' : cap.state === 'signed-proposal' ? 'Off-chain signature' : cap.state}</td>
            <td><span className={'side-pill ' + (available.available ? 'neutral' : 'short')}>{!available.available ? 'BLOCKED / NOT READY' : cap.state === 'demo-only' ? 'SIMULATION' : cap.state === 'signed-proposal' ? 'SIGNATURE ONLY' : cap.state === 'testnet-wallet' ? 'TESTNET WALLET' : 'READ ONLY'}</span></td>
            <td className="readiness-requirement">{available.explanation}</td>
          </tr>
        })}
      </tbody></table></div>
    </section>
    <section className="panel">
      <div className="card-heading"><h3>Development milestones 1–20</h3><span className="subtle-pill">{milestoneOverview().completed} / 20 VERIFIED IN CODE</span></div>
      <p className="muted smaller">Status is evidence-based. Research maths and off-chain approvals do not constitute live trading. Upstream dependencies and real-world wallet tests cannot be completed by frontend changes alone.</p>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>#</th><th>Workstream</th><th>Status</th><th>Evidence / implementation</th><th>Required acceptance</th></tr></thead><tbody>
        {MILESTONES.map(m => <tr key={m.number}><td>{m.number}</td><td><b>{m.title}</b></td><td><span className={'side-pill ' + (m.state === 'implemented' ? 'neutral' : m.state === 'blocked' ? 'short' : '')}>{m.state.toUpperCase()}</span></td><td className="readiness-requirement">{m.evidence}</td><td className="readiness-requirement">{m.nextGate}</td></tr>)}
      </tbody></table></div>
    </section>
    <TestnetAssetCatalogue purpose="launch"/>
    <TokenIntegrationLab/>
    <div className="panel"><div className="card-heading"><h3>Release gate checklist</h3><span className="subtle-pill">{state.requiredChecks} CONDITIONS</span></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>Area</th><th>Gate</th><th>State</th><th>Required work</th></tr></thead><tbody>
        {READINESS_GATES.map(g => <tr key={g.id}><td>{g.area}</td><td><b>{g.label}</b></td><td>{g.state === 'blocked' ? <span className="side-pill short">BLOCKED</span> : <span className="side-pill neutral">PROTOTYPE</span>}</td><td className="readiness-requirement">{g.requirement}</td></tr>)}
      </tbody></table></div>
    </div>
    <div className="panel"><h3>What can be deployed?</h3><p className="muted smaller">The HOXO research application can be published with prominent warnings, security headers and no production DeFi transaction features. The Testnet tab can request native BDX transfers with wallet approval but no mainnet activity. A deployed website is not an approved or audited exchange, bridge or lending protocol.</p><a className="btn btn-outline" href="https://github.com/mushee-io/Hoxo-MM/blob/main/docs/ROADMAP.md" target="_blank" rel="noreferrer">Review milestone requirements <ArrowRight size={15}/></a></div>
  </div>
}
