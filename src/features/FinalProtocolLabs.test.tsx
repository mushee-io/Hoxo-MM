import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { BridgeResearchLab, PerpsClearingLab } from './FinalProtocolLabs'
import { ReleaseChecklist } from './ReleaseChecklist'

describe('HOXO M18–20 research UI safety labels',()=>{
 it('renders virtual matched perps, not real clearing',()=>{
  const html=renderToString(<PerpsClearingLab/>)
  expect(html).toContain('Matched perpetuals clearing research')
  expect(html).toContain('NO LIVE PERPS')
  expect(html).toContain('Fund paper accounts')
  expect(html).toContain('No market-maker')
 })
 it('renders a bridge without claiming connected adapters',()=>{
  const html=renderToString(<BridgeResearchLab/>)
  expect(html).toContain('Cross-chain route safety review')
  expect(html).toContain('NO VERIFIED BRIDGE')
  expect(html).toContain('Not verified')
  expect(html).toContain('Create non-executable bridge review')
 })
 it('separates code boxes from unverified release gates',()=>{
  const html=renderToString(<ReleaseChecklist/>)
  expect(html).toContain('Milestones 18–20')
  expect(html).toContain('PERSONAL REVIEW ONLY')
  expect(html).toContain('PRODUCTION STILL BLOCKED')
  expect(html).toContain('Third-party security and economic audits signed off')
 })
})
