import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownLeft, ArrowLeftRight, ArrowRight, ArrowUpRight, BarChart3,
  Check, ChevronDown, ChevronRight, CircleHelp, Clock3, Coins, Copy,
  ExternalLink, EyeOff, Landmark, LayoutDashboard, LockKeyhole, Menu,
  RefreshCw, RotateCcw, ShieldCheck, TrendingDown,
  TrendingUp, Wallet, X, Zap
} from 'lucide-react'
import { useBeldexWallet } from './hooks/useBeldexWallet'
import Landing from './Landing'
import { ASSETS, assetSymbols, displayNumber, money, priceOf, type Asset } from './lib/markets'
import { executeDemoSwap, quoteSwap, SWAP_FEE_BPS } from './lib/swap'
import { MAINTENANCE_MARGIN_RATE, openPosition, positionMetrics, settleDemoPosition, type PerpMarket, type Side, type Position } from './lib/perps'
import { applyLendingAction, borrowApy, lendingHealth, supplyApy, totalValue, type LendingAction } from './lib/lend'
import { initialState, loadDemo, newId, saveDemo, type DemoState } from './lib/demo'
import { accrueDemoInterest, projectDemoInterest, YEAR_MS } from './lib/interest'
import { RoutesPage, SecurityPage, LaunchPage } from './features/Protocol'
import { BeldexTestnetPage } from './features/BeldexTestnet'
import { TestnetIntentPanel } from './features/TestnetIntents'
import { TestnetAssetCatalogue } from './features/TestnetAssets'
import { executeDemoRoute, type RoutePlan } from './lib/routes'
import { assertDemoOperation, defaultDemoPolicy } from './lib/security'

type Page = 'Overview' | 'Testnet' | 'Swap' | 'Perps' | 'Lend' | 'Routes' | 'Portfolio' | 'Security' | 'Launch'
type Notice = { message: string; error: boolean }
const nav = [
  { name: 'Overview' as const, icon: LayoutDashboard },
  { name: 'Testnet' as const, icon: ShieldCheck },
  { name: 'Swap' as const, icon: ArrowLeftRight },
  { name: 'Perps' as const, icon: BarChart3 },
  { name: 'Lend' as const, icon: Landmark },
  { name: 'Routes' as const, icon: ArrowLeftRight },
  { name: 'Portfolio' as const, icon: Wallet },
  { name: 'Security' as const, icon: LockKeyhole },
  { name: 'Launch' as const, icon: Zap },
]

// Root URL is the public homepage; /app and /app/<product> open the existing terminal.
function pageFromPath(pathname: string): Page | null {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/app') return 'Overview'
  if (path.startsWith('/app/')) {
    const slug = path.slice('/app/'.length).toLowerCase()
    return nav.find(item => item.name.toLowerCase() === slug)?.name ?? 'Overview'
  }
  return null
}

const iconSymbol: Record<Asset, string> = { BDX: 'B', USDT: '₮', BTC: '₿', ETH: 'Ξ' }
function Coin({ symbol, size = 'md' }: { symbol: Asset; size?: 'sm' | 'md' | 'lg' }) {
  return <span className={'coin coin-' + symbol.toLowerCase() + ' coin-' + size} aria-hidden="true">{iconSymbol[symbol]}</span>
}
function SectionHead({ eyebrow, title, description, accessory }: { eyebrow?: string; title: string; description?: string; accessory?: React.ReactNode }) {
  return <div className="section-header"><div><div className="eyebrow">{eyebrow || 'HOXO TERMINAL'}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{accessory}</div>
}
function CardTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return <div className="card-heading"><h3>{children}</h3>{right}</div>
}
function Metric({ label, value, detail, icon }: { label: string; value: string; detail?: string; icon?: React.ReactNode }) {
  return <div className="metric-card"><div className="metric-top"><span>{label}</span>{icon}</div><strong>{value}</strong><span className="metric-sub">{detail || 'Demo environment'}</span></div>
}
function FakeChart({ variant = 'primary' }: { variant?: 'primary' | 'subtle' }) {
  const pts = Array.from({ length: 46 }, (_, i) => {
    const y = 75 - i * 0.88 + Math.sin(i * 0.8) * 8 + Math.sin(i * 1.87) * 5
    return String(i * 12) + ',' + String(Math.max(10, y))
  }).join(' ')
  return <svg className={'chart-svg ' + variant} viewBox="0 0 540 120" preserveAspectRatio="none" role="img" aria-label="Illustrative market chart, not live price history">
    <defs><linearGradient id="hoxo-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8aecce" stopOpacity=".26"/><stop offset="100%" stopColor="#8aecce" stopOpacity="0"/></linearGradient></defs>
    {[25, 55, 85].map(y => <line key={y} x1="0" x2="540" y1={y} y2={y} stroke="#324052" strokeWidth=".6" strokeDasharray="3 7"/>)}
    <polygon points={'0,120 ' + pts + ' 540,120'} fill="url(#hoxo-chart-fill)"/>
    <polyline points={pts} fill="none" stroke="#8aecce" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
}
function ArrowBadge({ positive }: { positive: boolean }) {
  return <span className={positive ? 'change up' : 'change down'}>{positive ? <TrendingUp size={13}/> : <TrendingDown size={13}/>} {positive ? '+2.84%' : '-0.94%'}</span>
}

