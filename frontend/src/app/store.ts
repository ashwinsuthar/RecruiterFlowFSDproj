import { configureStore } from '@reduxjs/toolkit';
import tripReducer from '../features/expenses/expensesSlice';

export const store = configureStore({ reducer: { trip: tripReducer } });
store.subscribe(() => {
  try { localStorage.setItem('goa-trip-splitter-v1', JSON.stringify(store.getState().trip)); }
  catch { /* Keep the in-memory app usable when browser storage is unavailable. */ }
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
