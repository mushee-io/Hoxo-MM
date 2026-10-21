import { assertResearchPrice, researchPerpsRisk, type ResearchPrice } from './riskResearch'

/**
 * M18 RESEARCH CLEARINGHOUSE — virtual USD E8 ledger, no signing or custody.
 * Two opposing, equal-size paper positions provide deterministic zero-sum P&L.
 * This is deliberately NOT a real derivatives matcher / settlement engine.
 */
export type PaperSide = 'long' | 'short'
export type PaperPosition = Readonly<{
  id: string; owner: string; pairId: string; side: PaperSide
  marginUsdE8: bigint; notionalUsdE8: bigint
  entry: ResearchPrice; leverage: number
}>
export type PaperAccount = Readonly<{ availableUsdE8: bigint; realisedPnlUsdE8: bigint; fundingUsdE8: bigint }>
export type PaperClearing = Readonly<{
  balances: Readonly<Record<string, PaperAccount>>
  positions: readonly PaperPosition[]
  injectedUsdE8: bigint
  fundingTransfersUsdE8: bigint
  settlement: 'simulated-only'
}>
const ZERO = { availableUsdE8: 0n, realisedPnlUsdE8: 0n, fundingUsdE8: 0n } as const
const OWNER = /^[a-zA-Z0-9._-]{3,64}$/
const ID = /^[a-zA-Z0-9._-]{8,64}$/
const validMoney = (v: bigint) => typeof v === 'bigint' && v >= 0n
function demand(condition: boolean, label: string): void { if (!condition) throw new Error('Paper clearing: '+label) }

