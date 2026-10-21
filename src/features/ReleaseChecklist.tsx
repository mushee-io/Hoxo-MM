import { useState } from 'react'
import { ClipboardCheck, LockKeyhole } from 'lucide-react'
import { RELEASE_RESEARCH_CHECKS, readPersonalReviews, releaseResearchSummary,
  setPersonalReview } from '../lib/releaseChecklist'

/** M18–20 checkboxes: immutable code-evidence checks + local user review. */
export function ReleaseChecklist() {
  const [checked,setChecked]=useState<string[]>(()=>readPersonalReviews(localStorage))
  const [error,setError]=useState('')
  const summary=releaseResearchSummary(checked)
  function toggle(id:string,value:boolean){
    try {setChecked(setPersonalReview(localStorage,id,value));setError('')}
    catch(err){setError(err instanceof Error?err.message:'Could not save review checkbox')}
  }
  return <section className="panel">
    <div className="card-heading"><h3><ClipboardCheck size={17}/> Milestones 18–20 · Checkboxes</h3><span className="subtle-pill">PRODUCTION STILL BLOCKED</span></div>
    <p className="muted smaller">Code checks are locked to repository evidence. Manual boxes are personal review notes saved only in this browser; ticking them does <b>not</b> prove a real testnet transaction, pass an audit, or enable financial features.</p>
    <div className="route-result-metrics">
      <span>Implemented in code<b>{summary.implementedCodeChecks}/{summary.codeChecks}</b></span>
      <span>My manual review notes<b>{summary.manualReviewCount}/{summary.manualGates}</b></span>
      <span>Externally verified for live settlement<b>{summary.externallyVerifiedChecks}</b></span>
    </div>
    {[18,19,20].map(m=><div className="route-result" key={m} style={{marginTop:14}}>
      <div className="card-heading"><h3>Milestone {m} {m===18?'· Perpetuals':m===19?'· Cross-chain bridges':'· Security and release'}</h3><span className="subtle-pill">RESEARCH ONLY</span></div>
      {RELEASE_RESEARCH_CHECKS.filter(c=>c.milestone===m).map(check=>
        <label key={check.id} style={{display:'flex',alignItems:'start',gap:10,margin:'14px 0',cursor:check.mode==='external-gate'?'pointer':'default'}}>
          <input type="checkbox" checked={check.mode==='code-observed'?check.codeReady:checked.includes(check.id)}
            disabled={check.mode==='code-observed'}
            onChange={event=>toggle(check.id,event.target.checked)}
            aria-label={check.label}
            style={{marginTop:4,accentColor:'#91ead3'}}/>
          <span style={{flex:1}}>
            <b>{check.label}</b>
            <small className="block-muted">{check.evidence}</small>
            <small className="block-muted">{check.mode==='code-observed'?'IMPLEMENTED IN SOURCE · NOT A SECURITY AUDIT':'PERSONAL REVIEW ONLY · EXTERNAL PROOF STILL REQUIRED'}</small>
          </span>
        </label>)}
    </div>)}
    {error&&<p role="alert" className="negative-text smaller">{error}</p>}
    <p className="muted smaller"><LockKeyhole size={14}/> Checkboxes never alter the source-controlled milestone statuses or settlement gates. Independent auditors and wallet/chain evidence must be reviewed before any production release.</p>
  </section>
}
