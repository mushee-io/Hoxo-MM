import { useCallback, useRef, useState } from 'react'
import { BdxRpcError, BeldexWeb3, detectProvider, fromAtomic } from '@bdxi/web3js'
import { isTestnet, validateTestnetSend } from '../lib/testnet'
import { clearTransferLock, readTransferLock, saveTransferLock, shouldPreserveLockAfterError, type TransferLock } from '../lib/transferSafety'

export type Connection = {
  address: string
  network: string
  unlocked: string
  unlockedAtomic: bigint | null
  approximate: boolean
  height: number | null
}
type TransferStatus = 'awaiting-approval' | 'broadcast' | 'unknown' | 'rejected' | 'failed'
export type TestnetTransfer = {
  status: TransferStatus
  txHash?: string
  fee?: string
  operationId?: string
  message?: string
}

/** Never use this hook to send to mainnet or submit simulated DeFi trades. */
export function useBeldexWallet() {
  const sdk = useRef<BeldexWeb3 | null>(null)
  const inFlight = useRef(false)
  const [connection, setConnection] = useState<Connection | null>(null)
  const [busy, setBusy] = useState(false)
  const [busySend, setBusySend] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transaction, setTransaction] = useState<TestnetTransfer | null>(null)
  const [unresolvedLock, setUnresolvedLock] = useState<TransferLock | null>(() => readTransferLock(localStorage))
  const sdkListeners = useRef<(() => void) | null>(null)
  const removeListeners = () => { sdkListeners.current?.(); sdkListeners.current = null }

  const invalidate = useCallback(() => {
    sdk.current = null
    removeListeners()
    setConnection(null)
    // Keep pending outcome information; it may have been broadcast.
    setTransaction(current => current?.status === 'unknown' ? current : null)
    setError('Wallet account or network changed. Reconnect and recheck any previous transfers.')
  }, [])

  const connect = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const provider = await detectProvider({ timeoutMs: 3000 })
      if (!provider) throw new Error('Beldex Extension Wallet not detected. Install the TESTNET build and reload the page.')
      const wallet = new BeldexWeb3(provider)
      const { address, network } = await wallet.connect()
      const details = await wallet.getNetwork()
      if (network !== details.nettype || !['testnet', 'mainnet'].includes(network)) {
        throw new Error('Wallet network could not be verified; no testnet transfer is available')
      }
      removeListeners()
      sdk.current = wallet
      wallet.on('networkChanged', invalidate)
      wallet.on('accountsChanged', invalidate)
      wallet.on('disconnect', invalidate)
      sdkListeners.current = () => { wallet.off('networkChanged', invalidate); wallet.off('accountsChanged', invalidate); wallet.off('disconnect', invalidate) }
      let unlocked = 'Unavailable'
      let unlockedAtomic: bigint | null = null
      let approximate = false
      let height: number | null = null
      try {
        const balance = await wallet.getBalance()
        unlocked = fromAtomic(balance.unlocked)
        unlockedAtomic = balance.unlocked
        approximate = Boolean(balance.approximate)
        height = balance.height
      } catch { /* wallet connection stays visible, sending remains disabled */ }
      setConnection({ address, network: String(network), unlocked, unlockedAtomic, approximate, height })
      if (!isTestnet(network)) setError('A mainnet wallet is connected. HOXO can read it, but real sending is blocked. Switch to Beldex Testnet.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Wallet connection failed')
    } finally { setBusy(false) }
  }, [invalidate])

  const disconnect = useCallback(async () => {
    const wallet = sdk.current
    sdk.current = null
    removeListeners()
    try { await wallet?.disconnect() } catch { /* app state is still cleared */ }
    setConnection(null)
    setError(null)
    setTransaction(current => current?.status === 'unknown' ? current : null)
  }, [])

  const refresh = useCallback(async () => {
    const wallet = sdk.current
    if (!wallet) return
    try {
      const details = await wallet.getNetwork()
      const address = await wallet.getAddress()
      const current = await wallet.getBalance()
      if (details.nettype !== 'mainnet' && details.nettype !== 'testnet') throw new Error('Unsupported Beldex wallet network')
      if (!connection || connection.address !== address || connection.network !== details.nettype) {
        invalidate()
        return
      }
      setConnection({ ...connection, unlocked: fromAtomic(current.unlocked), unlockedAtomic: current.unlocked, approximate: Boolean(current.approximate), height: current.height })
      setError(null)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not refresh wallet balance') }
  }, [connection, invalidate])

  const sendTestnet = useCallback(async (to: string, displayAmount: string): Promise<void> => {
    if (inFlight.current || busySend) return
    if (unresolvedLock || transaction?.status === 'unknown') {
      setError('A previous testnet transfer may have broadcast. Check the wallet history and reconcile it before starting another.')
      return
    }
    const wallet = sdk.current
    if (!wallet || !connection) { setError('Connect a Beldex testnet wallet first'); return }
    inFlight.current = true
    setBusySend(true)
    setError(null)
    try {
      const details = await wallet.getNetwork()
      const current = await wallet.getAddress()
      if (details.nettype !== 'testnet' || connection.network !== 'testnet' ||
        current !== connection.address) throw new Error('Testnet/account verification failed. Switch to Beldex TESTNET and reconnect.')
      const balance = await wallet.getBalance()
      if (balance.approximate) throw new Error('Wallet spendable balance is approximate. Wait for sync and refresh before sending test BDX.')
      const { atomic } = validateTestnetSend(details.nettype, to, displayAmount, balance.unlocked)
      // One wallet-authorised send only. Unknown outcomes are NEVER auto-retried;
      // users should inspect their own testnet wallet before sending again.
      const key = crypto.randomUUID()
      const lock = saveTransferLock(localStorage, key, Date.now())
      setUnresolvedLock(lock)
      setTransaction({ status: 'awaiting-approval', message: 'Review this testnet-only BDX transfer in your wallet.' })
      const result = await wallet.sendTransaction({ to, amount: atomic, priority: 1, idempotencyKey: key })
      clearTransferLock(localStorage)
      setUnresolvedLock(null)
      setTransaction({ status: 'broadcast', txHash: result.txHash, fee: fromAtomic(result.fee), operationId: result.operationId, message: 'Wallet returned a transaction hash. Check your wallet for chain confirmation.' })
      await refresh()
    } catch (cause) {
      const code = cause instanceof BdxRpcError ? cause.code : undefined
      const isRejected = BeldexWeb3.isUserRejection(cause)
      if (isRejected) {
        try { clearTransferLock(localStorage); setUnresolvedLock(null) }
        catch { setError('Wallet declined; local storage remains locked. Reconcile it before future use.') }
        setTransaction({ status: 'rejected', message: 'Wallet approval was declined. No transaction was resubmitted.' })
      } else if (unresolvedLock || readTransferLock(localStorage)) {
        // Any error after starting a wallet approval can be an unknown outcome.
        // This includes timeouts, provider errors and connection changes.
        if (shouldPreserveLockAfterError(code)) {
          setUnresolvedLock(readTransferLock(localStorage))
          setTransaction({ status: 'unknown', message: 'Wallet send outcome unverified. Do not resend until you check your testnet wallet history.' })
          setError('Transaction may already exist. Reconcile the wallet history before sending anything else.')
        }
      } else {
        const message = cause instanceof Error ? cause.message : 'Testnet preflight failed'
        setTransaction({ status: 'failed', message })
        setError(message)
      }
    } finally {
      inFlight.current = false
      setBusySend(false)
    }
  }, [busySend, connection, refresh, transaction?.status, unresolvedLock])

  const refreshTransferStatus = useCallback(async () => {
    const wallet = sdk.current
    const operationId = transaction?.operationId
    if (!wallet || !operationId) { setError('No recoverable wallet operation ID is available'); return }
    try {
      const details = await wallet.getNetwork()
      if (details.nettype !== 'testnet' || connection?.network !== 'testnet') throw new Error('Status lookup requires the same Beldex TESTNET wallet')
      const result = await wallet.getOperationStatus(operationId)
      if (result.status === 'confirmed') {
        setTransaction({ status: 'broadcast', txHash: result.txHash, fee: fromAtomic(result.fee), operationId, message: 'Wallet confirms the operation. Verify transaction inclusion independently.' })
      } else if (result.status === 'failed') {
        setTransaction({ status: 'failed', operationId, message: 'Wallet reports this operation failed.' })
      } else {
        setTransaction({ status: 'unknown', operationId, message: 'Wallet operation is still executing or unavailable. Do not resend blindly.' })
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not check wallet operation') }
  }, [connection?.network, transaction?.operationId])

  const clearReconciled = useCallback(() => {
    if (busySend || inFlight.current) return
    try {
      clearTransferLock(localStorage)
      setUnresolvedLock(null)
      setTransaction(current => current?.status === 'unknown' ? null : current)
      setError(null)
    } catch { setError('Could not clear the pending transaction lock. Check browser storage settings.') }
  }, [busySend])

  return { connection, busy, busySend, error, transaction, unresolvedLock, connect, disconnect, refresh, sendTestnet, refreshTransferStatus, clearReconciled }
}