export function emptyPaperClearing(): PaperClearing {
  return { balances: {}, positions: [], injectedUsdE8: 0n, fundingTransfersUsdE8: 0n, settlement: 'simulated-only' }
}
export function assertPaperClearingInvariant(book: PaperClearing): void {
  demand(book.settlement === 'simulated-only', 'not a virtual research book')
  let available = 0n, margin = 0n
  for (const [owner, account] of Object.entries(book.balances)) {
    demand(OWNER.test(owner) && validMoney(account.availableUsdE8) &&
      typeof account.realisedPnlUsdE8 === 'bigint' && typeof account.fundingUsdE8 === 'bigint',
      'corrupt paper account')
    available += account.availableUsdE8
  }
  const ids = new Set<string>()
  const pairs = new Map<string, PaperPosition[]>()
  for (const position of book.positions) {
    demand(OWNER.test(position.owner) && ID.test(position.id) && ID.test(position.pairId) &&
      !ids.has(position.id) && (position.side === 'long' || position.side === 'short') &&
      validMoney(position.marginUsdE8) && position.marginUsdE8 > 0n &&
      validMoney(position.notionalUsdE8) && position.notionalUsdE8 > 0n &&
      Number.isInteger(position.leverage) && position.leverage >= 1 && position.leverage <= 10 &&
      position.notionalUsdE8 === position.marginUsdE8 * BigInt(position.leverage),
      'corrupt paper position')
    ids.add(position.id)
    const entries = pairs.get(position.pairId) ?? []
    entries.push(position)
    pairs.set(position.pairId, entries)
    margin += position.marginUsdE8
  }
  for (const pair of pairs.values()) {
    demand(pair.length === 2 && pair[0].side !== pair[1].side &&
      pair[0].owner !== pair[1].owner &&
      pair[0].notionalUsdE8 === pair[1].notionalUsdE8 &&
      pair[0].entry.priceUsdE8 === pair[1].entry.priceUsdE8,
      'research position is not matched')
  }
  demand(validMoney(book.injectedUsdE8) && validMoney(book.fundingTransfersUsdE8) &&
    available + margin === book.injectedUsdE8, 'balance conservation failed')
}
export function fundPaperAccount(book: PaperClearing, owner: string, amountUsdE8: bigint): PaperClearing {
  assertPaperClearingInvariant(book)
  demand(OWNER.test(owner) && validMoney(amountUsdE8) && amountUsdE8 > 0n,'invalid paper funding amount or owner')
  const prior = book.balances[owner] ?? ZERO
  const next = { ...book, balances: { ...book.balances,
    [owner]: { ...prior, availableUsdE8: prior.availableUsdE8 + amountUsdE8 } },
    injectedUsdE8: book.injectedUsdE8 + amountUsdE8 }
  assertPaperClearingInvariant(next)
  return next
}
export function openMatchedPaperPerps(
  book: PaperClearing, longOwner: string, shortOwner: string, pairId: string,
  marginUsdE8: bigint, leverage: number, entry: ResearchPrice, now: number
): PaperClearing {
  assertPaperClearingInvariant(book); assertResearchPrice(entry, now)
  demand(OWNER.test(longOwner) && OWNER.test(shortOwner) && longOwner !== shortOwner &&
    ID.test(pairId) && validMoney(marginUsdE8) && marginUsdE8 > 0n &&
    Number.isInteger(leverage) && leverage >= 1 && leverage <= 10 &&
    !book.positions.some(p => p.pairId === pairId), 'invalid or duplicate matched paper order')
  const a = book.balances[longOwner], b = book.balances[shortOwner]
  demand(!!a && !!b && a.availableUsdE8 >= marginUsdE8 && b.availableUsdE8 >= marginUsdE8,
    'insufficient simulated margin')
  const createPosition = (owner: string, side: PaperSide): PaperPosition =>
    ({ id: pairId + '-' + side, pairId, owner, side, entry, leverage, marginUsdE8,
      notionalUsdE8: marginUsdE8 * BigInt(leverage) })
  const next: PaperClearing = { ...book, balances: {
    ...book.balances,
    [longOwner]: { ...a, availableUsdE8: a.availableUsdE8 - marginUsdE8 },
    [shortOwner]: { ...b, availableUsdE8: b.availableUsdE8 - marginUsdE8 },
  }, positions: [...book.positions, createPosition(longOwner, 'long'), createPosition(shortOwner, 'short')] }
  assertPaperClearingInvariant(next)
  return next
}
/** Funding transfers between fictional accounts, never mints or spends money. */
export function applyPaperFunding(book: PaperClearing, pairId: string, fundingBps: number): PaperClearing {
  assertPaperClearingInvariant(book)
  demand(Number.isInteger(fundingBps) && Math.abs(fundingBps) <= 100 &&
    fundingBps !== 0, 'invalid funding rate')
  const pair = book.positions.filter(p => p.pairId === pairId)
  demand(pair.length === 2, 'unknown paired position')
  const amount = pair[0].notionalUsdE8 * BigInt(Math.abs(fundingBps)) / 10000n
  const payer = pair.find(p => p.side === (fundingBps > 0 ? 'long' : 'short'))!
  const receiver = pair.find(p => p.owner !== payer.owner)!
  const debit = book.balances[payer.owner], credit = book.balances[receiver.owner]
  demand(debit.availableUsdE8 >= amount, 'insufficient free paper funding cash')
  const next: PaperClearing = { ...book, balances: { ...book.balances,
    [payer.owner]: { ...debit, availableUsdE8: debit.availableUsdE8 - amount,
      fundingUsdE8: debit.fundingUsdE8 - amount },
    [receiver.owner]: { ...credit, availableUsdE8: credit.availableUsdE8 + amount,
      fundingUsdE8: credit.fundingUsdE8 + amount },
  }, fundingTransfersUsdE8: book.fundingTransfersUsdE8 + amount }
  assertPaperClearingInvariant(next)
  return next
}
/** Both fictional accounts close together. Refuses bankrupt shortfalls; no pretend insurance. */
export function closeMatchedPaperPerps(
  book: PaperClearing, pairId: string, mark: ResearchPrice, now: number, maintenanceBps = 250,
): PaperClearing {
  assertPaperClearingInvariant(book); assertResearchPrice(mark, now)
  const pair = book.positions.filter(p => p.pairId === pairId)
  demand(pair.length === 2, 'unknown matched paper position')
  const long = pair.find(p => p.side === 'long')!
  const short = pair.find(p => p.side === 'short')!
  const longRisk = researchPerpsRisk({ marginUsdE8: long.marginUsdE8, leverage: long.leverage,
    side: 'long', entry: long.entry, mark, maintenanceBps },now)
  const shortRisk = researchPerpsRisk({ marginUsdE8: short.marginUsdE8, leverage: short.leverage,
    side: 'short', entry: short.entry, mark, maintenanceBps },now)
  demand(longRisk.pnlUsdE8 + shortRisk.pnlUsdE8 === 0n, 'non-zero-sum P&L')
  demand(longRisk.equityUsdE8 >= 0n && shortRisk.equityUsdE8 >= 0n,
    'bankruptcy: no insurance or backstop deployed')
  const lhs = book.balances[long.owner], rhs = book.balances[short.owner]
  const next: PaperClearing = { ...book, balances: { ...book.balances,
    [long.owner]: { ...lhs, availableUsdE8: lhs.availableUsdE8 + longRisk.equityUsdE8,
      realisedPnlUsdE8: lhs.realisedPnlUsdE8 + longRisk.pnlUsdE8 },
    [short.owner]: { ...rhs, availableUsdE8: rhs.availableUsdE8 + shortRisk.equityUsdE8,
      realisedPnlUsdE8: rhs.realisedPnlUsdE8 + shortRisk.pnlUsdE8 },
  }, positions: book.positions.filter(p => p.pairId !== pairId) }
  assertPaperClearingInvariant(next)
  return next
}
export function refusePaperPerpsSettlement(): never {
  throw new Error('Paper perpetuals have no real margin escrow, matching or liquidation settlement')
}
