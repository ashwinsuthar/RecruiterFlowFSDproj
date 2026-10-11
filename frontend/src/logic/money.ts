import type { Expense, Member } from './types';

export function parseRupeesToPaise(value: string): number | null {
  const trimmed = value.trim();
  if (!/^-?\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const negative = trimmed.startsWith('-');
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [rupees = '0', fraction = ''] = unsigned.split('.');
  const paise = Number(rupees) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(paise) ? (negative ? -paise : paise) : null;
}

export function formatPaise(paise: number): string {
  const rupees = Math.floor(Math.abs(paise) / 100);
  const cents = String(Math.abs(paise) % 100).padStart(2, '0');
  return `${paise < 0 ? '-' : ''}₹${new Intl.NumberFormat('en-IN').format(rupees)}.${cents}`;
}

export function allocateEqual(amount: number, memberIds: string[]): Record<string, number> {
  if (memberIds.length === 0) return {};
  const base = Math.floor(amount / memberIds.length);
  const remainder = amount % memberIds.length;
  return Object.fromEntries(memberIds.map((id, index) => [id, base + (index < remainder ? 1 : 0)]));
}

export function allocateByWeights(amount: number, weights: Record<string, number>): Record<string, number> {
  const entries = Object.entries(weights).filter(([, weight]) => weight > 0);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (total <= 0) return {};
  const allocations = entries.map(([id, weight]) => {
    const exact = amount * weight / total;
    return { id, floor: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  const penniesLeft = amount - allocations.reduce((sum, item) => sum + item.floor, 0);
  const priority = [...allocations].sort((a, b) => b.remainder - a.remainder || a.id.localeCompare(b.id));
  const extra = new Set(priority.slice(0, penniesLeft).map(item => item.id));
  return Object.fromEntries(allocations.map(item => [item.id, item.floor + (extra.has(item.id) ? 1 : 0)]));
}

export function expenseShares(expense: Expense): Record<string, number> {
  if (expense.split.type === 'equal') return allocateEqual(expense.amount, expense.split.memberIds);
  if (expense.split.type === 'exact') return expense.split.shares;
  return allocateByWeights(expense.amount, expense.split.shares);
}

export function calculateBalances(members: Member[], expenses: Expense[]): Record<string, number> {
  const balances = Object.fromEntries(members.map(member => [member.id, 0]));
  for (const expense of expenses) {
    balances[expense.paidBy] = (balances[expense.paidBy] ?? 0) + expense.amount;
    for (const [memberId, share] of Object.entries(expenseShares(expense))) {
      balances[memberId] = (balances[memberId] ?? 0) - share;
    }
  }
  return balances;
}

export function splitLabel(expense: Expense): string {
  if (expense.split.type === 'equal') return `Equally, ${expense.split.memberIds.length} ${expense.split.memberIds.length === 1 ? 'person' : 'people'}`;
  const count = Object.keys(expense.split.shares).length;
  return `${expense.split.type === 'exact' ? 'Exact amounts' : 'Percentages'}, ${count} ${count === 1 ? 'person' : 'people'}`;
}
