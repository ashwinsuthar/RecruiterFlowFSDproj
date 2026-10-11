import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { expenseDeleted } from '../features/expenses/expensesSlice';
import { calculateBalances, formatPaise, splitLabel } from '../logic/money';

const filters = ['All categories', 'Food', 'Travel', 'Stay', 'Activities', 'Other'];
function locationNotice(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null || !('notice' in value)) return undefined;
  return typeof value.notice === 'string' ? value.notice : undefined;
}

export function ExpensesPage(): ReactElement {
  const { members, expenses } = useAppSelector(state => state.trip);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [filter, setFilter] = useState('All categories');
  const notice = locationNotice(location.state);
  const balances = calculateBalances(members, expenses);
  const shownExpenses = useMemo(() => expenses.filter(expense => filter === 'All categories' || expense.category === filter).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)), [expenses, filter]);
  const total = shownExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  function removeExpense(id: string, description: string): void {
    if (window.confirm(`Delete “${description}”? This will update everyone's balances.`)) dispatch(expenseDeleted(id));
  }

  return <div className="page-stack">
    {notice && <div className="notice" role="status"><span aria-hidden="true">✓</span>{notice}</div>}
    <section className="page-heading"><div><div className="section-eyebrow">GOA · FIVE FRIENDS · ONE TRIP</div><h1>Trip expenses</h1><p className="muted">Keep track of what everyone spent and settle up later.</p></div><Link className="button primary" to="/expenses/new">＋ Add expense</Link></section>
    <section className="balance-section"><div className="section-title"><div><h2>Balances</h2><p className="muted">Where everyone stands right now</p></div><span className="balance-note">All balances settle to ₹0</span></div>
      <div className="balance-grid">{members.map(member => { const balance = balances[member.id] ?? 0; return <article className="balance-card" key={member.id}><div className="avatar">{member.name.slice(0, 1)}</div><div className="balance-person"><strong>{member.name}</strong><span className={balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'muted'}>{balance > 0 ? `gets back ${formatPaise(balance)}` : balance < 0 ? `owes ${formatPaise(Math.abs(balance))}` : 'settled up'}</span></div><span className={`balance-indicator ${balance > 0 ? 'up' : balance < 0 ? 'down' : ''}`}>{balance === 0 ? '—' : balance > 0 ? '↗' : '↘'}</span></article>; })}</div>
    </section>
    <section className="expenses-section"><div className="section-title"><div><h2>All expenses <span className="count-pill">{shownExpenses.length}</span></h2><p className="muted">A clear view of every shared spend</p></div><label className="filter-label">Category <select value={filter} onChange={event => setFilter(event.target.value)} aria-label="Filter expenses by category">{filters.map(option => <option key={option}>{option}</option>)}</select></label></div>
      <div className="table-shell"><table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Paid by</th><th className="numeric">Amount</th><th>Split</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
        {shownExpenses.map(expense => <tr key={expense.id}><td className="date-cell">{new Date(`${expense.date}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td><td><strong>{expense.description}</strong></td><td><span className={`category-tag ${expense.category.toLowerCase()}`}>{expense.category}</span></td><td>{members.find(member => member.id === expense.paidBy)?.name ?? 'Unknown'}</td><td className="numeric amount-cell">{formatPaise(expense.amount)}</td><td className="split-cell">{splitLabel(expense)}</td><td><button className="icon-button" aria-label={`Delete ${expense.description}`} onClick={() => removeExpense(expense.id, expense.description)}>×</button></td></tr>)}
      </tbody></table>
      {shownExpenses.length === 0 && <div className="empty-state"><span className="empty-icon">◌</span><h3>{expenses.length === 0 ? 'No expenses yet' : 'No expenses in this category'}</h3><p>{expenses.length === 0 ? 'Add the first expense to start splitting the trip.' : 'Try another category or clear the filter.'}</p>{expenses.length === 0 && <Link className="button primary" to="/expenses/new">Add your first expense</Link>}</div>}
      </div><div className="table-footer"><span>Showing {shownExpenses.length} {shownExpenses.length === 1 ? 'expense' : 'expenses'}</span><strong>Shown total <b>{formatPaise(total)}</b></strong></div>
    </section>
  </div>;
}
