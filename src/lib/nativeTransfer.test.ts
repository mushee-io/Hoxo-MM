import { describe, expect, it, vi } from 'vitest'
import { executeOneApprovedTestnetSend, type NativeTestnetClient } from './nativeTransfer'
import { readTransferLock } from './transferSafety'

const address = 'bx' + '1'.repeat(93)
const recipient = 'bx' + '2'.repeat(93)
const key = '12345678-1234-4321-1234-123456789abc'
const storage = () => {
  const map = new Map<string, string>()
  return {
    getItem: (name: string) => map.get(name) ?? null,
    setItem: (name: string, data: string) => { map.set(name, data) },
  }
}
const mockWallet = (network = 'testnet', walletAddress = address, approximate = false) => {
  const send = vi.fn().mockResolvedValue({ txHash: 'testhash', fee: '1000', operationId: 'test-operation' })
  const w = {
    getNetwork: vi.fn().mockResolvedValue({ nettype: network, protocolVersion: 1, height: 4242201 }),
    getAddress: vi.fn().mockResolvedValue(walletAddress),
    getBalance: vi.fn().mockResolvedValue({ unlocked: 10_000_000_000n, approximate, total: 10_000_000_000n, height: 4242201 }),
    sendTransaction: send,
  }
  return { wallet: w as unknown as NativeTestnetClient, send }
}
const request = { expectedAddress: address, expectedNetwork: 'testnet', recipient, displayAmount: '0.25' }

describe('real testnet BDX adapter — mock wallet, no live funds', () => {
  it('verifies network and account, writes lock before single wallet approval', async () => {
    const s = storage()
    const { wallet, send } = mockWallet()
    let wasLockedBeforeWallet = false
    send.mockImplementation(async () => {
      wasLockedBeforeWallet = !!readTransferLock(s)
      return { txHash: 'testhash', fee: '1000' }
    })
    const result = await executeOneApprovedTestnetSend(wallet, s, request, key, 1797000000000)
    expect(result.txHash).toBe('testhash')
    expect(wasLockedBeforeWallet).toBe(true)
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith({ to: recipient, amount: 250_000_000n, priority: 1, idempotencyKey: key })
  })
  it('rejects mainnet, mismatched account and approximate funds without calling send', async () => {
    const cases = [
      { ...mockWallet('mainnet'), request },
      { ...mockWallet(), request: { ...request, expectedNetwork: 'mainnet' } },
      { ...mockWallet('testnet', 'bx' + '3'.repeat(93)), request },
      { ...mockWallet('testnet', address, true), request },
    ]
    for (const item of cases) {
      await expect(executeOneApprovedTestnetSend(item.wallet, storage(), item.request, key, 1797000000000)).rejects.toThrow()
      expect(item.send).not.toHaveBeenCalled()
    }
  })
  it('rejects previously unresolved requests without querying or resending', async () => {
    const s = storage()
    const { wallet, send } = mockWallet()
    await executeOneApprovedTestnetSend(wallet, s, request, key, 1797000000000)
    await expect(executeOneApprovedTestnetSend(wallet, s, request, key, 1797000001000)).rejects.toThrow(/unresolved/)
    expect(send).toHaveBeenCalledTimes(1)
  })
  it('does not call the wallet if persistent pre-send state is unavailable', async () => {
    const { wallet, send } = mockWallet()
    await expect(executeOneApprovedTestnetSend(wallet, {
      getItem: () => null,
      setItem: () => { throw new Error('Storage disabled') },
    }, request, key, 1797000000000)).rejects.toThrow(/Storage disabled/)
    expect(send).not.toHaveBeenCalled()
  })
})