function Overview({ demo, openPage }: { demo: DemoState; openPage: (page: Page) => void }) {
  const health = lendingHealth(demo.lending)
  const holdings = totalValue(demo.balances) + health.collateralUsd - health.debtUsd +
    demo.positions.reduce((sum, p) => sum + Math.max(0, positionMetrics(p, p.entry).equity), 0)
  const markets: Asset[] = ['BDX', 'BTC', 'ETH', 'USDT']
  return <div className="stack">
    <div className="hero">
      <div className="hero-grid" aria-hidden="true"/><div className="hero-halo" aria-hidden="true"/>
      <div className="hero-content">
        <div className="hero-kicker"><ShieldCheck size={14}/> THE PRIVACY-NATIVE FINANCIAL LAYER</div>
        <h1>Own your edge.<br/><span>Keep your privacy.</span></h1>
        <p>Swap, trade perpetuals, and explore lending—all in one beautifully simple DeFi terminal built for the Beldex ecosystem.</p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={() => openPage('Swap')}>Launch simulator <ArrowUpRight size={17}/></button>
          <button className="btn btn-ghost-light" onClick={() => openPage('Portfolio')}>Explore portfolio <ArrowRight size={17}/></button>
        </div>
        <div className="hero-note"><span className="green-dot"/> Prototype release · No real trading</div>
        <div className="hero-buttons" style={{ marginTop: 14 }}><button className="btn btn-outline" onClick={() => openPage('Testnet')}><ShieldCheck size={16}/> Try native BDX testnet transfer <ArrowRight size={15}/></button></div>
      </div>
      <div className="hero-mark" aria-hidden="true"><div className="mark-ring"><span>H</span></div><div className="orb orb-a"/><div className="orb orb-b"/></div>
    </div>
    <div className="eyebrow section-spacer">YOUR SIMULATION AT A GLANCE</div>
    <div className="metrics-grid">
      <Metric label="Demo net worth" value={money(holdings)} detail="Hypothetical assets, not wallet funds" icon={<Wallet size={18}/>}/>
      <Metric label="Available collateral" value={money(health.collateralUsd)} detail="Lending simulation" icon={<Landmark size={18}/>}/>
      <Metric label="Open positions" value={String(demo.positions.length)} detail="Perpetual futures simulator" icon={<BarChart3 size={18}/>}/>
      <Metric label="Borrowed value" value={money(health.debtUsd)} detail="Debt in demo environment" icon={<ArrowDownLeft size={18}/>}/>
    </div>
    <div className="overview-columns">
      <div className="panel market-panel">
        <CardTitle right={<span className="muted tiny">REFERENCE PRICES · ILLUSTRATIVE</span>}>Explore markets</CardTitle>
        <div className="market-chart-head"><div><span className="muted tiny">BDX / USDT</span><div className="market-big">$0.0800 <ArrowBadge positive={true}/></div></div><span className="subtle-pill">DEMO DATA</span></div>
        <FakeChart/>
        <div className="table-scroll"><table className="data-table market-table"><thead><tr><th>Asset</th><th>Demo price</th><th>24h example</th><th></th></tr></thead><tbody>
          {markets.map((asset, i) => <tr key={asset}><td><span className="asset-cell"><Coin symbol={asset}/><span><b>{asset}</b><small>{ASSETS[asset].name}</small></span></span></td><td>{money(priceOf(asset))}</td><td><ArrowBadge positive={i % 3 !== 1}/></td><td><button className="icon-button" aria-label={'Swap ' + asset} onClick={() => openPage('Swap')}><ArrowUpRight size={16}/></button></td></tr>)}
        </tbody></table></div>
      </div>
      <div className="panel products-panel">
        <CardTitle right={<span className="subtle-pill">MILESTONES 1–4</span>}>HOXO products</CardTitle>
        <button className="product-tile" onClick={() => openPage('Swap')}><span className="product-icon teal"><ArrowLeftRight size={22}/></span><span><b>Hoxo Swap</b><small>Route illustrative token swaps</small></span><ChevronRight size={18}/></button>
        <button className="product-tile" onClick={() => openPage('Perps')}><span className="product-icon purple"><BarChart3 size={22}/></span><span><b>Hoxo Perps</b><small>Explore long and short positions</small></span><ChevronRight size={18}/></button>
        <button className="product-tile" onClick={() => openPage('Lend')}><span className="product-icon blue"><Landmark size={22}/></span><span><b>Hoxo Lend</b><small>Simulate supply and borrow markets</small></span><ChevronRight size={18}/></button>
        <button className="product-tile" onClick={() => openPage('Routes')}><span className="product-icon teal"><ArrowLeftRight size={22}/></span><span><b>Hoxo Routes</b><small>Explore offline multi-hop liquidity</small></span><ChevronRight size={18}/></button>
        <div className="privacy-box"><LockKeyhole size={19}/><div><b>Privacy by design</b><p>Beldex wallet connection is genuine. Trading and lending are isolated simulations until secure settlement is available.</p></div></div>
      </div>
    </div>
  </div>
}

