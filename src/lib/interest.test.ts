import { describe, expect, it } from 'vitest'
import { accrueDemoInterest, projectDemoInterest, MAX_ACCRUAL_MS } from './interest'
import { lendingHealth, type LendingBook } from './lend'

describe('lending demo interest projection', () => {
  const book: LendingBook = { supplied: { USDT: 1000 }, borrowed: { USDT: 500 } }
  it('projects simple annualised interest without mutating positions', () => {
    const original = JSON.stringify(book)
    const result = projectDemoInterest(book, 30)
    expect(result.supplyInterest.USDT).toBeCloseTo(1000 * 0.049 * 30 / 365)
    expect(result.borrowInterest.USDT).toBeCloseTo(500 * 0.072 * 30 / 365)
    expect(result.book.supplied.USDT).toBeGreaterThan(1000)
    expect(result.book.borrowed.USDT).toBeGreaterThan(500)
    expect(JSON.stringify(book)).toBe(original)
    expect(result.healthFactor).toBeCloseTo(lendingHealth(result.book).healthFactor)
  })
  it('keeps zero time and empty books unchanged', () => {
    const result = accrueDemoInterest(book, 0)
    expect(result.book.supplied.USDT).toBe(1000)
    expect(result.book.borrowed.USDT).toBe(500)
    expect(projectDemoInterest({ supplied: {}, borrowed: {} }, 30).healthFactor).toBe(Infinity)
  })
  it('rejects malicious, invalid and stale-state time windows', () => {
    for (const ms of [-1, Infinity, NaN, MAX_ACCRUAL_MS + 1]) {
      expect(() => accrueDemoInterest(book, ms)).toThrow()
    }
    expect(() => projectDemoInterest(book, 31)).toThrow()
  })
  it('rejects corrupt lending ledgers', () => {
    expect(() => projectDemoInterest({ supplied: { BDX: -1 }, borrowed: {} }, 1)).toThrow()
    expect(() => projectDemoInterest({ supplied: {}, borrowed: { ETH: Infinity } }, 1)).toThrow()
  })
})
