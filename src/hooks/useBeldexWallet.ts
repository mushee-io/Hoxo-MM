import { useCallback, useRef, useState } from 'react'
import { BdxRpcError, BeldexWeb3, detectProvider, fromAtomic } from '@bdxi/web3js'
import { isTestnet, validateTestnetSend } from '../lib/testnet'

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

  const invalidate = useCallback(() => {
    sdk.current = null
    setConnection(null)
    // An unknown result must not be presented as a rejected or failed send.
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
      sdk.current = wallet
      wallet.on('networkChanged', invalidate)
      wallet.on('accountsChanged', invalidate)
      wallet.on('disconnect', invalidate)
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
      setConnection(existing => {
        if (!existing || existing.address !== address || existing.network !== details.nettype) {
          setError('Wallet account/network changed; reconnect before sending')
          return null
        }
        return { ...existing, unlocked: fromAtomic(current.unlocked), unlockedAtomic: current.unlocked, approximate: Boolean(current.approximate), height: current.height }
      })
      setError(null)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not refresh wallet balance') }
  }, [])

  const sendTestnet = useCallback(async (to: string, displayAmount: string): Promise<void> => {
    if (inFlight.current || busySend) return
    if (transaction?.status === 'unknown') {
      setError('Previous transfer outcome is unknown. Do not initiate another transfer until you reconcile it in the wallet.')
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
      const { atomic } = validateTestnetSend(details.nettype, to, displayAmount, balance.unlocked)
      // One wallet-authorised send only. Unknown outcomes are NEVER auto-retried;
      // users should inspect their own testnet wallet before sending again.
      setTransaction({ status: 'awaiting-approval', message: 'Review this testnet-only BDX transfer in your wallet.' })
      const result = await wallet.sendTransaction({ to, amount: atomic, priority: 1 })
      setTransaction({ status: 'broadcast', txHash: result.txHash, fee: fromAtomic(result.fee), operationId: result.operationId, message: 'Wallet returned a transaction hash. Check your wallet for chain confirmation.' })
      await refresh()
    } catch (cause) {
      if (BeldexWeb3.isUserRejection(cause)) {
        setTransaction({ status: 'rejected', message: 'Wallet approval was declined. Nothing was requested again.' })
      } else if (BdxRpcError.isUnknownOutcome(cause)) {
        setTransaction({ status: 'unknown', message: 'Outcome unknown: the wallet may already have broadcast this transfer. DO NOT RESEND. Check wallet history first.' })
      } else {
        const message = cause instanceof Error ? cause.message : 'Testnet transfer failed'
        setTransaction({ status: 'failed', message })
        setError(message)
      }
    } finally {
      inFlight.current = false
      setBusySend(false)
    }
  }, [busySend, connection, refresh, transaction?.status])

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

  return { connection, busy, busySend, error, transaction, connect, disconnect, refresh, sendTestnet, refreshTransferStatus }
}