function Swap({ demo, onSwap, wallet }: { demo: DemoState; wallet: ReturnType<typeof useBeldexWallet>; onSwap: (from: Asset, to: Asset, quantity: number, output: number) => void }) {
  const [from, setFrom] = useState<Asset>('BDX')
  const [to, setTo] = useState<Asset>('USDT')
  const [amount, setAmount] = useState('1000')
  const [slippage, setSlippage] = useState('0.5')
  const quantity = Number(amount)
  const quote = useMemo(() => {
    try { return quoteSwap(from, to, quantity, Number(slippage), demo.pools) } catch { return null }
  }, [from, to, quantity, slippage, demo.pools])
  const amountValid = amount.trim() !== '' && Number.isFinite(quantity) && quantity > 0
  const sufficient = amountValid && quantity <= demo.balances[from]
  const swapPair = () => { setFrom(to); setTo(from); setAmount('') }
  return <div className="stack">
    <SectionHead eyebrow="MILESTONE 02 / DECENTRALISED EXCHANGE" title="Swap" description="An effortless private-swap experience. Quotes and settlements below are simulated." accessory={<span className="subtle-pill"><span className="green-dot"/> QUOTE ENGINE ONLINE · DEMO</span>}/>
    <div className="trading-layout">
      <section className="panel swap-panel">
        <CardTitle right={<span className="muted tiny"><LockKeyhole size={12}/> SIMULATOR</span>}>Swap tokens</CardTitle>
        <div className="swap-box">
          <div className="swap-box-top"><label htmlFor="swap-from">You pay</label><span>Demo balance: {displayNumber(demo.balances[from])} {from}</span></div>
          <div className="swap-input-row">
            <input id="swap-from" type="number" min="0" step="any" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}/>
            <div className="token-select"><Coin symbol={from} size="sm"/><select aria-label="Token to swap from" value={from} onChange={e => { const asset = e.target.value as Asset; if (asset === to) setTo(from); setFrom(asset) }}>{assetSymbols.map(asset => <option key={asset} value={asset}>{asset}</option>)}</select><ChevronDown size={14}/></div>
          </div><div className="swap-usd">≈ {amountValid ? money(quantity * priceOf(from)) : '$0.00'} <button onClick={() => setAmount(String(demo.balances[from]))}>MAX</button></div>
        </div>
        <div className="swap-middle"><button className="swap-flip" onClick={swapPair} aria-label="Reverse swap direction"><ArrowLeftRight size={18}/></button></div>
        <div className="swap-box">
          <div className="swap-box-top"><label htmlFor="swap-to">You receive (estimated)</label><span>Demo balance: {displayNumber(demo.balances[to])} {to}</span></div>
          <div className="swap-input-row"><input id="swap-to" type="text" readOnly value={quote ? displayNumber(quote.amountOut, 6) : '0.00'}/><div className="token-select"><Coin symbol={to} size="sm"/><select aria-label="Token to receive" value={to} onChange={e => { const asset = e.target.value as Asset; if (asset === from) setFrom(to); setTo(asset) }}>{assetSymbols.map(asset => <option key={asset} value={asset}>{asset}</option>)}</select><ChevronDown size={14}/></div></div>
          <div className="swap-usd">≈ {quote ? money(quote.amountOut * priceOf(to)) : '$0.00'}</div>
        </div>
        <div className="swap-settings"><span>Slippage tolerance</span><div className="slip-options">{['0.1', '0.5', '1.0'].map(s => <button key={s} className={slippage === s ? 'selected' : ''} onClick={() => setSlippage(s)}>{s}%</button>)}</div></div>
        <div className="quote-breakdown">
          <div><span>Estimated execution rate · demo</span><b>1 {from} ≈ {quote ? displayNumber(quote.effectiveRate, 6) : "—"} {to}</b></div>
          <div><span>Pool fee ({SWAP_FEE_BPS / 100}%)</span><b>{quote ? money(quote.feeUsd) : '—'}</b></div>
          <div><span>Price impact</span><b>{quote ? displayNumber(quote.priceImpactPct, 3) + '%' : '—'}</b></div>
          <div><span>Minimum received</span><b>{quote ? displayNumber(quote.minOut, 6) + ' ' + to : '—'}</b></div>
        </div>
        <button className="btn btn-primary full-width trade-cta" disabled={!quote || !sufficient} onClick={() => quote && onSwap(from, to, quantity, quote.minOut)}>{!amountValid ? 'Enter an amount' : !sufficient ? 'Insufficient demo balance' : 'Simulate swap'}<ArrowRight size={17}/></button>
        <p className="under-button"><ShieldCheck size={13}/> No real assets are transferred. All values are examples.</p>
      </section>
      <section className="panel trade-info-panel">
        <div className="trade-info-top"><span className="eyebrow">THE HOXO DIFFERENCE</span><h2>DeFi, without<br/><em>the spotlight.</em></h2><p>Privacy should be the foundation, not an optional extra.</p></div>
        <div className="swap-graphic"><div className="swirl one"/><div className="swirl two"/><div className="swirl three"/><div className="graphic-core"><LockKeyhole size={32}/></div></div>
        <div className="feature-row"><ShieldCheck size={20}/><span><b>Privacy-first architecture</b><small>Designed for Beldex confidential assets</small></span></div>
        <div className="feature-row"><Zap size={20}/><span><b>Intuitive price discovery</b><small>Illustrative AMM quotes and routing</small></span></div>
        <div className="feature-row"><EyeOff size={20}/><span><b>User-directed execution</b><small>Real settlements require audited infrastructure</small></span></div>
      </section>
    </div>
    <TestnetAssetCatalogue purpose="swap"/>
    <TestnetIntentPanel kind="swap" wallet={wallet}/>
  </div>
}

