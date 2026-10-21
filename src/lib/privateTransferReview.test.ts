import { describe, expect, it } from 'vitest'
import { preparePrivateTransfer, requestPrivateTransferExecution } from './privateTransferReview'
const recipient = 'bx' + '2'.repeat(93)
const valid = { network: 'beldex-testnet', assetId: 'a'.repeat(64), recipient, amount: '0.000000001', decimals: 9 }
describe('M10 private asset testnet transfer preparation — no SDK calls', () => {
  it('keeps recipient, asset identity and BigInt amounts bound to review', () => {
    const review = preparePrivateTransfer(valid)
    expect(review.amountAtomic).toBe(1n)
    expect(review.state).toBe('awaiting-official-wallet-api')
    expect(() => requestPrivateTransferExecution(review)).toThrow(/unavailable/)
  })
  it('refuses mainnet, invalid IDs, destinations and fractional overprecision', () => {
    for (const changes of [{ network: 'mainnet' }, { assetId: 'bad' },
      { recipient: 'incorrect' }, { amount: '0.0000000001' }, { amount: '0' }, { decimals: -1 }]) {
      expect(() => preparePrivateTransfer({ ...valid, ...changes })).toThrow()
    }
  })
})
