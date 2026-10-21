import { describe, expect, it } from 'vitest'
import {
  formatAtomicAssetBalance, hexTokenId, isTokenCatalogue, parseTokenDescriptor, parseVerifiedPublicTokenLookup,
  parseTokenList,
} from './testnetCatalogue'

const id = 'a'.repeat(64)
const descriptor = {
  token_id: id, ticker: 'HOXO', full_name: 'Hoxo Test Token',
  owner: 'public-testnet-owner', current_supply: '123456789000',
  total_max_supply: '1000000000000', decimal_point: 9,
}
describe('published public Beldex testnet token metadata', () => {
  it('requires exact token IDs and fixed precision', () => {
    expect(hexTokenId(id)).toBe(true)
    expect(hexTokenId(id + '0')).toBe(false)
    expect(hexTokenId('../../wallet')).toBe(false)
    expect(parseTokenDescriptor(descriptor)).toEqual({
      tokenId: id, ticker: 'HOXO', name: 'Hoxo Test Token', decimals: 9,
      currentSupplyAtomic: '123456789000', maximumSupplyAtomic: '1000000000000',
      owner: 'public-testnet-owner',
    })
    expect(parseTokenDescriptor({ ...descriptor, token_id: '../other' })).toBeNull()
    expect(parseTokenDescriptor({ ...descriptor, decimal_point: 20 })).toBeNull()
    expect(parseTokenDescriptor({ ...descriptor, current_supply: '-1' })).toBeNull()
    expect(parseTokenDescriptor({ ...descriptor, current_supply: '1e3' })).toBeNull()
  })
  it('accepts public list responses but never makes up absent data', () => {
    expect(parseTokenList({ token_ids: [id], total_count: 1 })).toEqual({ ids: [id], totalCount: 1 })
    expect(parseTokenList({ token_ids: ['invalid'] })).toBeNull()
    expect(parseTokenList({ token_ids: false })).toBeNull()
    expect(parseTokenList({ token_ids: [], total_count: 0 })).toEqual({ ids: [], totalCount: 0 })
    expect(parseTokenList({ token_ids: Array(15).fill(id), total_count: 50 })).toBeNull()
    expect(parseTokenList({ token_ids: [id, id.toUpperCase()], total_count: 2 })).toBeNull()
  })
  it('formats large atomic supplies precisely without floating-point rounding', () => {
    expect(formatAtomicAssetBalance('123456789000', 9)).toBe('123.456789')
    expect(formatAtomicAssetBalance('1', 18)).toBe('0.000000000000000001')
    expect(formatAtomicAssetBalance('18446744073709551615', 0)).toBe('18446744073709551615')
    expect(() => formatAtomicAssetBalance('NaN', 4)).toThrow()
  })
  it('validates displayed catalogue structures', () => {
    const result = {
      network: 'beldex-testnet', source: 'official-wallet-configured-testnet-lws',
      query: 'public-token-metadata-only', obtainedAt: '2026-10-15T00:00:00Z',
      offset: 0, tokens: [{
        tokenId: id, ticker: 'HOXO', name: 'Hoxo Test Token', decimals: 9,
        currentSupplyAtomic: '123456789000', maximumSupplyAtomic: '1000000000000',
        owner: 'public-testnet-owner',
      }], totalCount: 1, partial: false, warning: 'Metadata only',
    }
    expect(isTokenCatalogue(result)).toBe(true)
    expect(isTokenCatalogue({ ...result, network: 'beldex-mainnet' })).toBe(false)
    expect(isTokenCatalogue({ ...result, tokens: [null] })).toBe(false)
  })
  it('validates the public metadata envelope against the requested asset ID', () => {
    const valid = {
      network: 'beldex-testnet', source: 'official-wallet-configured-testnet-lws',
      obtainedAt: '2026-10-21T18:00:00Z',
      asset: { tokenId: id, ticker: 'HOXO', name: 'Hoxo Test Token', decimals: 9,
        currentSupplyAtomic: '123456789000', maximumSupplyAtomic: '1000000000000', owner: 'public-testnet-owner' },
    }
    expect(parseVerifiedPublicTokenLookup(valid, id)?.ticker).toBe('HOXO')
    expect(parseVerifiedPublicTokenLookup(valid, id.toUpperCase())?.tokenId).toBe(id)
    expect(parseVerifiedPublicTokenLookup({ ...valid, network: 'beldex-mainnet' }, id)).toBeNull()
    expect(parseVerifiedPublicTokenLookup({ ...valid, source: 'wallet-portfolio' }, id)).toBeNull()
    expect(parseVerifiedPublicTokenLookup({ ...valid, asset: { ...valid.asset, tokenId: 'b'.repeat(64) } }, id)).toBeNull()
    expect(parseVerifiedPublicTokenLookup({ ...valid, asset: { ...valid.asset, currentSupplyAtomic: 'NaN' } }, id)).toBeNull()
    expect(parseVerifiedPublicTokenLookup({ ...valid, obtainedAt: 'not-a-date' }, id)).toBeNull()
  })
})