function Perps({ demo, shock, onShock, onOpen, onClose }: {
  demo: DemoState; shock: number; onShock: (v: number) => void;
  onOpen: (market: PerpMarket, side: Side, margin: number, leverage: number) => void;
  onClose: (position: Position) => void
}) {
  const [market, setMarket] = useState<PerpMarket>('BTC')
  const [side, setSide] = useState<Side>('long')
  const [margin, setMargin] = useState('250')
  const [leverage, setLeverage] = useState(3)
  const mark = priceOf(market) * (1 + shock / 100)
  const size = Number(margin) * leverage
  const showSize = margin.trim() !== '' && Number.isFinite(size) && size > 0
  return <div className="stack">
    <SectionHead eyebrow="MILESTONE 03 / PERPETUAL FUTURES" title="Perpetuals" description="Explore leveraged positions with an isolated-margin risk engine. Simulation only." accessory={<span className="subtle-pill">UP TO 20× · DEMO</span>}/>
    <div className="market-strip">{(['BTC', 'ETH', 'BDX'] as PerpMarket[]).map(asset => <button key={asset} onClick={() => setMarket(asset)} className={'market-chip ' + (market === asset ? 'active' : '')}><Coin symbol={asset} size="sm"/><span><b>{asset}-PERP</b><small>{money(priceOf(asset))}</small></span><ArrowBadge positive={asset !== 'ETH'}/></button>)}</div>
    <div className="perps-layout">
      <section className="panel perp-chart">
        <div className="chart-head"><div><span className="eyebrow">{market} / USD · DEMO REFERENCE</span><div className="market-big">{money(mark)} <span className="muted smaller">Mark price</span></div></div><span className="subtle-pill">ILLUSTRATIVE</span></div>
        <FakeChart/>
        <div className="price-shock">
          <div><span>Stress-test market price</span><strong className={shock >= 0 ? 'positive-text' : 'negative-text'}>{shock > 0 ? '+' : ''}{shock}%</strong></div>
          <input type="range" aria-label="Simulated market price change" min="-25" max="25" step="1" value={shock} onChange={e => onShock(Number(e.target.value))}/>
          <div className="range-ends"><span>-25% downside</span><button onClick={() => onShock(0)}>Reset price</button><span>+25% upside</span></div>
        </div>
        <div className="mini-metrics"><div><span>Index price</span><b>{money(priceOf(market))}</b></div><div><span>Mark price</span><b>{money(mark)}</b></div><div><span>Maintenance margin</span><b>{MAINTENANCE_MARGIN_RATE * 100}%</b></div><div><span>Funding</span><b>Not modelled</b></div></div>
      </section>
      <section className="panel order-panel">
        <CardTitle right={<span className="subtle-pill">ISOLATED</span>}>Place demo order</CardTitle>
        <div className="direction-toggle"><button className={side === 'long' ? 'long active' : ''} onClick={() => setSide('long')}><TrendingUp size={15}/> Long</button><button className={side === 'short' ? 'short active' : ''} onClick={() => setSide('short')}><TrendingDown size={15}/> Short</button></div>
        <div className="field-label"><label htmlFor="margin-amount">Margin amount</label><span>Available: {money(demo.balances.USDT)}</span></div>
        <div className="number-field"><input id="margin-amount" type="number" min="0" step="any" value={margin} onChange={e => setMargin(e.target.value)}/><b>USDT</b></div>
        <div className="field-label leverage-label"><label htmlFor="leverage-range">Leverage</label><strong>{leverage}×</strong></div>
        <input className="leverage-range" type="range" id="leverage-range" min="1" max="20" step="1" value={leverage} onChange={e => setLeverage(Number(e.target.value))}/>
        <div className="leverage-labels"><span>1×</span><span>5×</span><span>10×</span><span>15×</span><span>20×</span></div>
        <div className="quote-breakdown">
          <div><span>Market</span><b>{market}-PERP</b></div>
          <div><span>Position notional</span><b>{showSize ? money(size) : '—'}</b></div>
          <div><span>Entry mark</span><b>{money(priceOf(market))}</b></div>
          <div><span>Max illustrative exposure</span><b>{leverage}× margin</b></div>
        </div>
        <button className={'btn full-width trade-cta ' + (side === 'long' ? 'btn-long' : 'btn-short')} disabled={!showSize || Number(margin) > demo.balances.USDT} onClick={() => onOpen(market, side, Number(margin), leverage)}>Simulate {side} <ArrowRight size={17}/></button>
        <p className="under-button">No live derivatives orders or real collateral.</p>
      </section>
    </div>
    <section className="panel">
      <CardTitle right={<span className="subtle-pill">{demo.positions.length} OPEN</span>}>Your demo positions</CardTitle>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>Market</th><th>Side</th><th>Notional</th><th>Entry / Mark</th><th>Liquidation</th><th>Unrealised P&L</th><th></th></tr></thead><tbody>
        {demo.positions.map(p => {
          const metrics = positionMetrics(p, priceOf(p.market) * (1 + shock / 100))
          return <tr key={p.id}><td><b>{p.market}-PERP</b><small className="block-muted">{p.leverage}× leverage</small></td><td><span className={'side-pill ' + p.side}>{p.side.toUpperCase()}</span></td><td>{money(metrics.notional)}</td><td>{money(p.entry)}<small className="block-muted">{money(priceOf(p.market) * (1 + shock / 100))}</small></td><td>{money(metrics.liquidationPrice)}</td><td className={metrics.pnl >= 0 ? 'positive-text' : 'negative-text'}>{money(metrics.pnl)}<small className="block-muted">{displayNumber(metrics.roi, 2)}% ROI</small>{metrics.liquidatable && <small className="negative-text block-muted">Liquidatable</small>}</td><td><button className="mini-btn" onClick={() => onClose(p)}>{metrics.liquidatable ? "Liquidate demo" : "Close demo"}</button></td></tr>
        })}
        {demo.positions.length === 0 && <tr><td colSpan={7}><div className="empty-table"><BarChart3 size={27}/><b>No positions yet</b><span>Open a simulated long or short to get started.</span></div></td></tr>}
      </tbody></table></div>
    </section>
  </div>
}

