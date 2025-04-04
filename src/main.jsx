
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './style.css';

if (window.Telegram && window.Telegram.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
  document.body.style.background = window.Telegram.WebApp.themeParams.bg_color || '#f4f4f4';
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
