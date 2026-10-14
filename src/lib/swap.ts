import { type Asset, priceOf, validAmount } from './markets'
export const SWAP_FEE_BPS = 30
export type SwapQuote = { amountOut: number; minOut: number; feeUsd: number; priceImpactPct: number; effectiveRate: number }
export function quoteSwap(from: Asset, to: Asset, amount: number, slippagePct = 0.5): SwapQuote {
  if (from === to) throw new Error('Choose different assets')
  if (!validAmount(amount)) throw new Error('Enter an amount greater than zero')
  if (!Number.isFinite(slippagePct) || slippagePct < 0 || slippagePct > 50) throw new Error('Invalid slippage')
  // Constant-product AMM demonstration with $500k notional liquidity on each side.
  // These are hypothetical reserves, not real on-chain pools.
  const reserveUsd = 500_000
  const reserveIn = reserveUsd / priceOf(from)
  const reserveOut = reserveUsd / priceOf(to)
  const effectiveIn = amount * (1 - SWAP_FEE_BPS / 10_000)
  const amountOut = reserveOut * effectiveIn / (reserveIn + effectiveIn)
  const idealOut = effectiveIn * priceOf(from) / priceOf(to)
  if (!Number.isFinite(amountOut) || amountOut <= 0) throw new Error('Amount exceeds simulator precision')
  return {
    amountOut, minOut: amountOut * (1 - slippagePct / 100),
    feeUsd: amount * priceOf(from) * SWAP_FEE_BPS / 10_000,
    priceImpactPct: Math.max(0, (1 - amountOut / idealOut) * 100),
    effectiveRate: amountOut / amount,
  }
}
