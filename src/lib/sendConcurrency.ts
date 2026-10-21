/**
 * Prevent two same-origin tabs from approving native BDX sends concurrently.
 * Persistent transferSafety lock continues guarding reloads/timeouts. Web
 * Locks are required instead of a racy read-then-write localStorage mutex.
 */
export const TESTNET_SEND_LOCK_NAME = 'hoxo-beldex-testnet-native-send-v1'

export async function withExclusiveTestnetSend<T>(
  action: () => Promise<T>,
  manager: LockManager | undefined = typeof navigator === 'undefined' ? undefined : navigator.locks,
): Promise<T> {
  if (!manager || typeof manager.request !== 'function') {
    throw new Error('Browser Web Locks are required for safe cross-tab testnet transfers')
  }
  return manager.request(TESTNET_SEND_LOCK_NAME, { mode: 'exclusive', ifAvailable: true }, async lock => {
    if (!lock) throw new Error('Another HOXO tab is handling a BDX transfer. Do not send twice.')
    return action()
  })
}
