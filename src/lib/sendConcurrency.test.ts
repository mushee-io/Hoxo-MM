import { describe, expect, it, vi } from 'vitest'
import { TESTNET_SEND_LOCK_NAME, withExclusiveTestnetSend } from './sendConcurrency'

describe('M5 same-origin testnet send serialization', () => {
  it('fails closed when the browser cannot give an exclusive lock', async () => {
    const action = vi.fn().mockResolvedValue('sent')
    await expect(withExclusiveTestnetSend(action, undefined)).rejects.toThrow(/Web Locks/)
    expect(action).not.toHaveBeenCalled()
    const manager = { request: vi.fn((_key, _opts, callback) => callback(null)) } as unknown as LockManager
    await expect(withExclusiveTestnetSend(action, manager)).rejects.toThrow(/Another HOXO tab/)
    expect(action).not.toHaveBeenCalled()
  })
  it('holds one exclusive lock for the entire wallet send promise', async () => {
    const acquired: string[] = []
    const manager = {
      request: vi.fn(async (name: string, opts: { mode: string; ifAvailable: boolean }, cb: (lock: { name: string }) => Promise<string>) => {
        expect(opts).toEqual({ mode: 'exclusive', ifAvailable: true })
        acquired.push(name)
        return cb({ name })
      }),
    } as unknown as LockManager
    const value = await withExclusiveTestnetSend(async () => 'sent once', manager)
    expect(value).toBe('sent once')
    expect(acquired).toEqual([TESTNET_SEND_LOCK_NAME])
  })
})
