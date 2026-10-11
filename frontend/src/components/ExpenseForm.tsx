import { useState, type FormEvent } from 'react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { expenseAdded } from '../features/expenses/expensesSlice';
import { buildSplit, validateExpense } from '../logic/validation';
import { parseRupeesToPaise } from '../logic/money';
import type { Category, ExpenseFormValues, FormErrors, SplitMode } from '../logic/types';

const blankValues: ExpenseFormValues = { description: '', amount: '', paidBy: '', date: '', category: '', splitType: 'equal', selectedMembers: [], shares: {} };
const categories = ['Food', 'Travel', 'Stay', 'Activities', 'Other'];
const splitModes: SplitMode[] = ['equal', 'exact', 'percent'];
function isCategory(value: string): value is Category { return categories.some(category => category === value); }

export function ExpenseForm(): ReactElement {
  const members = useAppSelector(state => state.trip.members);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [values, setValues] = useState<ExpenseFormValues>(blankValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const update = <Key extends keyof ExpenseFormValues>(field: Key, value: ExpenseFormValues[Key]): void => setValues(current => ({ ...current, [field]: value }));
  const setShare = (memberId: string, value: string): void => setValues(current => ({ ...current, shares: { ...current.shares, [memberId]: value } }));
  const toggleMember = (memberId: string): void => setValues(current => ({ ...current, selectedMembers: current.selectedMembers.includes(memberId) ? current.selectedMembers.filter(id => id !== memberId) : [...current.selectedMembers, memberId] }));

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const nextErrors = validateExpense(values, members);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const amount = parseRupeesToPaise(values.amount);
    if (amount === null) return;
    if (!isCategory(values.category)) return;
    dispatch(expenseAdded({ id: crypto.randomUUID(), description: values.description.trim(), amount, paidBy: values.paidBy, date: values.date, category: values.category, split: buildSplit(values, members) }));
    navigate('/', { state: { notice: 'Expense added successfully.' } });
  }

  return <section className="form-card"><div className="section-eyebrow">TRIP EXPENSE</div><h1>Add an expense</h1><p className="muted">Add what you paid and choose how the group shares it.</p>
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <label className="field full">Description<input value={values.description} maxLength={120} onChange={event => update('description', event.target.value)} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'description-error' : undefined} placeholder="e.g. Dinner by the beach" />{errors.description && <span className="error" id="description-error">{errors.description}</span>}</label>
        <label className="field">Amount in ₹<input inputMode="decimal" value={values.amount} onChange={event => update('amount', event.target.value)} aria-invalid={Boolean(errors.amount)} aria-describedby={errors.amount ? 'amount-error' : undefined} placeholder="0.00" />{errors.amount && <span className="error" id="amount-error">{errors.amount}</span>}</label>
        <label className="field">Date<input type="date" value={values.date} max={new Date().toISOString().slice(0, 10)} onChange={event => update('date', event.target.value)} aria-invalid={Boolean(errors.date)} />{errors.date && <span className="error">{errors.date}</span>}</label>
        <label className="field">Paid by<select value={values.paidBy} onChange={event => update('paidBy', event.target.value)} aria-invalid={Boolean(errors.paidBy)}><option value="">Choose a person</option>{members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}</select>{errors.paidBy && <span className="error">{errors.paidBy}</span>}</label>
        <label className="field">Category<select value={values.category} onChange={event => update('category', event.target.value)} aria-invalid={Boolean(errors.category)}><option value="">Choose a category</option>{categories.map(category => <option key={category}>{category}</option>)}</select>{errors.category && <span className="error">{errors.category}</span>}</label>
      </div>
      <fieldset className="split-fieldset"><legend>How should this be split?</legend><div className="split-options">{splitModes.map(mode => <label className={`split-option ${values.splitType === mode ? 'selected' : ''}`} key={mode}><input type="radio" name="splitType" checked={values.splitType === mode} onChange={() => update('splitType', mode)} /><span><strong>{mode === 'equal' ? 'Equally' : mode === 'exact' ? 'Exact amounts' : 'Percentages'}</strong><small>{mode === 'equal' ? 'Choose participants' : mode === 'exact' ? 'Enter each share in ₹' : 'Set each share in %'}</small></span></label>)}</div>
        {values.splitType === 'equal' ? <div className="member-choices">{members.map(member => <label key={member.id} className="check-option"><input type="checkbox" checked={values.selectedMembers.includes(member.id)} onChange={() => toggleMember(member.id)} />{member.name}</label>)}</div> : <div className="share-grid">{members.map(member => <label className="field" key={member.id}>{member.name}<div className="share-input"><span>{values.splitType === 'exact' ? '₹' : '%'}</span><input inputMode="decimal" value={values.shares[member.id] ?? ''} onChange={event => setShare(member.id, event.target.value)} aria-label={`${member.name} ${values.splitType === 'exact' ? 'amount' : 'percentage'}`} placeholder="0" /></div></label>)}</div>}
        {errors.selectedMembers && <span className="error">{errors.selectedMembers}</span>}{errors.shares && <span className="error" role="alert">{errors.shares}</span>}
      </fieldset>
      <div className="form-actions"><button type="button" className="button secondary" onClick={() => navigate('/')}>Cancel</button><button type="submit" className="button primary">Save expense <span aria-hidden="true">→</span></button></div>
    </form>
  </section>;
}
