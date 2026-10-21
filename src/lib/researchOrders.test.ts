import { describe, expect, it } from 'vitest'
import { ResearchOrderLedger } from './researchOrders'
import { buildTestnetIntent, type SignedTestnetIntent } from './testnetIntents'

const account = 'bx' + '1'.repeat(93)
const nonce = '12345678-1234-4321-1234-123456789abc'
const now = 1_797_100_000_000
const message = buildTestnetIntent(account, { kind: 'swap', amount: '0.1', desiredAsset: 'PRIVACY_TOKEN' }, nonce, now)
const signed: SignedTestnetIntent = {
  kind: 'swap', message, signature: 'wallet-verified-testnet-signature',
  verified: true, walletAddress: account, issuedAt: now,
}

describe('M11 memory-only research order lifecycle', () => {
  it('tracks signed proposals while permanently refusing financial settlement', () => {
    const ledger = new ResearchOrderLedger()
    const created = ledger.addWalletSignedProposal(signed, account, now)
    expect(created.inputAtomic).toBe(100_000_000n)
    expect(created.assetSymbol).toBe('PRIVACY_TOKEN')
    expect(created.status).toBe('signed')
    expect(created.settlement).toBe('disabled')
    expect(ledger.count()).toBe(1)
    expect(() => ledger.assertNoExecution()).toThrow(/never settle/)
    expect(() => ledger.addWalletSignedProposal(signed, account, now)).toThrow(/consumed/)
  })
  it('keeps cancellation, expiry and ownership fail-closed', () => {
    const ledger = new ResearchOrderLedger()
    ledger.addWalletSignedProposal(signed, account, now)
    expect(() => ledger.cancel(nonce, 'bx' + '2'.repeat(93), now + 1)).toThrow()
    expect(ledger.cancel(nonce, account, now + 1).status).toBe('cancelled')
    expect(() => ledger.cancel(nonce, account, now + 2)).toThrow()
    expect(ledger.get(nonce, now + 300_001)?.status).toBe('cancelled')
    const other = new ResearchOrderLedger()
    other.addWalletSignedProposal(signed, account, now)
    expect(other.get(nonce, now + 300_001)?.status).toBe('expired')
    expect(() => other.cancel(nonce, account, now + 300_001)).toThrow()
  })
  it('refuses forged or expired proposal association', () => {
    const ledger = new ResearchOrderLedger()
    expect(() => ledger.addWalletSignedProposal({ ...signed, signature: '' }, account, now)).toThrow()
    expect(() => ledger.addWalletSignedProposal(signed, account, now + 300_001)).toThrow()
    expect(() => ledger.addWalletSignedProposal(signed, 'bx' + '2'.repeat(93), now)).toThrow()
  })
})
