import { assetSymbols, priceOf, validAmount, type Asset } from './markets'

export const SWAP_FEE_BPS = 30
export const INITIAL_POOL_RESERVE_USD = 500_000
export type Pool = { reserveA: number; reserveB: number }
export type PoolBook = Record<string, Pool>
export type SwapQuote = {
  amountOut: number
  minOut: number
  feeUsd: number
  priceImpactPct: number
  effectiveRate: number
}

/**
 * Demo-only constant-product pools. They are browser-local reserves, not
 * Beldex liquidity, custody, AMM contracts or executable market quotes.
 */
export function pairKey(a: Asset, b: Asset): string {
  if (a === b || !assetSymbols.includes(a) || !assetSymbols.includes(b)) throw new Error('Invalid token pair')
  return [a, b].sort().join('/')
}

export function initialDemoPools(): PoolBook {
  const pools: PoolBook = {}
  for (let i = 0; i < assetSymbols.length; i++) {
    for (let j = i + 1; j < assetSymbols.length; j++) {
      const [a, b] = [assetSymbols[i], assetSymbols[j]].sort() as [Asset, Asset]
      pools[pairKey(a, b)] = {
        reserveA: INITIAL_POOL_RESERVE_USD / priceOf(a),
        reserveB: INITIAL_POOL_RESERVE_USD / priceOf(b),
      }
    }
  }
  return pools
}

function reservesFor(pools: PoolBook, from: Asset, to: Asset) {
  const key = pairKey(from, to)
  const pool = pools[key]
  if (!pool || ![pool.reserveA, pool.reserveB].every(validAmount)) throw new Error('Demo pool unavailable or invalid')
  const inputIsA = from < to
  return { key, pool, inputIsA, reserveIn: inputIsA ? pool.reserveA : pool.reserveB, reserveOut: inputIsA ? pool.reserveB : pool.reserveA }
}

export function quoteSwap(from: Asset, to: Asset, amount: number, slippagePct = 0.5, pools: PoolBook = initialDemoPools()): SwapQuote {
  if (!validAmount(amount)) throw new Error('Enter an amount greater than zero')
  if (!Number.isFinite(slippagePct) || slippagePct < 0 || slippagePct > 50) throw new Error('Invalid slippage')
  const { reserveIn, reserveOut } = reservesFor(pools, from, to)
  const effectiveIn = amount * (1 - SWAP_FEE_BPS / 10_000)
  const amountOut = reserveOut * effectiveIn / (reserveIn + effectiveIn)
  const idealOut = effectiveIn * reserveOut / reserveIn
  if (![effectiveIn, amountOut, idealOut].every(validAmount) || amountOut >= reserveOut) {
    throw new Error('Amount exceeds simulator precision')
  }
  return {
    amountOut,
    minOut: amountOut * (1 - slippagePct / 100),
    feeUsd: amount * priceOf(from) * SWAP_FEE_BPS / 10_000,
    priceImpactPct: Math.max(0, (1 - amountOut / idealOut) * 100),
    effectiveRate: amountOut / amount,
  }
}

export function executeDemoSwap(
  balances: Record<Asset, number>,
  pools: PoolBook,
  from: Asset,
  to: Asset,
  amount: number,
  minOut: number,
): { balances: Record<Asset, number>; pools: PoolBook; quote: SwapQuote } {
  if (!validAmount(amount) || !Number.isFinite(minOut) || minOut <= 0) throw new Error('Invalid trade amount or minimum output')
  if (Object.values(balances).some(value => !Number.isFinite(value) || value < 0)) throw new Error('Demo balance is invalid')
  if (amount > balances[from]) throw new Error('Insufficient demo balance')
  const quote = quoteSwap(from, to, amount, 0, pools)
  if (quote.amountOut + 1e-12 < minOut) throw new Error('Quote expired or price moved beyond slippage. Review trade.')
  const { key, inputIsA, reserveIn, reserveOut } = reservesFor(pools, from, to)
  const nextIn = reserveIn + amount
  const nextOut = reserveOut - quote.amountOut
  if (![nextIn, nextOut].every(validAmount)) throw new Error('Insufficient simulator liquidity')
  return {
    balances: { ...balances, [from]: balances[from] - amount, [to]: balances[to] + quote.amountOut },
    pools: { ...pools, [key]: inputIsA ? { reserveA: nextIn, reserveB: nextOut } : { reserveA: nextOut, reserveB: nextIn } },
    quote,
  }
}
