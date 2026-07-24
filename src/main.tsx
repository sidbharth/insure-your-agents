import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initPriceFeed } from './store';
import './index.css';

// First price fetch + 60 s refresh loop (REQ-6.2).
initPriceFeed();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
