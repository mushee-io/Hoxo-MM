import { describe, expect, it } from 'vitest'
import { clearTransferLock, readTransferLock, saveTransferLock, shouldPreserveLockAfterError, TRANSFER_LOCK_KEY } from './transferSafety'
import { assertProofResponse, buildTestnetWalletProof } from './testnetProof'

function fakeStorage() {
  const map = new Map<string, string>()
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => { map.set(key, value) },
    removeItem: (key: string) => { map.delete(key) },
  }
}
const uuid = '12345678-1234-4321-1234-123456789abc'
const exampleAddress = 'bx' + '1'.repeat(93)

describe('HOXO testnet transfer lock', () => {
  it('persists only non-sensitive transaction recovery data and locks across reloads', () => {
    const storage = fakeStorage()
    const lock = saveTransferLock(storage, uuid, 1_797_000_000_000)
    expect(readTransferLock(storage)).toEqual(lock)
    const serialized = storage.getItem(TRANSFER_LOCK_KEY)!
    expect(serialized).not.toContain('recipient')
    expect(serialized).not.toContain('amount')
    expect(serialized).not.toContain('seed')
    clearTransferLock(storage)
    expect(readTransferLock(storage)).toBeNull()
  })
  it('fails closed when the lock is malformed, corrupted or storage fails', () => {
    const storage = fakeStorage()
    storage.setItem(TRANSFER_LOCK_KEY, 'malformed')
    expect(readTransferLock(storage)?.status).toBe('pending')
    storage.setItem(TRANSFER_LOCK_KEY, JSON.stringify({ status: 'pending', createdAt: 3, idempotencyKey: 'bad' }))
    expect(readTransferLock(storage)?.status).toBe('pending')
    const rejectingStorage = { setItem: () => { throw new Error('Storage blocked') } }
    expect(() => saveTransferLock(rejectingStorage, uuid, 100)).toThrow(/blocked/)
    expect(() => saveTransferLock(storage, 'not-uuid', 100)).toThrow(/Invalid/)
  })
  it('never unlocks without explicit user rejection or reconciliation', () => {
    expect(shouldPreserveLockAfterError(4001)).toBe(false)
    expect(shouldPreserveLockAfterError(4998)).toBe(true)
    expect(shouldPreserveLockAfterError(-32603)).toBe(true)
    expect(shouldPreserveLockAfterError(undefined)).toBe(true)
  })
})

describe('local testnet wallet proof', () => {
  it('builds a bounded single-line challenge and rejects forged verification', () => {
    const message = buildTestnetWalletProof(exampleAddress, uuid, 1797000000000)
    expect(message).toContain('hoxo-testnet-proof-v1 wallet=' + exampleAddress)
    expect(message).toContain('nonce=' + uuid)
    expect(message).not.toContain('\n')
    expect(message.length).toBeLessThan(512)
    expect(() => assertProofResponse({ message, address: exampleAddress, signature: 'SigV1test', verified: true })).not.toThrow()
    expect(() => assertProofResponse({ message, address: exampleAddress, signature: '', verified: false })).toThrow()
    expect(() => assertProofResponse({ message, address: exampleAddress.slice(1), signature: 'SigV1', verified: true })).toThrow()
  })
  it('rejects malformed input before requesting wallet approval', () => {
    expect(() => buildTestnetWalletProof('bad', uuid, 1797000000000)).toThrow()
    expect(() => buildTestnetWalletProof(exampleAddress, 'xyz', 1797000000000)).toThrow()
    expect(() => buildTestnetWalletProof(exampleAddress, uuid, -1)).toThrow()
  })
})
