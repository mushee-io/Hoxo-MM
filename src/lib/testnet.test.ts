import { describe, expect, it } from 'vitest'
import { MAX_TESTNET_SEND_ATOMIC, isTestnet, validateTestnetSend } from './testnet'

// Shape-valid fixture only: NOT a wallet, spendable account or funded address.
const EXAMPLE_ADDRESS = 'bx' + '1'.repeat(93)
const unlocked = 20_000_000_000n

describe('HOXO wallet-approved native BDX testnet safety checks', () => {
  it('allows exactly representable testnet amounts up to five BDX', () => {
    expect(validateTestnetSend('testnet', EXAMPLE_ADDRESS, '0.000000001', unlocked).atomic).toBe(1n)
    expect(validateTestnetSend('testnet', EXAMPLE_ADDRESS, '1.250000001', unlocked).atomic).toBe(1_250_000_001n)
    expect(validateTestnetSend('testnet', EXAMPLE_ADDRESS, '5', unlocked).atomic).toBe(MAX_TESTNET_SEND_ATOMIC)
  })
  it('rejects mainnet wallets even if they report a spendable balance', () => {
    expect(isTestnet('mainnet')).toBe(false)
    expect(isTestnet('testnet')).toBe(true)
    expect(() => validateTestnetSend('mainnet', EXAMPLE_ADDRESS, '1', unlocked)).toThrow(/TESTNET/)
    expect(() => validateTestnetSend('', EXAMPLE_ADDRESS, '1', unlocked)).toThrow(/TESTNET/)
  })
  it('refuses a malformed address without contacting the wallet', () => {
    expect(() => validateTestnetSend('testnet', '0x123', '1', unlocked)).toThrow(/Invalid Beldex address/)
    expect(() => validateTestnetSend('testnet', EXAMPLE_ADDRESS + ' ', '1', unlocked)).toThrow(/concrete/)
    expect(() => validateTestnetSend('testnet', '', '1', unlocked)).toThrow()
  })
  it('rejects zero, negative, exponent, overprecision and excessive transfers', () => {
    for (const value of ['0', '-1', '1e2', '0.0000000001', '5.000000001', 'Infinity', 'NaN', '']) {
      expect(() => validateTestnetSend('testnet', EXAMPLE_ADDRESS, value, unlocked)).toThrow()
    }
  })
  it('protects a fee reserve and requires an unlocked balance', () => {
    expect(() => validateTestnetSend('testnet', EXAMPLE_ADDRESS, '5', 5_000_000_000n)).toThrow(/fees/)
    expect(() => validateTestnetSend('testnet', EXAMPLE_ADDRESS, '0.1', 0n)).toThrow(/fees/)
    expect(() => validateTestnetSend('testnet', EXAMPLE_ADDRESS, '1', -1n)).toThrow()
  })
})
