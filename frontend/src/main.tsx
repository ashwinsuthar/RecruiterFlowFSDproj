import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './app/store';
import './styles/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root is missing');
ReactDOM.createRoot(rootElement).render(<React.StrictMode><Provider store={store}><App /></Provider></React.StrictMode>);