function Lend({ demo, onAction, onAccrue, wallet }: { demo: DemoState; wallet: ReturnType<typeof useBeldexWallet>; onAction: (action: LendingAction, asset: Asset, amount: number) => void; onAccrue: (days: number) => void }) {
  const [action, setAction] = useState<LendingAction>('supply')
  const [asset, setAsset] = useState<Asset>('BDX')
  const [amount, setAmount] = useState('1000')
  const health = lendingHealth(demo.lending)
  const projected = useMemo(() => projectDemoInterest(demo.lending, 30), [demo.lending])
  const projectedHealth = lendingHealth(projected.book)
  const maxAvailable = action === 'supply' ? demo.balances[asset] : action === 'withdraw' ? demo.lending.supplied[asset] ?? 0 : action === 'repay' ? Math.min(demo.balances[asset], demo.lending.borrowed[asset] ?? 0) : health.borrowCapacityUsd / priceOf(asset)
  const activeApy = action === 'supply' || action === 'withdraw' ? supplyApy[asset] : borrowApy[asset]
  const valid = amount.trim() !== '' && Number.isFinite(Number(amount)) && Number(amount) > 0 && Number(amount) <= maxAvailable + 1e-9
  const actions: LendingAction[] = ['supply', 'withdraw', 'borrow', 'repay']
  return <div className="stack">
    <SectionHead eyebrow="MILESTONE 04 / LENDING MARKETS" title="Lend & Borrow" description="Put capital to work in a collateral-backed lending model. Figures are hypothetical." accessory={<span className="subtle-pill">COLLATERAL MODEL · DEMO</span>}/>
    <div className="metrics-grid three">
      <Metric label="Demo collateral supplied" value={money(health.collateralUsd)} detail="Assets currently supplied" icon={<Coins size={18}/>}/>
      <Metric label="Demo debt outstanding" value={money(health.debtUsd)} detail="Outstanding virtual borrowing" icon={<ArrowDownLeft size={18}/>}/>
      <Metric label="Borrow capacity" value={money(health.borrowCapacityUsd)} detail="70% maximum loan-to-value" icon={<ShieldCheck size={18}/>}/>
    </div>
    <div className="lend-layout">
      <section className="panel lend-markets">
        <CardTitle right={<span className="muted tiny">ILLUSTRATIVE FIXED APYs</span>}>Lending markets</CardTitle>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>Asset</th><th>Supply APY</th><th>Borrow APY</th><th>Collateral</th><th></th></tr></thead><tbody>
          {assetSymbols.map(a => <tr key={a}><td><span className="asset-cell"><Coin symbol={a}/><span><b>{a}</b><small>{ASSETS[a].name}</small></span></span></td><td className="positive-text">{supplyApy[a].toFixed(2)}%</td><td>{borrowApy[a].toFixed(2)}%</td><td><span className="side-pill neutral">70% LTV</span></td><td><button className="mini-btn" onClick={() => { setAsset(a); setAction('supply') }}>Supply</button></td></tr>)}
        </tbody></table></div>
        <div className="lend-health"><div className="card-heading"><h3>Collateral health</h3><span className={'side-pill ' + (health.healthFactor < 1.25 ? 'short' : 'neutral')}>{health.debtUsd === 0 ? 'NO BORROWS' : health.healthFactor < 1 ? 'AT RISK' : 'HEALTHY'}</span></div><div className="health-value">{Number.isFinite(health.healthFactor) ? displayNumber(health.healthFactor, 2) + '×' : '∞'}<span>Health factor</span></div><div className="health-track"><span style={{ width: String(health.debtUsd ? Math.min(100, health.debtUsd / Math.max(1, health.collateralUsd * 0.8) * 100) : 0) + '%' }}/></div><p className="muted smaller">Borrowing is capped at 70% LTV. Liquidation risk begins at 80% LTV in this simplified demonstration.</p></div>
      </section>
      <section className="panel lend-action">
        <CardTitle>Manage demo market</CardTitle>
        <div className="lend-tabs">{actions.map(a => <button key={a} className={action === a ? 'active' : ''} onClick={() => { setAction(a); setAmount('') }}>{a[0].toUpperCase() + a.slice(1)}</button>)}</div>
        <div className="field-label"><label htmlFor="lend-amount">Amount</label><span>Max: {displayNumber(maxAvailable, 5)} {asset}</span></div>
        <div className="lend-entry"><div className="number-field"><input id="lend-amount" type="number" min="0" step="any" value={amount} onChange={e => setAmount(e.target.value)}/><button onClick={() => setAmount(String(Math.max(0, maxAvailable)))}>MAX</button></div><div className="token-select"><Coin symbol={asset} size="sm"/><select aria-label="Lending asset" value={asset} onChange={e => setAsset(e.target.value as Asset)}>{assetSymbols.map(a => <option key={a} value={a}>{a}</option>)}</select><ChevronDown size={14}/></div></div>
        <div className="quote-breakdown">
          <div><span>Action</span><b>{action[0].toUpperCase() + action.slice(1)}</b></div>
          <div><span>Example {action === 'supply' || action === 'withdraw' ? 'supply' : 'borrow'} APY</span><b>{activeApy.toFixed(2)}%</b></div>
          <div><span>Collateral factor</span><b>70%</b></div>
          <div><span>Wallet balance (virtual)</span><b>{displayNumber(demo.balances[asset], 4)} {asset}</b></div>
        </div>
        <button className="btn btn-primary full-width trade-cta" disabled={!valid} onClick={() => { onAction(action, asset, Number(amount)); setAmount('') }}>Simulate {action}<ArrowRight size={17}/></button>
        <p className="under-button"><ShieldCheck size={13}/> No live loans, yield accrual, or deposits.</p>
      </section>
    </div>
    <div className="panel"><CardTitle>30-day illustrative interest projection</CardTitle><p className="muted smaller">Fixed example APRs. Projected values are not credited automatically, and they do not represent real yield. Manually advance the demonstration clock below to apply simulated interest to the local ledger.</p><div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}><button className="btn btn-outline" disabled={health.collateralUsd === 0 && health.debtUsd === 0} onClick={() => onAccrue(1)}>Advance 1 demo day</button><button className="btn btn-outline" disabled={health.collateralUsd === 0 && health.debtUsd === 0} onClick={() => onAccrue(7)}>Advance 7 demo days</button></div><div className="mini-metrics"><div><span>Estimated supply interest</span><b>{money(totalValue(projected.supplyInterest))}</b></div><div><span>Estimated borrowing interest</span><b>{money(totalValue(projected.borrowInterest))}</b></div><div><span>Projected health factor</span><b>{Number.isFinite(projectedHealth.healthFactor) ? displayNumber(projectedHealth.healthFactor, 2) + "×" : "∞"}</b></div></div></div>
    <div className="panel"><CardTitle>Your demo lending positions</CardTitle><div className="positions-grid"><div><span className="eyebrow">SUPPLIED</span>{assetSymbols.filter(a => (demo.lending.supplied[a] ?? 0) > 0).map(a => <div key={a} className="holding-line"><span><Coin symbol={a} size="sm"/><b>{a}</b></span><strong>{displayNumber(demo.lending.supplied[a] ?? 0)} <small>{money((demo.lending.supplied[a] ?? 0) * priceOf(a))}</small></strong></div>)}{totalValue(demo.lending.supplied) === 0 && <p className="muted">No assets supplied yet.</p>}</div><div><span className="eyebrow">BORROWED</span>{assetSymbols.filter(a => (demo.lending.borrowed[a] ?? 0) > 0).map(a => <div key={a} className="holding-line"><span><Coin symbol={a} size="sm"/><b>{a}</b></span><strong>{displayNumber(demo.lending.borrowed[a] ?? 0)} <small>{money((demo.lending.borrowed[a] ?? 0) * priceOf(a))}</small></strong></div>)}{totalValue(demo.lending.borrowed) === 0 && <p className="muted">No outstanding demo debt.</p>}</div></div></div>
    <TestnetAssetCatalogue purpose="lend"/>
    <TestnetIntentPanel kind="lend" wallet={wallet}/>
  </div>
}

