import { type Asset, assetSymbols, priceOf, validAmount } from './markets'
import { executeDemoSwap, quoteSwap, type PoolBook, type SwapQuote } from './swap'
import { type WalletBalances } from './lend'

/**
 * Milestone 5: offline multi-hop routing research prototype.
 * Not an on-chain bridge, aggregator, market maker, exchange, or executable quote.
 */
export const CHAINS = {
  'beldex-testnet': { label: 'Beldex testnet', transparent: false, integration: 'wallet-readonly' },
  'bsc': { label: 'BNB Smart Chain', transparent: true, integration: 'not-connected' },
  'ethereum': { label: 'Ethereum', transparent: true, integration: 'not-connected' },
  'base': { label: 'Base', transparent: true, integration: 'not-connected' },
} as const
export type ChainId = keyof typeof CHAINS
export type IntegrationStatus = typeof CHAINS[ChainId]['integration']
export const ROUTE_TTL_MS = 30_000
export const MAX_DEMO_TRADE_USD = 10_000

export type RoutePlan = {
  id: 'direct' | 'via-usdt'
  path: Asset[]
  legs: SwapQuote[]
  source: ChainId
  destination: ChainId
  amountIn: number
  estimatedOut: number
  minOut: number
  expiresAt: number
  execution: 'demo-only' | 'unavailable'
  warning: string
}
function assertChain(chain: ChainId) {
  if (!Object.prototype.hasOwnProperty.call(CHAINS, chain)) throw new Error('Unsupported network')
}
function calculatePath(path: Asset[], amount: number, pools: PoolBook): { legs: SwapQuote[]; estimatedOut: number } {
  const legs: SwapQuote[] = []
  let output = amount
  for (let i = 1; i < path.length; i++) {
    const quote = quoteSwap(path[i - 1], path[i], output, 0, pools)
    legs.push(quote)
    output = quote.amountOut
  }
  return { legs, estimatedOut: output }
}
export function findDemoRoutes(
  from: Asset,
  to: Asset,
  amount: number,
  slippagePct: number,
  pools: PoolBook,
  source: ChainId = 'beldex-testnet',
  destination: ChainId = 'beldex-testnet',
  now = Date.now(),
): RoutePlan[] {
  assertChain(source); assertChain(destination)
  if (!assetSymbols.includes(from) || !assetSymbols.includes(to) || from === to) throw new Error('Select two different supported assets')
  if (!validAmount(amount) || !validAmount(priceOf(from) * amount)) throw new Error('Invalid amount')
  if (!Number.isFinite(slippagePct) || slippagePct < 0 || slippagePct > 50) throw new Error('Invalid slippage')
  if (!Number.isSafeInteger(now) || now < 0) throw new Error('Invalid quote time')
  if (amount * priceOf(from) > MAX_DEMO_TRADE_USD) throw new Error('Demo routing cap exceeded ($10,000)')
  // Cross-chain quotes are explicitly unavailable until an adapter and bridge
  // have been integrated, audited and tested; never fabricate an FX route.
  if (source !== 'beldex-testnet' || destination !== 'beldex-testnet') return []
  const choices: { id: RoutePlan['id']; path: Asset[] }[] = [{ id: 'direct', path: [from, to] }]
  if (from !== 'USDT' && to !== 'USDT') choices.push({ id: 'via-usdt', path: [from, 'USDT', to] })
  return choices.map(({ id, path }) => {
    const result = calculatePath(path, amount, pools)
    return {
      id, path, legs: result.legs, source, destination, amountIn: amount,
      estimatedOut: result.estimatedOut,
      minOut: result.estimatedOut * (1 - slippagePct / 100),
      expiresAt: now + ROUTE_TTL_MS,
      execution: 'demo-only' as const,
      warning: 'Local simulated reserves; not real liquidity or a blockchain transaction',
    }
  }).sort((a, b) => b.estimatedOut - a.estimatedOut)
}
export function executeDemoRoute(
  route: RoutePlan,
  balances: WalletBalances,
  pools: PoolBook,
  now = Date.now(),
): { balances: WalletBalances; pools: PoolBook; amountOut: number } {
  assertChain(route.source); assertChain(route.destination)
  if (route.execution !== 'demo-only' || route.source !== 'beldex-testnet' || route.destination !== 'beldex-testnet') {
    throw new Error('Cross-chain execution is not available')
  }
  if (!Number.isSafeInteger(now) || !Number.isSafeInteger(route.expiresAt) || now > route.expiresAt ||
      now < route.expiresAt - ROUTE_TTL_MS) throw new Error('Quote expired or invalid')
  if (!validAmount(route.amountIn) || route.amountIn * priceOf(route.path[0]) > MAX_DEMO_TRADE_USD ||
      !validAmount(route.minOut)) throw new Error('Invalid or oversized route')
  if (route.path.length < 2 || route.path.length > 3 || route.path[0] === route.path[route.path.length - 1] ||
      (route.path.length === 3 && route.path[1] !== 'USDT')) throw new Error('Unsupported route')
  if (route.id === 'direct' && route.path.length !== 2 || route.id === 'via-usdt' && route.path.length !== 3) throw new Error('Route metadata mismatch')
  // Pure state transitions: any failing second leg throws before the caller
  // gets an updated state, so no partial local settlement is persisted.
  let currentBalances = balances
  let currentPools = pools
  let amount = route.amountIn
  for (let i = 1; i < route.path.length; i++) {
    const last = i === route.path.length - 1
    const trade = executeDemoSwap(currentBalances, currentPools, route.path[i - 1], route.path[i], amount, last ? route.minOut : Number.MIN_VALUE)
    currentBalances = trade.balances
    currentPools = trade.pools
    amount = trade.quote.amountOut
  }
  return { balances: currentBalances, pools: currentPools, amountOut: amount }
}
