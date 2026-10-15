import { priceOf } from './markets'

/**
 * M6 hypothetical protocol economics. USD amounts here are LOCAL DEMO VALUES.
 * No fees, treasury assets or BDX have ever been received or burned by HOXO.
 */
export const ECONOMICS = Object.freeze({
  protocolShareOfPoolFees: 0.10,
  buybackShareOfProtocolFees: 0.25,
  securityReserveShareOfProtocolFees: 0.50,
  operationsShareOfProtocolFees: 0.25,
})
export function estimateDemoEconomics(totalPoolFeesUsd: number) {
  if (!Number.isFinite(totalPoolFeesUsd) || totalPoolFeesUsd < 0) throw new Error('Invalid example pool fees')
  const protocolRevenueUsd = totalPoolFeesUsd * ECONOMICS.protocolShareOfPoolFees
  const liquidityProviderFeesUsd = totalPoolFeesUsd - protocolRevenueUsd
  const proposedBuybackUsd = protocolRevenueUsd * ECONOMICS.buybackShareOfProtocolFees
  const securityReserveUsd = protocolRevenueUsd * ECONOMICS.securityReserveShareOfProtocolFees
  const operationsUsd = protocolRevenueUsd * ECONOMICS.operationsShareOfProtocolFees
  if (![protocolRevenueUsd, liquidityProviderFeesUsd, proposedBuybackUsd, securityReserveUsd, operationsUsd].every(Number.isFinite)) {
    throw new Error('Financial precision limit reached')
  }
  return {
    poolFeesUsd: totalPoolFeesUsd,
    liquidityProviderFeesUsd,
    protocolRevenueUsd,
    proposedBuybackUsd,
    securityReserveUsd,
    operationsUsd,
    illustrativeBdxEquivalent: proposedBuybackUsd / priceOf('BDX'),
    status: 'illustrative-not-executed' as const,
  }
}
