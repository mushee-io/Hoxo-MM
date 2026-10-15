import { checkAddress } from '@bdxi/web3js'

/**
 * One-time, wallet-approved local ownership challenge. NOT a login token.
 * Production server authentication MUST use a server-issued nonce with
 * connectWithProof() and atomically consume it at verification.
 */
export function buildTestnetWalletProof(address: string, nonce: string, now: number): string {
  if (!checkAddress(address).valid) throw new Error('Invalid wallet address')
  if (!/^[0-9a-f-]{36}$/.test(nonce)) throw new Error('Invalid challenge')
  if (!Number.isSafeInteger(now) || now <= 0) throw new Error('Invalid signing time')
  const payload = 'hoxo-testnet-proof-v1 wallet=' + address + ' nonce=' + nonce + ' issued=' + now
  if (payload.length > 512) throw new Error('Wallet signing limit exceeded')
  return payload
}
export type VerifiedLocalProof = {
  message: string
  signature: string
  address: string
  verified: boolean
}
/** Provider-side signature verification does not prove a live chain payment. */
export function assertProofResponse(proof: VerifiedLocalProof): void {
  if (!proof.verified || !proof.message.includes('wallet=' + proof.address + ' ') || !proof.message.startsWith('hoxo-testnet-proof-v1 ')) {
    throw new Error('Signature or wallet owner verification failed')
  }
}
