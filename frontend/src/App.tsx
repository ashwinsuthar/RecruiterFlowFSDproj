import { BrowserRouter, Route, Routes } from 'react-router-dom';
import type { ReactElement } from 'react';
import { Navbar } from './components/Navbar';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpensesPage } from './pages/ExpensesPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App(): ReactElement {
  return <BrowserRouter><div className="app-shell"><Navbar /><main className="main-content"><Routes><Route path="/" element={<ExpensesPage />} /><Route path="/expenses/new" element={<ExpenseForm />} /><Route path="*" element={<NotFoundPage />} /></Routes></main><footer className="app-footer"><span>Made for the memories, not the math.</span><span>GOA TRIP · 2026</span></footer></div></BrowserRouter>;
}
