import { Provider } from 'react-redux';
import { configureStore, type EnhancedStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import tripReducer from '../features/expenses/expensesSlice';
import { ExpenseForm } from '../components/ExpenseForm';

function renderForm(): { store: EnhancedStore<{ trip: ReturnType<typeof tripReducer> }> } {
  const store = configureStore({ reducer: { trip: tripReducer } });
  render(<Provider store={store}><MemoryRouter initialEntries={['/expenses/new']}><Routes><Route path="/expenses/new" element={<ExpenseForm />} /><Route path="/" element={<p>Expenses page</p>} /></Routes></MemoryRouter></Provider>);
  return { store };
}

describe('expense form', () => {
  afterEach(cleanup);
  it('shows validation errors and saves nothing for invalid input', async () => {
    const user = userEvent.setup();
    const { store } = renderForm();
    await user.click(screen.getByRole('button', { name: /save expense/i }));
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(screen.getByText('Amount is required')).toBeInTheDocument();
    expect(store.getState().trip.expenses).toHaveLength(6);
  });

  it('saves a valid expense and returns to the expenses page', async () => {
    const user = userEvent.setup();
    const { store } = renderForm();
    await user.type(screen.getByLabelText('Description'), 'Fresh coconut water');
    await user.type(screen.getByLabelText('Amount in ₹'), '125.50');
    await user.selectOptions(screen.getByLabelText('Paid by'), 'm1');
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-03-16' } });
    await user.selectOptions(screen.getByLabelText('Category'), 'Food');
    await user.click(screen.getByRole('checkbox', { name: 'Aarav' }));
    await user.click(screen.getByRole('button', { name: /save expense/i }));
    expect(screen.getByText('Expenses page')).toBeInTheDocument();
    expect(store.getState().trip.expenses.at(-1)).toMatchObject({ description: 'Fresh coconut water', amount: 12550, paidBy: 'm1', category: 'Food' });
  });
});