function Portfolio({ demo, onReset, wallet }: { demo: DemoState; onReset: () => void; wallet: ReturnType<typeof useBeldexWallet> }) {
  const health = lendingHealth(demo.lending)
  const portfolioValue = totalValue(demo.balances) + health.collateralUsd - health.debtUsd + demo.positions.reduce((sum, p) => sum + Math.max(0, positionMetrics(p, p.entry).equity), 0)
  return <div className="stack">
    <SectionHead eyebrow="YOUR HOXO EXPERIENCE" title="Portfolio" description="A transparent view of your local demo assets and activity." accessory={<button className="btn btn-outline" onClick={onReset}><RotateCcw size={15}/> Reset demo</button>}/>
    <section className="panel">
      <CardTitle right={<span className="subtle-pill">{wallet.connection?.network === 'testnet' ? 'BELDEX TESTNET' : 'WALLET SNAPSHOT'}</span>}>Real Beldex wallet portfolio</CardTitle>
      {!wallet.connection ? <>
        <p className="muted smaller">Connect the Beldex extension to view a real wallet-authorised BDX balance. The fictional portfolio below is separate.</p>
        <button className="btn btn-outline" disabled={wallet.busy} onClick={() => void wallet.connect()}><Wallet size={15}/> Connect Beldex wallet</button>
      </> : <>
        <div className="mini-metrics">
          <div><span>Wallet total (BDX)</span><b>{wallet.connection.total}</b></div>
          <div><span>Unlocked (BDX)</span><b>{wallet.connection.unlocked}</b></div>
          <div><span>Reported scan height</span><b>{wallet.connection.height ?? 'Unavailable'}</b></div>
        </div>
        <p className="muted smaller" style={{ overflowWrap: 'anywhere' }}>Network: {wallet.connection.network} · Wallet address: {wallet.connection.address}</p>
        {wallet.connection.approximate && <p className="negative-text smaller">Balance is approximate until the wallet finishes syncing.</p>}
        <button className="btn btn-outline" onClick={() => void wallet.refresh()}><RefreshCw size={15}/> Refresh real wallet balance</button>
      </>}
      <p className="muted smaller">Only native BDX is available through the published wallet SDK. The BTC, ETH and USDT demo balances below are not holdings in your wallet.</p>
      {wallet.transaction && <div className="route-result">
        <div className="route-result-title"><b>Latest wallet send: {wallet.transaction.status}</b><span className="subtle-pill">BDX TESTNET</span></div>
        {wallet.transaction.txHash && <p className="muted smaller" style={{ overflowWrap: 'anywhere' }}>Wallet-reported hash: {wallet.transaction.txHash} · <a href={"https://testnet.beldex.dev/tx/" + encodeURIComponent(wallet.transaction.txHash)} target="_blank" rel="noreferrer">Open testnet explorer <ExternalLink size={12}/></a></p>}
        <p className="muted smaller">{wallet.transaction.message || 'Check your extension for chain confirmation'}</p>
      </div>}
      {wallet.signedIntents.length > 0 && <div className="route-result"><b>Verified wallet-signed proposals (not transactions)</b>
        {wallet.signedIntents.map(intent => <p key={intent.message} className="muted smaller">{intent.kind.toUpperCase()} · Wallet signature verified · No assets exchanged or borrowed</p>)}
      </div>}
    </section>
    <TestnetAssetCatalogue purpose="portfolio"/>
    <div className="portfolio-hero"><div><div className="eyebrow">TOTAL DEMO NET WORTH</div><div className="portfolio-total">{money(portfolioValue)}</div><span className="muted">Not connected to any blockchain balances</span></div><div className="portfolio-decoration"><ShieldCheck size={72}/></div></div>
    <div className="overview-columns">
      <div className="panel"><CardTitle right={<span className="subtle-pill">SIMULATED</span>}>Asset balances</CardTitle><div className="table-scroll"><table className="data-table"><thead><tr><th>Token</th><th>Balance</th><th>Demo value</th></tr></thead><tbody>{assetSymbols.map(a => <tr key={a}><td><span className="asset-cell"><Coin symbol={a}/><span><b>{a}</b><small>{ASSETS[a].name}</small></span></span></td><td>{displayNumber(demo.balances[a], 6)}</td><td>{money(demo.balances[a] * priceOf(a))}</td></tr>)}</tbody></table></div></div>
      <div className="panel"><CardTitle>Activity</CardTitle>{demo.activity.length ? <div className="activity-feed">{demo.activity.map(e => <div className="activity-row" key={e.id}><span className="activity-icon"><Activity size={16}/></span><span><b>{e.label}</b><small>{e.detail}</small></span><div><strong>{e.amount || '—'}</strong><small>{new Date(e.date).toLocaleDateString()}</small></div></div>)}</div> : <div className="empty-table"><Clock3 size={27}/><b>No activity yet</b><span>Simulate a swap, a perpetual trade or a lending action.</span></div>}</div>
    </div>
  </div>
}

