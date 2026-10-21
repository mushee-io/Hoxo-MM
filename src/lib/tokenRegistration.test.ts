import { describe, expect, it } from 'vitest'
import { prepareRegistrationReview, verifyRegisteredPublicDescriptor } from './tokenRegistration'
const request = { ticker: 'HXX', name: 'Hoxo Test Asset', decimals: 9, initialSupply: '12.345', maxSupply: '1000' }
describe('M9 official-wallet-only Privacy Token registration', () => {
  it('parses exact initial/maximum supply without sending or minting', () => {
    const plan = prepareRegistrationReview(request)
    expect(plan.initialAtomic).toBe(12_345_000_000n)
    expect(plan.maximumAtomic).toBe(1_000_000_000_000n)
    expect(plan.execution).toBe('official-wallet-only')
    const token = { tokenId: 'f'.repeat(64), ticker: plan.ticker, name: plan.name, decimals: plan.decimals,
      currentSupplyAtomic: plan.initialAtomic.toString(), maximumSupplyAtomic: plan.maximumAtomic.toString(), owner: 'public owner' }
    expect(verifyRegisteredPublicDescriptor(plan, token)).toMatchObject({ match: true })
    expect(verifyRegisteredPublicDescriptor(plan, { ...token, currentSupplyAtomic: '0' }).match).toBe(false)
  })
  it('rejects misleading metadata and invalid issuance parameters', () => {
    for (const changes of [{ ticker: 'BAD*' }, { decimals: 19 }, { initialSupply: '1000.0000000001' },
      { maxSupply: '0' }, { initialSupply: '2000' }, { maxSupply: '999999999999999999999999999999999999999999999' }]) {
      expect(() => prepareRegistrationReview({ ...request, ...changes })).toThrow()
    }
  })
})
