export interface Member { id: string; name: string }
export type Category = 'Food' | 'Travel' | 'Stay' | 'Activities' | 'Other';
export type ExpenseSplit =
  | { type: 'equal'; memberIds: string[] }
  | { type: 'exact'; shares: Record<string, number> }
  | { type: 'percent'; shares: Record<string, number> };
export interface Expense { id: string; description: string; amount: number; paidBy: string; date: string; category: Category; split: ExpenseSplit }
export interface TripState { members: Member[]; expenses: Expense[] }
export type SplitMode = 'equal' | 'exact' | 'percent';
export interface ExpenseFormValues { description: string; amount: string; paidBy: string; date: string; category: string; splitType: SplitMode; selectedMembers: string[]; shares: Record<string, string> }
export type FormErrors = Partial<Record<keyof ExpenseFormValues, string>>;
