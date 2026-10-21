/** The production UI imports no fictional balances, prices or settlement engines. */
export const LIVE_PAGES = [
  'Overview', 'Testnet', 'Swap', 'Perps', 'Lend',
  'Routes', 'Portfolio', 'Security', 'Launch',
] as const
export type LivePage = typeof LIVE_PAGES[number]
export const LIVE_PRODUCT_CAPABILITIES = Object.freeze({
  Swap: { title: 'Swap', active: false, requirement: 'Beldex private-token wallet sends, real liquidity and reviewed two-sided settlement are unavailable.' },
  Perps: { title: 'Perpetuals', active: false, requirement: 'No Beldex margin escrow, independent live oracle, liquidation engine or enforceable perps settlement is connected.' },
  Lend: { title: 'Lending', active: false, requirement: 'No enforceable custody, debt accounting, borrower collateral or liquidation service is connected.' },
  Routes: { title: 'Cross-chain routes', active: false, requirement: 'No verified Beldex-to-external-chain bridge contracts, relayers or reconciled refund path are connected.' },
} as const)
export function livePageForPath(pathname: string): LivePage | null {
  const value = pathname.replace(/\/+$/, '') || '/'
  if (value === '/') return null
  if (value === '/app') return 'Overview'
  if (!value.startsWith('/app/')) return null
  const slug = value.slice('/app/'.length).toLowerCase()
  return LIVE_PAGES.find(page => page.toLowerCase() === slug) ?? 'Overview'
}
