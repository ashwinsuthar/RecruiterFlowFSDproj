import type { ExpenseFormValues, FormErrors, Member, ExpenseSplit } from './types';
import { parseRupeesToPaise } from './money';

export function localDateString(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function validateExpense(values: ExpenseFormValues, members: Member[], today = localDateString()): FormErrors {
  const errors: FormErrors = {};
  const description = values.description.trim();
  if (!description) errors.description = 'Description is required';
  else if (description.length > 60) errors.description = 'Description must be 60 characters or fewer';
  const amount = parseRupeesToPaise(values.amount);
  if (values.amount.trim() === '') errors.amount = 'Amount is required';
  else if (amount === null) errors.amount = 'Use an amount with no more than 2 decimals';
  else if (amount <= 0) errors.amount = 'Amount must be more than ₹0';
  else if (amount > 100000000) errors.amount = 'Amount must be at most ₹10,00,000';
  if (!values.paidBy) errors.paidBy = 'Choose who paid';
  if (!values.date) errors.date = 'Date is required';
  else if (values.date > today) errors.date = 'Date cannot be in the future';
  if (!values.category) errors.category = 'Choose a category';
  if (amount !== null && amount > 0) {
    if (values.splitType === 'equal' && values.selectedMembers.length === 0) errors.selectedMembers = 'Select at least one member';
    if (values.splitType === 'exact') {
      const shares: Record<string, number> = {};
      let invalid = false;
      for (const member of members) {
        const raw = values.shares[member.id] ?? '';
        if (raw === '') continue;
        const share = parseRupeesToPaise(raw);
        if (share === null || share < 0) invalid = true;
        else shares[member.id] = share;
      }
      const diff = amount - Object.values(shares).reduce((sum, value) => sum + value, 0);
      if (invalid) errors.shares = 'Each amount must be ₹0 or more, with up to 2 decimals';
      else if (diff !== 0) errors.shares = `${diff > 0 ? `${formatDifference(diff)} left to assign` : `${formatDifference(-diff)} over`}`;
    }
    if (values.splitType === 'percent') {
      let total = 0;
      let invalid = false;
      for (const member of members) {
        const raw = values.shares[member.id] ?? '';
        if (raw === '') continue;
        if (!/^\d+(\.\d{1,2})?$/.test(raw)) invalid = true;
        else {
          const value = Number(raw);
          if (value < 0 || value > 100) invalid = true;
          total += value;
        }
      }
      if (invalid) errors.shares = 'Each percentage must be between 0 and 100 with up to 2 decimals';
      else if (Math.round(total * 100) !== 10000) errors.shares = `Percentages must total 100% (currently ${total.toFixed(2)}%)`;
    }
  }
  return errors;
}

function formatDifference(paise: number): string { return `₹${(paise / 100).toFixed(2)}`; }

export function buildSplit(values: ExpenseFormValues, members: Member[]): ExpenseSplit {
  if (values.splitType === 'equal') return { type: 'equal', memberIds: values.selectedMembers };
  const shares: Record<string, number> = {};
  for (const member of members) {
    const raw = values.shares[member.id] ?? '';
    if (raw === '') continue;
    if (values.splitType === 'exact') {
      const parsed = parseRupeesToPaise(raw);
      if (parsed !== null) shares[member.id] = parsed;
    } else shares[member.id] = Number(raw);
  }
  return values.splitType === 'exact' ? { type: 'exact', shares } : { type: 'percent', shares };
}
