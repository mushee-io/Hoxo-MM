import { checkAddress, toAtomic } from '@bdxi/web3js'

/**
 * TESTNET ONLY. Never call the transfer adapter with a mainnet wallet.
 * BDX uses 9 decimals. These guards apply to real, wallet-approved TEST BDX
 * transfers, not to simulated HOXO Swap / Perps / Lend actions.
 */
export const MAX_TESTNET_SEND_BDX = '5'
export const MAX_TESTNET_SEND_ATOMIC = 5_000_000_000n

export function validateTestnetSend(
  network: string,
  to: string,
  displayAmount: string,
  unlockedAtomic: bigint,
): { to: string; atomic: bigint } {
  if (network !== 'testnet') throw new Error('Blocked: this action requires a Beldex TESTNET wallet. Mainnet sends are prohibited.')
  if (typeof to !== 'string' || to !== to.trim() || !to) throw new Error('Enter a concrete Beldex recipient address')
  const address = checkAddress(to)
  // Shape check only; the wallet validates the full address and must approve.
  if (!address.valid) throw new Error('Invalid Beldex address: ' + (address.reason ?? 'unsupported format'))
  if (typeof displayAmount !== 'string' || !/^\d+(?:\.\d{1,9})?$/.test(displayAmount.trim())) {
    throw new Error('Enter a BDX amount with up to nine decimal places')
  }
  const atomic = toAtomic(displayAmount.trim())
  if (atomic <= 0n) throw new Error('Enter a BDX amount greater than zero')
  if (atomic > MAX_TESTNET_SEND_ATOMIC) throw new Error('Testnet safety limit is ' + MAX_TESTNET_SEND_BDX + ' BDX per transfer')
  if (typeof unlockedAtomic !== 'bigint' || unlockedAtomic < 0n) throw new Error('Wallet balance is unavailable')
  // Do not allow draining the wallet: native network fees are additional.
  if (atomic >= unlockedAtomic) throw new Error('Insufficient unlocked testnet BDX; leave some test BDX for network fees')
  return { to, atomic }
}

export function isTestnet(network: string | null | undefined): boolean {
  return network === 'testnet'
}
