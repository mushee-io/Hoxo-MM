/**
 * Local testnet transaction guard. An SDK timeout does NOT prove failure:
 * never offer a fresh send after an unresolved approval until the user
 * reconciles their own extension's history. No destination, amount, private
 * key, view key, wallet identity or tx hash is persisted.
 */
export const TRANSFER_LOCK_KEY = 'hoxo-testnet-unresolved-v2'
export type TransferLock = { status: 'pending'; createdAt: number; idempotencyKey: string }
const KEY_RE = /^[0-9a-f-]{36}$/
export function readTransferLock(storage: Pick<Storage, 'getItem'>): TransferLock | null {
  try {
    const raw = storage.getItem(TRANSFER_LOCK_KEY)
    if (raw === null) return null
    const value: unknown = JSON.parse(raw)
    if (typeof value !== 'object' || !value || Array.isArray(value)) return { status: 'pending', createdAt: 0, idempotencyKey: '' }
    const data = value as Partial<TransferLock>
    if (data.status !== 'pending' || !Number.isSafeInteger(data.createdAt) || typeof data.idempotencyKey !== 'string' || !KEY_RE.test(data.idempotencyKey)) {
      return { status: 'pending', createdAt: 0, idempotencyKey: '' }
    }
    return { status: 'pending', createdAt: data.createdAt, idempotencyKey: data.idempotencyKey }
  } catch {
    // Corrupted state may represent an unresolved wallet approval. Fail closed.
    return { status: 'pending', createdAt: 0, idempotencyKey: '' }
  }
}
export function saveTransferLock(storage: Pick<Storage, 'setItem'>, key: string, now: number): TransferLock {
  if (!KEY_RE.test(key) || !Number.isSafeInteger(now) || now <= 0) throw new Error('Invalid testnet transfer guard')
  const record: TransferLock = { status: 'pending', createdAt: now, idempotencyKey: key }
  // A blocked or unavailable storage MUST prevent a request, not silently
  // permit an ambiguous payment on the next page load.
  storage.setItem(TRANSFER_LOCK_KEY, JSON.stringify(record))
  return record
}
export function clearTransferLock(storage: Pick<Storage, 'removeItem'>): void {
  storage.removeItem(TRANSFER_LOCK_KEY)
}
export function shouldPreserveLockAfterError(code: number | undefined): boolean {
  // Only an explicit wallet rejection is guaranteed not to have sent funds.
  return code !== 4001
}
