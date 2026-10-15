import { describe, expect, it } from 'vitest'
import { buildTestnetIntent, verifyIntentAssociation, type SignedTestnetIntent } from './testnetIntents'

const account = 'bx' + '1'.repeat(93)
const nonce = '12345678-1234-4321-1234-123456789abc'
const now = 1_797_100_000_000
describe('Testnet swap and lending wallet signatures (no real settlement)', () => {
  const signed = (kind: 'swap' | 'lend', message: string): SignedTestnetIntent => ({
    kind, message, signature: 'SigV1-verification-from-wallet', verified: true,
    walletAddress: account, issuedAt: now,
  })
  it('builds compact testnet-only swap proposal without a fake asset quote', () => {
    const message = buildTestnetIntent(account, { kind: 'swap', amount: '0.125', desiredAsset: 'PRIVACY_TOKEN' }, nonce, now)
    expect(message).toContain('chain=beldex-testnet')
    expect(message).toContain('kind=swap')
    expect(message).toContain('bdxAtomic=125000000')
    expect(message).toContain('desired=PRIVACY_TOKEN')
    expect(message.length).toBeLessThanOrEqual(512)
    expect(verifyIntentAssociation(signed('swap', message), account, now + 5_000)).toBe(true)
    expect(verifyIntentAssociation(signed('swap', message), account, now + 300_001)).toBe(false)
  })
  it('validates APR and strict BDX atomic amounts for lending intent', () => {
    const message = buildTestnetIntent(account, { kind: 'lend', amount: '0.000000001', aprBps: 500 }, nonce, now)
    expect(message).toContain('aprBps=500')
    expect(message).toContain('bdxAtomic=1')
    expect(verifyIntentAssociation(signed('lend', message), account, now + 500)).toBe(true)
  })
  it('rejects unsupported symbols, zero, excess amounts and non-integer APR', () => {
    expect(() => buildTestnetIntent(account, { kind: 'swap', amount: '0.1', desiredAsset: 'BDX' }, nonce, now)).toThrow()
    expect(() => buildTestnetIntent(account, { kind: 'swap', amount: '0.1', desiredAsset: 'x<script>' }, nonce, now)).toThrow()
    for (const amount of ['0', '-1', '1e3', '5.000000001', '0.0000000001', '']) {
      expect(() => buildTestnetIntent(account, { kind: 'lend', amount, aprBps: 500 }, nonce, now)).toThrow()
    }
    expect(() => buildTestnetIntent(account, { kind: 'lend', amount: '0.1', aprBps: 3.5 }, nonce, now)).toThrow()
    expect(() => buildTestnetIntent(account, { kind: 'lend', amount: '0.1', aprBps: 11000 }, nonce, now)).toThrow()
  })
  it('does not allow signature reuse for another wallet, kind, or expiration window', () => {
    const message = buildTestnetIntent(account, { kind: 'swap', amount: '0.1', desiredAsset: 'PRIVACY_TOKEN' }, nonce, now)
    expect(verifyIntentAssociation(signed('swap', message), 'bx' + '2'.repeat(93), now + 1)).toBe(false)
    expect(verifyIntentAssociation(signed('lend', message), account, now + 1)).toBe(false)
    expect(verifyIntentAssociation({ ...signed('swap', message), verified: false as true }, account, now + 1)).toBe(false)
    expect(verifyIntentAssociation(signed('swap', message), account, now - 1)).toBe(false)
    expect(() => buildTestnetIntent('fake', { kind: 'swap', amount: '0.1', desiredAsset: 'PRIVACY_TOKEN' }, nonce, now)).toThrow()
  })
})
