import { describe, expect, it } from 'vitest'
import { MILESTONES, milestoneOverview } from './milestones'

describe('evidence-based 20-milestone status', () => {
  it('keeps stable unique sequential milestone identifiers', () => {
    expect(MILESTONES.map(m => m.number)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
    expect(new Set(MILESTONES.map(m => m.title)).size).toBe(20)
  })
  it('never confuses existing simulations or risk research with financial settlement', () => {
    expect(milestoneOverview().testnetDeFiLaunched).toBe(false)
    expect(milestoneOverview().completed).toBe(1)
    for (const m of MILESTONES.filter(x => [7, 8, 10, 13, 14, 15, 16, 17, 18, 19].includes(x.number))) {
      expect(m.state).toBe('blocked')
      expect(m.nextGate.length).toBeGreaterThan(10)
    }
  })
})