export default function App() {
  const [page, setPage] = useState<Page>(() => pageFromPath(window.location.pathname) ?? 'Overview')
  const [isLanding, setIsLanding] = useState(() => pageFromPath(window.location.pathname) === null)
  const [mobileNav, setMobileNav] = useState(false)
  const [demo, setDemo] = useState<DemoState>(loadDemo)
  const [shock, setShock] = useState(0)
  const [policy, setPolicy] = useState(defaultDemoPolicy)
  const [notice, setNotice] = useState<Notice | null>(null)
  const wallet = useBeldexWallet()
  useEffect(() => saveDemo(demo), [demo])
  useEffect(() => {
    const onHistoryChange = () => {
      const destination = pageFromPath(window.location.pathname)
      setIsLanding(destination === null)
      if (destination) setPage(destination)
      setMobileNav(false)
    }
    window.addEventListener('popstate', onHistoryChange)
    return () => window.removeEventListener('popstate', onHistoryChange)
  }, [])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(null), 4500); return () => clearTimeout(timer) }, [notice])
  function notify(message: string, error = false) { setNotice({ message, error }) }
  function pushActivity(data: DemoState, label: string, detail: string, amount?: string): DemoState {
    return { ...data, activity: [{ id: newId(), label, detail, date: Date.now(), amount }, ...data.activity].slice(0, 50) }
  }
  function handleSwap(from: Asset, to: Asset, amount: number, minOut: number) {
    try {
      assertDemoOperation('swap', policy, amount * priceOf(from))
      const trade = executeDemoSwap(demo.balances, demo.pools, from, to, amount, minOut)
      setDemo(pushActivity({ ...demo, balances: trade.balances, pools: trade.pools, poolFeesUsd: demo.poolFeesUsd + trade.quote.feeUsd }, 'Simulated pool swap', from + ' → ' + to, displayNumber(trade.quote.amountOut, 5) + ' ' + to))
      notify('Demo swap executed; the simulated pool reserves have updated. No blockchain transaction.')
    } catch (err) { notify(err instanceof Error ? err.message : 'Demo trade rejected', true) }
  }
  function handleOpen(market: PerpMarket, side: Side, margin: number, leverage: number) {
    if (!Number.isFinite(margin) || margin <= 0 || demo.balances.USDT < margin) return notify('Insufficient demo USDT balance.', true)
    try {
      assertDemoOperation('open-perp', policy, margin * leverage, leverage)
      const position = openPosition(market, side, margin, leverage, newId())
      setDemo(pushActivity({ ...demo, balances: { ...demo.balances, USDT: demo.balances.USDT - margin }, positions: [position, ...demo.positions] }, 'Opened demo ' + side, market + '-PERP · ' + leverage + '×', money(margin * leverage)))
      notify('Demo ' + side + ' opened. Margin is only held in the simulator.')
    } catch (err) { notify(err instanceof Error ? err.message : 'Position rejected', true) }
  }
  function handleClose(p: Position) {
    try {
      assertDemoOperation('close-perp', policy, 0)
      const settlement = settleDemoPosition(demo.balances, demo.positions, p.id, priceOf(p.market) * (1 + shock / 100))
      setDemo(pushActivity({ ...demo, balances: settlement.balances, positions: settlement.positions }, settlement.liquidated ? 'Demo liquidation' : 'Closed demo ' + p.side, p.market + '-PERP · ' + displayNumber(settlement.metrics.roi, 1) + '% ROI', money(settlement.payout)))
      notify(settlement.liquidated ? 'Simulated liquidation completed. No margin returned.' : 'Position settled in simulation. No real assets transferred.')
    } catch (err) { notify(err instanceof Error ? err.message : 'Position settlement rejected', true) }
  }
  function handleLend(action: LendingAction, asset: Asset, amount: number) {
    try {
      assertDemoOperation(action, policy, amount * priceOf(asset))
      const result = applyLendingAction(demo.lending, demo.balances, action, asset, amount)
      setDemo(pushActivity({ ...demo, balances: result.balances, lending: result.book }, 'Demo ' + action, asset + ' lending market', displayNumber(amount, 5) + ' ' + asset))
      notify('Demo ' + action + ' completed. No assets moved on-chain.')
    } catch (err) { notify(err instanceof Error ? err.message : 'Action rejected', true) }
  }
  function handleAccrue(days: number) {
    try {
      assertDemoOperation('accrue', policy, 0)
      const projection = accrueDemoInterest(demo.lending, days * YEAR_MS / 365)
      const book = projection.book
      setDemo(pushActivity({ ...demo, lending: book }, 'Simulated interest', days + ' demonstration days', 'Lending ledger updated'))
      notify(days + ' demo days of illustrative interest applied locally; no real yield or debt created.')
    } catch (err) { notify(err instanceof Error ? err.message : 'Interest simulation rejected', true) }
  }
  function handleRoute(route: RoutePlan) {
    try {
      assertDemoOperation('route', policy, route.amountIn * priceOf(route.path[0]))
      const result = executeDemoRoute(route, demo.balances, demo.pools)
      setDemo(pushActivity({ ...demo, balances: result.balances, pools: result.pools, poolFeesUsd: demo.poolFeesUsd + result.poolFeesUsd }, 'Demo liquidity route', route.path.join(' → '), displayNumber(result.amountOut, 5) + ' ' + route.path[route.path.length - 1]))
      notify('Local demonstration route completed. No blockchain transaction or bridge transfer.')
    } catch (err) { notify(err instanceof Error ? err.message : 'Demo routing refused', true) }
  }
  function reset() { setDemo(initialState()); setShock(0); notify('Simulation reset to default demo balances.') }
  function go(next: Page) {
    setIsLanding(false)
    setPage(next)
    setMobileNav(false)
    const route = next === 'Overview' ? '/app' : '/app/' + next.toLowerCase()
    if (window.location.pathname !== route) window.history.pushState({ page: next }, '', route)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function openHome() {
    setIsLanding(true)
    setMobileNav(false)
    if (window.location.pathname !== '/') window.history.pushState({ page: null }, '', '/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLanding) return <Landing onEnter={(destination) => go(destination ?? 'Overview')}/>

  return <div className="app-shell">
    {mobileNav && <button aria-label="Close navigation" className="mobile-scrim" onClick={() => setMobileNav(false)}/>}
    <aside className={'sidebar ' + (mobileNav ? 'sidebar-open' : '')}>
      <div className="sidebar-brand"><div className="logo-shape"><span>H</span></div><div className="brand-name">HOXO<span className="brand-dot">.</span><small>PRIVACY RUNS DEEP</small></div><button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={19}/></button></div>
      <div className="nav-label">WORKSPACE</div>
      <nav aria-label="Main navigation">{nav.map(({ name, icon: Icon }) => <button key={name} className={'nav-item ' + (page === name ? 'active' : '')} onClick={() => go(name)}><Icon size={19}/><span>{name}</span>{page === name && <span className="nav-active-dot"/>}</button>)}</nav>
      <div className="sidebar-divider"/>
      <div className="nav-label">ECOSYSTEM</div>
      <a className="nav-item secondary-nav" href="https://beldex.io" target="_blank" rel="noreferrer"><ShieldCheck size={19}/><span>Beldex Network</span><ExternalLink size={14}/></a>
      <a className="nav-item secondary-nav" href="https://github.com/mushee-io/Hoxo-MM" target="_blank" rel="noreferrer"><CircleHelp size={19}/><span>Documentation</span><ExternalLink size={14}/></a>
      <div className="sidebar-bottom"><div className="sidebar-security"><div className="shield-circle"><LockKeyhole size={18}/></div><b>Built for privacy</b><p>Explore DeFi without exposing real funds in this prototype.</p><div><span className="green-dot"/> Beldex-native vision</div></div><div className="sidebar-footer">HOXO · v0.1.0 <span>PROTOTYPE</span></div></div>
    </aside>
    <div className="main-area">
      <header className="topbar">
        <div className="topbar-left"><button className="menu-toggle" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={21}/></button><div className="breadcrumb"><button type="button" className="breadcrumb-home" onClick={openHome}>Home</button><ChevronRight size={13}/> Workspace <ChevronRight size={13}/> <b>{page}</b></div></div>
        <div className="topbar-right"><span className="environment-badge"><span className="green-dot"/> DEMO ENVIRONMENT</span><span className="header-separator"/>
          {wallet.connection ? <div className="connected-group"><button className="wallet-connected" title="Refresh authorised wallet balance" onClick={wallet.refresh}><Coin symbol="BDX" size="sm"/><span>{wallet.connection.address.slice(0, 6)}…{wallet.connection.address.slice(-5)}</span><RefreshCw size={13}/></button><button className="icon-button" title="Disconnect wallet" onClick={wallet.disconnect}><X size={17}/></button></div> :
          <button className="btn btn-connect" disabled={wallet.busy} onClick={wallet.connect}><Wallet size={17}/>{wallet.busy ? 'Connecting…' : 'Connect Beldex'}</button>}
        </div>
      </header>
      <main className="content">
        <div className="simulation-banner"><div><ShieldCheck size={17}/><span><b>Research preview:</b> The Testnet tab supports wallet-approved native BDX testnet transfers; Swap, Perps, Lend and Routes remain fictional local simulations. No mainnet transfers or real DeFi settlement.</span></div><span className="banner-label">TESTNET BDX ONLY</span></div>
        {wallet.error && <div className="wallet-error"><CircleHelp size={16}/><span>{wallet.error}</span><a href="https://github.com/Beldex-Coin/beldex-wallet-extension" target="_blank" rel="noreferrer">Wallet information <ExternalLink size={12}/></a></div>}
        {wallet.connection && <div className="connected-readout"><Check size={15}/><span>Connected Beldex wallet</span><span className="wallet-address">{wallet.connection.address}</span><button title="Copy wallet address" aria-label="Copy wallet address" onClick={() => { navigator.clipboard.writeText(wallet.connection!.address).then(() => notify('Wallet address copied.')).catch(() => notify('Could not copy address.', true)) }}><Copy size={13}/></button><span className="live-balance">Unlocked: {wallet.connection.unlocked} BDX{wallet.connection.approximate ? ' (approx.)' : ''} · {wallet.connection.network}</span></div>}
        {page === 'Overview' && <Overview demo={demo} openPage={go}/>}
        {page === 'Testnet' && <BeldexTestnetPage wallet={wallet}/>}
        {page === 'Swap' && <Swap demo={demo} onSwap={handleSwap} wallet={wallet}/>}
        {page === 'Perps' && <Perps demo={demo} shock={shock} onShock={setShock} onOpen={handleOpen} onClose={handleClose}/>}
        {page === 'Lend' && <Lend demo={demo} onAction={handleLend} onAccrue={handleAccrue} wallet={wallet}/>}
        {page === 'Routes' && <RoutesPage demo={demo} policy={policy} onExecute={handleRoute}/>}
        {page === 'Portfolio' && <Portfolio demo={demo} onReset={reset} wallet={wallet}/>}
        {page === 'Security' && <SecurityPage policy={policy} poolFeesUsd={demo.poolFeesUsd} onPause={() => setPolicy(p => ({ paused: !p.paused }))}/>}
        {page === 'Launch' && <LaunchPage walletNetwork={wallet.connection?.network ?? null} walletHeight={wallet.connection?.height ?? null} walletTransfer={wallet.transaction?.status ?? null}/>}
        <footer className="main-footer"><span>© 2026 HOXO. Developed by Mushee.</span><span><LockKeyhole size={13}/> Privacy by design <span className="footer-divider">/</span> Built for Beldex</span></footer>
      </main>
    </div>
    {notice && <div className={'toast ' + (notice.error ? 'toast-error' : '')} role="status">{notice.error ? <CircleHelp size={19}/> : <Check size={19}/>}<span>{notice.message}</span><button onClick={() => setNotice(null)} aria-label="Dismiss notification"><X size={16}/></button></div>}
  </div>
}
