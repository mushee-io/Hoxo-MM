import type { BeldexWeb3 } from '@bdxi/web3js'
import { validateTestnetSend } from './testnet'
import { assertCapabilityOperation } from './capabilities'
import { readTransferLock, saveTransferLock } from './transferSafety'

export type NativeTestnetClient = Pick<BeldexWeb3, 'getNetwork' | 'getAddress' | 'getBalance' | 'sendTransaction'>
export type NativeSendStorage = Pick<Storage, 'getItem' | 'setItem'>
export type NativeTestnetSendRequest = {
  expectedAddress: string
  expectedNetwork: string
  recipient: string
  displayAmount: string
}
export async function executeOneApprovedTestnetSend(
  wallet: NativeTestnetClient,
  storage: NativeSendStorage,
  request: NativeTestnetSendRequest,
  key: string,
  now: number,
  onApprovalRequest?: () => void,
): Promise<Awaited<ReturnType<BeldexWeb3['sendTransaction']>>> {
  // A previous ambiguous transaction is a hard stop even if the UI is reset.
  if (readTransferLock(storage)) throw new Error('Previous testnet send is still unresolved')
  if (request.expectedNetwork !== 'testnet') throw new Error('Mainnet sends are blocked')
  const [details, address] = await Promise.all([wallet.getNetwork(), wallet.getAddress()])
  if (details.nettype !== 'testnet' || address !== request.expectedAddress) {
    throw new Error('Wallet testnet or account changed before sending')
  }
  const balance = await wallet.getBalance()
  assertCapabilityOperation('wallet-bdx-testnet-send', 'native-testnet-send', {
    network: details.nettype, walletConnected: true, unlockedAtomic: balance.unlocked,
    approximateBalance: balance.approximate,
  })
  if (balance.approximate) throw new Error('Wait for a fully synced wallet balance before sending')
  const { atomic, to } = validateTestnetSend(details.nettype, request.recipient, request.displayAmount, balance.unlocked)
  // Write persistent lock BEFORE invoking the wallet. Storage failure must
  // prohibit the transfer. No automatic resend on an uncertain outcome.
  saveTransferLock(storage, key, now)
  onApprovalRequest?.()
  return wallet.sendTransaction({ to, amount: atomic, priority: 1, idempotencyKey: key })
}
