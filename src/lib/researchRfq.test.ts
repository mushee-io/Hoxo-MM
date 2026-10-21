import { describe, expect, it } from 'vitest'
import { inspectRfqDraft, refuseUnverifiedRfqExecution } from './researchRfq'

const now = 1_797_100_000_000
const input = {
  network: 'beldex-testnet',
  quoteId: '12345678-1234-4321-1234-123456789abc',
  makerLabel: 'TEST MAKER unverified',
  fromAssetId: 'a'.repeat(64),
  toAssetId: 'b'.repeat(64),
  amountInAtomic: '10000000',
  expectedOutAtomic: '200000',
  minimumOutAtomic: '190000',
  expiresAtMs: now + 30_000,
}
describe('M12 untrusted research RFQ inspection', () => {
  it('validates exact amounts while permanently disallowing settlement', () => {
    const inspected = inspectRfqDraft(input, now)
    expect(inspected.expectedOutAtomic).toBe(200_000n)
    expect(inspected.execution).toBe('unavailable')
    expect(inspected.reason).toContain('no verified maker')
    expect(() => refuseUnverifiedRfqExecution(inspected)).toThrow(/cannot transfer/)
  })
  it('rejects unknown networks, duplicate assets, invalid inputs and dangerous expiry', () => {
    for (const mutation of [
      { network: 'beldex-mainnet' },
      { toAssetId: input.fromAssetId },
      { amountInAtomic: '1.5' },
      { amountInAtomic: '0' },
      { minimumOutAtomic: '200001' },
      { quoteId: '../../strange' },
      { expiresAtMs: now - 1 },
      { expiresAtMs: now + 61_000 },
    ]) {
      expect(() => inspectRfqDraft({ ...input, ...mutation }, now)).toThrow()
    }
    expect(() => inspectRfqDraft(null, now)).toThrow()
  })
})
