import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Expense, TripState } from '../../logic/types';
import { members, sampleExpenses } from '../../data/sampleData';

const STORAGE_KEY = 'goa-trip-splitter-v1';
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}
function isTripState(value: unknown): value is TripState {
  if (typeof value !== 'object' || value === null) return false;
  if (!('members' in value) || !('expenses' in value)) return false;
  const membersValue = value.members;
  const expensesValue = value.expenses;
  const validMembers = Array.isArray(membersValue) && membersValue.every((member: unknown) => isRecord(member) && typeof member.id === 'string' && typeof member.name === 'string');
  const validExpenses = Array.isArray(expensesValue) && expensesValue.every((expense: unknown) => {
    if (!isRecord(expense) || typeof expense.id !== 'string' || typeof expense.description !== 'string'
      || typeof expense.amount !== 'number' || !Number.isSafeInteger(expense.amount) || typeof expense.paidBy !== 'string'
      || typeof expense.date !== 'string' || typeof expense.category !== 'string' || !isRecord(expense.split)) return false;
    if (expense.split.type === 'equal') return isStringArray(expense.split.memberIds);
    if (expense.split.type !== 'exact' && expense.split.type !== 'percent') return false;
    return isRecord(expense.split.shares) && Object.values(expense.split.shares).every(share => typeof share === 'number' && Number.isFinite(share) && share >= 0);
  });
  return validMembers && validExpenses;
}
function loadState(): TripState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (isTripState(parsed)) return parsed;
    }
  } catch { /* Corrupt or unavailable storage falls back to the brief's sample data. */ }
  return { members, expenses: sampleExpenses };
}

const expensesSlice = createSlice({
  name: 'trip',
  initialState: loadState(),
  reducers: {
    expenseAdded(state, action: PayloadAction<Expense>) { state.expenses.push(action.payload); },
    expenseDeleted(state, action: PayloadAction<string>) { state.expenses = state.expenses.filter(expense => expense.id !== action.payload); },
  },
});

export const { expenseAdded, expenseDeleted } = expensesSlice.actions;
export default expensesSlice.reducer;
