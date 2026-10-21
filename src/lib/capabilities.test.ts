import { describe, expect, it } from 'vitest'
import {
  CAPABILITY_CATALOGUE, DEMO_CAPABILITIES,
  assertCapabilityOperation, assertDemoCapability, capabilityAvailability,
  type CapabilityId, type CapabilityOperation,
} from './capabilities'

const synced = { network: 'testnet', walletConnected: true, unlockedAtomic: 10_000_000_000n, approximateBalance: false }

describe('M1 single capability boundary', () => {
  it('has distinct unique product definitions with no executable settlement', () => {
    expect(new Set(CAPABILITY_CATALOGUE.map(x => x.id)).size).toBe(CAPABILITY_CATALOGUE.length)
    expect(CAPABILITY_CATALOGUE.filter(x => x.operation === 'settlement').length).toBeGreaterThan(0)
    for (const definition of CAPABILITY_CATALOGUE) {
      if (definition.operation === 'settlement') {
        expect(definition.state).toBe('blocked')
        expect(() => assertCapabilityOperation(definition.id, 'settlement', synced)).toThrow(/blocked/)
      }
    }
  })
  it('never transforms demo state into financial execution', () => {
    for (const action of Object.keys(DEMO_CAPABILITIES) as (keyof typeof DEMO_CAPABILITIES)[]) {
      expect(() => assertDemoCapability(action)).not.toThrow()
      expect(() => assertCapabilityOperation(DEMO_CAPABILITIES[action], 'settlement', synced)).toThrow(/blocked/)
      expect(capabilityAvailability(DEMO_CAPABILITIES[action]).explanation).toMatch(/Synthetic|Local|Synthetic|synthetic/)
    }
  })
  it('requires a connected exact testnet wallet for a native BDX send', () => {
    const feature: CapabilityId = 'wallet-bdx-testnet-send'
    const operation: CapabilityOperation = 'native-testnet-send'
    expect(() => assertCapabilityOperation(feature, operation, synced)).not.toThrow()
    for (const context of [
      {},
      { ...synced, network: 'mainnet' },
      { ...synced, walletConnected: false },
      { ...synced, unlockedAtomic: null },
      { ...synced, unlockedAtomic: -1n },
      { ...synced, approximateBalance: true },
    ]) {
      expect(capabilityAvailability(feature, context).available).toBe(false)
      expect(() => assertCapabilityOperation(feature, operation, context)).toThrow(/blocked/)
    }
  })
  it('allows supported read/signature classes but never a mismatched operation', () => {
    expect(() => assertCapabilityOperation('privacy-token-public-registry', 'public-read')).not.toThrow()
    expect(() => assertCapabilityOperation('wallet-bdx-read', 'wallet-read', synced)).not.toThrow()
    expect(() => assertCapabilityOperation('wallet-testnet-signature', 'wallet-signature', synced)).not.toThrow()
    expect(() => assertCapabilityOperation('wallet-testnet-signature', 'native-testnet-send', synced)).toThrow(/blocked/)
    expect(() => assertCapabilityOperation('wallet-bdx-testnet-send', 'wallet-read', synced)).toThrow(/blocked/)
    expect(() => assertCapabilityOperation('privacy-token-transfer', 'native-testnet-send', synced)).toThrow(/blocked/)
  })
  it('does not mistake a connected mainnet wallet for permission to sign testnet intents', () => {
    const mainnet = { ...synced, network: 'mainnet' }
    expect(capabilityAvailability('wallet-bdx-read', mainnet).available).toBe(true)
    expect(capabilityAvailability('wallet-testnet-signature', mainnet).available).toBe(false)
    expect(() => assertCapabilityOperation('wallet-testnet-signature', 'wallet-signature', mainnet)).toThrow(/blocked/)
  })
})
