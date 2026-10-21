/**
 * Publicly documented Beldex dApp bridge v1 methods.
 * SDK: https://github.com/Beldex-Coin/bdx-web3js/docs/PROTOCOL.md
 *
 * The wallet's internal get_token_balances requires a secret view_key; it is
 * NOT a safe browser dApp API. Never proxy it through HOXO or request that key.
 */
export const PUBLISHED_DAPP_V1_METHODS = Object.freeze([
  'bdx_connect', 'bdx_disconnect', 'bdx_getAddress', 'bdx_getBalance',
  'bdx_sendTransaction', 'bdx_getOperationStatus', 'bdx_signMessage',
  'bdx_signAuthChallenge', 'bdx_verifyMessage', 'bdx_resolveBns',
  'bdx_getNetwork', 'bdx_getState',
] as const)
export type PrivateAssetMethodReadiness = Readonly<{
  walletDappProtocol: 'v1'
  nativeBdx: true
  publicAssetMetadata: true
  privateAssetBalance: false
  privateAssetTransfer: false
  privateAssetIssuance: false
  requiredIntegration: string
}>
/** Locked to documented v1, not a speculative provider property. */
export function privateAssetMethodReadiness(): PrivateAssetMethodReadiness {
  return Object.freeze({
    walletDappProtocol: 'v1',
    nativeBdx: true,
    publicAssetMetadata: true,
    privateAssetBalance: false,
    privateAssetTransfer: false,
    privateAssetIssuance: false,
    requiredIntegration: 'Beldex must publish reviewed, origin-authorised dApp asset-balance, send and issue methods. Never expose the view key to HOXO.',
  })
}
export function refusePrivateAssetBalanceRead(): never {
  throw new Error('No approved Beldex dApp Privacy Token balance method exists; do not request view keys')
}
