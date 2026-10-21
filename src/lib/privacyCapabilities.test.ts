import { describe, expect, it } from 'vitest'
import { PUBLISHED_DAPP_V1_METHODS, privateAssetMethodReadiness, refusePrivateAssetBalanceRead } from './privacyCapabilities'
import { unavailablePrivacyAssetAdapter } from './privacyAssetAdapter'

describe('M7 wallet dApp capability boundary', () => {
  it('does not invent private token wallet RPC calls', async () => {
    expect(PUBLISHED_DAPP_V1_METHODS).toContain('bdx_sendTransaction')
    expect(PUBLISHED_DAPP_V1_METHODS.some(method => /token|asset/i.test(method))).toBe(false)
    const supported = privateAssetMethodReadiness()
    expect(supported.privateAssetBalance).toBe(false)
    expect(supported.privateAssetTransfer).toBe(false)
    expect(supported.privateAssetIssuance).toBe(false)
    expect(() => refusePrivateAssetBalanceRead()).toThrow(/view keys/)
    const adapter = unavailablePrivacyAssetAdapter()
    expect(adapter.capabilities.size).toBe(0)
    await expect(adapter.balance({ assetId: 'a'.repeat(64), symbol: 'HXX', decimals: 9 })).rejects.toThrow(/not documented/)
  })
})
