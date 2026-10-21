import { useState } from 'react'
import { ArrowLeftRight, ExternalLink, LockKeyhole, ShieldAlert, ShieldCheck } from 'lucide-react'

/** Prospective networks only. Not an available bridge list or synthetic route quote. */
const ROUTE_DESTINATIONS = [
  { id:'ethereum', name:'Ethereum', proof:'Verified contract, source/destination finality and refund logic' },
  { id:'base', name:'Base', proof:'Verified bridge adapter, L2 finality and secure relayer approval' },
  { id:'bnb', name:'BNB Smart Chain', proof:'Chain-specific contract verification, liquidity and custody evidence' },
] as const

export function RoutesSection() {
  const [destination,setDestination] = useState<typeof ROUTE_DESTINATIONS[number]['id']>('ethereum')
  const selected=ROUTE_DESTINATIONS.find(route=>route.id===destination)!
  return <div className="stack" data-section="routes">
    <div className="section-header">
      <div><div className="eyebrow">HOXO / CROSS-CHAIN</div><h1><ArrowLeftRight size={29}/> Routes</h1>
        <p>Dedicated bridge integration directory and cross-chain custody verification. No fabricated bridge quotes or transfer claims.</p></div>
      <span className="subtle-pill">BRIDGING UNAVAILABLE</span>
    </div>
    <section className="panel">
      <div className="card-heading"><h3><LockKeyhole size={17}/> Bridge readiness</h3><span className="side-pill short">NO VERIFIED ADAPTER</span></div>
      <div className="privacy-box"><ShieldAlert size={19}/><div><b>Do not send funds to unverified routes</b>
        <p>HOXO has no confirmed bridge contracts, locked liquidity, independently verified source/destination receipts or refund service. This directory does not create cross-chain transactions.</p></div></div>
      <div className="route-result-metrics" style={{marginTop:16}}>
        <span>Source network<b>Beldex testnet</b></span>
        <span>Verified HOXO adapters<b>0</b></span>
        <span>Available cross-chain routes<b>0</b></span>
      </div>
    </section>
    <div className="protocol-section-grid">
      <section className="panel">
        <div className="card-heading"><h3>Select prospective destination</h3></div>
        <label className="route-field" htmlFor="route-chain-selection">Destination network
          <select id="route-chain-selection" value={destination}
            onChange={event=>setDestination(event.target.value as typeof destination)}>
            {ROUTE_DESTINATIONS.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <div className="route-result" style={{marginTop:15}}>
          <b>{selected.name} — adapter not deployed</b>
          <p className="muted smaller">Before enabling: {selected.proof}.</p>
          <span className="side-pill short">NO TRANSFER POSSIBLE</span>
        </div>
      </section>
      <section className="panel">
        <div className="card-heading"><h3><ShieldCheck size={17}/> Verification requirements</h3></div>
        <ul className="protocol-requirements">
          <li>Audited custody and settlement addresses on both chains</li>
          <li>Verified relayers, liquidity, fees and independent receipts</li>
          <li>Reorg, timeout and refund reconciliation tests</li>
          <li>External security review and explicit bridge risk disclosures</li>
        </ul>
      </section>
    </div>
    <section className="panel">
      <div className="card-heading"><h3>Verified destination status</h3></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>Prospective destination</th><th>HOXO bridge adapter</th><th>Deposits / withdrawals</th></tr></thead><tbody>
        {ROUTE_DESTINATIONS.map(route=><tr key={route.id}>
          <td>{route.name}</td><td><span className="side-pill short">NOT VERIFIED</span></td><td>Disabled</td>
        </tr>)}
      </tbody></table></div>
      <p className="muted smaller">Read the <a href="https://github.com/mushee-io/Hoxo-MM/blob/main/docs/BRIDGE_MATRIX.md" target="_blank" rel="noreferrer">bridge trust matrix <ExternalLink size={12}/></a> for the outstanding acceptance gates.</p>
    </section>
  </div>
}
