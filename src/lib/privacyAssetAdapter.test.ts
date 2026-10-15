import { describe, expect, it } from 'vitest'
import { PRIVACY_ASSET_INTEGRATION, privacyAssetAmountAtomic, unavailablePrivacyAssetAdapter } from './privacyAssetAdapter'

describe('Beldex Proto asset integration remains fail-closed', () => {
  it('does not advertise unsupported published SDK capabilities', async () => {
    const adapter = unavailablePrivacyAssetAdapter()
    expect(PRIVACY_ASSET_INTEGRATION.availableInPublishedWeb3Js).toBe(false)
    expect(adapter.capabilities.size).toBe(0)
    const asset = { assetId: 'TEST-PLACEHOLDER-NOT-A-LIVE-ASSET', symbol: 'TEST', decimals: 9 }
    await expect(adapter.issue({ symbol: 'TEST', decimals: 9 }, 100n)).rejects.toThrow(/not documented/)
    await expect(adapter.balance(asset)).rejects.toThrow(/not documented/)
    await expect(adapter.transfer({ network: 'testnet', asset, recipient: 'not-real', amountAtomic: 2n, idempotencyKey: 'test-key' })).rejects.toThrow(/not documented/)
    await expect(adapter.status('fake')).rejects.toThrow(/not documented/)
  })
  it('handles hypothetical token precision entirely with integers', () => {
    expect(privacyAssetAmountAtomic('12.000000001', 9)).toBe(12_000_000_001n)
    expect(privacyAssetAmountAtomic('0.000000000000000001', 18)).toBe(1n)
    expect(privacyAssetAmountAtomic('1', 0)).toBe(1n)
    for (const n of ['-1', '1e5', 'NaN', '1.1234']) {
      expect(() => privacyAssetAmountAtomic(n, 2)).toThrow()
    }
    expect(() => privacyAssetAmountAtomic('1', -1)).toThrow()
    expect(() => privacyAssetAmountAtomic('1', 19)).toThrow()
  })
})
