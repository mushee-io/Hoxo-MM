import { useState } from 'react'
import { CheckSquare, LockKeyhole, RotateCcw } from 'lucide-react'
import { MILESTONES, type MilestoneState } from '../lib/milestones'
import { MILESTONE_CROSSBOXES, MILESTONE_PHASES, readMilestoneReviews,
  writeMilestoneReview, clearMilestoneReviews, crossboxOverview } from '../lib/milestoneCrossboxes'

const stateText: Record<MilestoneState,string> = {
  implemented: 'IMPLEMENTED',
  partial: 'PARTIAL',
  blocked: 'BLOCKED',
  planned: 'PLANNED',
}

/** All 20 milestones with three independent notions of "checked". */
export function MilestoneCrossboxes() {
  const [personalReviewed,setPersonalReviewed]=useState<number[]>(()=>
    typeof window==='undefined'?[]:readMilestoneReviews(window.localStorage))
  const [showOutstandingOnly,setShowOutstandingOnly]=useState(false)
  const [error,setError]=useState('')
  const stats=crossboxOverview(personalReviewed)
  function onReview(number:number,checked:boolean) {
    try {
      setPersonalReviewed(writeMilestoneReview(localStorage,number,checked))
      setError('')
    } catch(e){
      setError(e instanceof Error?e.message:'Could not save your personal review')
    }
  }
  function reset(){
    try {setPersonalReviewed(clearMilestoneReviews(localStorage));setError('')}
    catch(e){setError(e instanceof Error?e.message:'Could not clear milestone review notes')}
  }
  return <section className="panel" id="all-milestone-checkboxes">
    <div className="card-heading">
      <h3><CheckSquare size={18}/> Milestones 1–20 · Crossboxes</h3>
      <span className="subtle-pill">CODE ≠ LIVE SETTLEMENT</span>
    </div>
    <p className="muted smaller">Each milestone has three boxes. <b>Research foundation</b> means code, research tooling or an explicit safety guard exists. <b>Acceptance</b> is checked only when the source-controlled milestone status is implemented. <b>My review</b> is an editable personal note, not proof of a testnet transaction or independent audit.</p>
    <div className="route-result-metrics" style={{marginTop:14}}>
      <span>Code / research foundations<b>{stats.researchFoundations} / {stats.total}</b></span>
      <span>Milestones accepted in source<b>{stats.fullyAccepted} / {stats.total}</b></span>
      <span>My review checkmarks<b>{stats.personallyReviewed} / {stats.total}</b></span>
      <span>Awaiting release acceptance<b>{stats.acceptanceOutstanding}</b></span>
    </div>
    <div className="crossboxes-controls">
      <label><input type="checkbox" checked={showOutstandingOnly} onChange={e=>setShowOutstandingOnly(e.target.checked)} /> Show incomplete milestones only</label>
      <button className="mini-btn" type="button" onClick={reset}><RotateCcw size={13}/> Clear my reviews</button>
    </div>
    <div className="crossboxes-legend">
      <span><input type="checkbox" checked disabled aria-label="Legend: research foundation exists"/> Code/research</span>
      <span><input type="checkbox" checked disabled aria-label="Legend: accepted workstream"/> Accepted</span>
      <span><input type="checkbox" disabled aria-label="Legend: outstanding workstream"/> Outstanding</span>
      <span><input type="checkbox" checked readOnly aria-label="Legend: editable review box"/> My review</span>
    </div>
    {MILESTONE_PHASES.map(phase=>{
      const milestones=MILESTONES.filter(m=>m.number>=phase.start&&m.number<=phase.end&&
        (!showOutstandingOnly||m.state!=='implemented'))
      return milestones.length ? <div className="crossboxes-phase" key={phase.start}>
        <h4>{phase.label}</h4>
        <div className="crossboxes-list">
          {milestones.map(m=>{
            const evidence=MILESTONE_CROSSBOXES[m.number-1]
            const reviewed=personalReviewed.includes(m.number)
            return <div className="crossboxes-item" key={m.number}>
              <div className="crossboxes-title"><b><span className="crossboxes-num">{String(m.number).padStart(2,'0')}</span> {m.title}</b>
                <span className={'side-pill '+(m.state==='blocked'?'short':'neutral')}>{stateText[m.state]}</span>
              </div>
              <div className="crossboxes-status">
                <label title={'Research/source evidence: '+evidence.codePath}>
                  <input type="checkbox" checked={evidence.researchFoundationPresent} disabled aria-label={'Milestone '+m.number+' research foundation exists'}/> Research foundation
                </label>
                <label title={m.nextGate}>
                  <input type="checkbox" checked={evidence.liveAcceptanceMet} disabled aria-label={'Milestone '+m.number+' acceptance reached'}/> Acceptance
                </label>
                <label title="Personal review note; no release or settlement permission">
                  <input type="checkbox" checked={reviewed} onChange={e=>onReview(m.number,e.target.checked)} aria-label={'Personally reviewed milestone '+m.number}/> My review
                </label>
              </div>
              <p className="muted smaller"><b>Code:</b> {m.evidence}</p>
              <p className="muted smaller"><b>Still required:</b> {m.nextGate}</p>
            </div>
          })}
        </div>
      </div>:null
    })}
    {error&&<p className="negative-text smaller" role="alert">{error}</p>}
    <p className="muted smaller"><LockKeyhole size={13}/> Even if you tick all 20 personal review boxes, real Swap, Perps, Lending and Bridge execution stays blocked until the independent acceptance gates are implemented and verified.</p>
  </section>
}
