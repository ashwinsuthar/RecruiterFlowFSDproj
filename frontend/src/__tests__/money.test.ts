import { describe, expect, it } from 'vitest';
import { allocateEqual, calculateBalances, expenseShares } from '../logic/money';
import type { Expense } from '../logic/types';

describe('trip money logic', () => {
  it('distributes the extra paise deterministically for an equal split', () => {
    expect(allocateEqual(10000, ['m1', 'm2', 'm3'])).toEqual({ m1: 3334, m2: 3333, m3: 3333 });
  });
  it('keeps percentage allocations in integer paise and reconciled', () => {
    const expense: Expense = { id: 'p', description: 'cab', amount: 149999, paidBy: 'm1', date: '2026-03-15', category: 'Travel', split: { type: 'percent', shares: { m1: 33.33, m2: 33.33, m3: 33.34 } } };
    expect(Object.values(expenseShares(expense)).reduce((sum, value) => sum + value, 0)).toBe(149999);
  });
  it('calculates balances that sum to exactly zero', () => {
    const expense: Expense = { id: 'e', description: 'Dinner', amount: 10000, paidBy: 'a', date: '2026-03-15', category: 'Food', split: { type: 'equal', memberIds: ['a', 'b', 'c'] } };
    const balances = calculateBalances([{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }], [expense]);
    expect(Object.values(balances).reduce((sum, value) => sum + value, 0)).toBe(0);
    expect(balances).toEqual({ a: 6666, b: -3333, c: -3333 });
  });
});
