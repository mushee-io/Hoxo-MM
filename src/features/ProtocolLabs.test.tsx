import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { LendingResearchLab, SpotResearchLab, TokenIntegrationLab } from './ProtocolLabs'

describe('M9–M17 research UI integration (no live wallet or SDK call)', () => {
  it('renders official-wallet-only registration and transfer research', () => {
    const html=renderToString(<TokenIntegrationLab/>)
    expect(html).toContain('M9–10 / Beldex Privacy Token workflow')
    expect(html).toContain('OFFICIAL WALLET REQUIRED')
    expect(html).toContain('no send')
    expect(html).not.toContain('Approve transfer in wallet')
  })
  it('displays an explicit spot execution blocker', () => {
    const html=renderToString(<SpotResearchLab/>)
    expect(html).toContain('SWAP EXECUTION BLOCKED')
    expect(html).toContain('simulate hypothetical')
    expect(html).toContain('atomic')
  })
  it('renders vault research separately from any actual account balance', () => {
    const html=renderToString(<LendingResearchLab/>)
    expect(html).toContain('M15–17 / Lending vault and oracle research')
    expect(html).toContain('SIMULATION ONLY')
    expect(html).toContain('Fictional vault cash')
    expect(html).toContain('0')
  })
})
