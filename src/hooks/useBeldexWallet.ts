import { useCallback, useRef, useState } from 'react'
import { BeldexWeb3, detectProvider, fromAtomic } from '@bdxi/web3js'

type Connection = { address: string; network: string; unlocked: string; approximate: boolean }
export function useBeldexWallet() {
  const sdk = useRef<BeldexWeb3 | null>(null)
  const [connection, setConnection] = useState<Connection | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(async () => {
    setBusy(true); setError(null)
    try {
      const provider = await detectProvider({ timeoutMs: 3000 })
      if (!provider) throw new Error('Beldex Extension Wallet not detected. Install it and reload the page.')
      const wallet = new BeldexWeb3(provider)
      const { address, network } = await wallet.connect()
      sdk.current = wallet
      let unlocked = 'Unavailable'
      let approximate = false
      try {
        const balance = await wallet.getBalance()
        unlocked = fromAtomic(balance.unlocked)
        approximate = Boolean(balance.approximate)
      } catch { /* connection still valid even if the balance read fails */ }
      setConnection({ address, network: String(network), unlocked, approximate })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Wallet connection failed')
    } finally { setBusy(false) }
  }, [])

  const disconnect = useCallback(async () => {
    try { await sdk.current?.disconnect() } catch { /* still clear app state */ }
    sdk.current = null; setConnection(null); setError(null)
  }, [])

  const refresh = useCallback(async () => {
    if (!sdk.current) return
    try {
      const balance = await sdk.current.getBalance()
      setConnection(current => current ? { ...current, unlocked: fromAtomic(balance.unlocked), approximate: Boolean(balance.approximate) } : null)
      setError(null)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not refresh wallet balance') }
  }, [])

  return { connection, busy, error, connect, disconnect, refresh }
}
