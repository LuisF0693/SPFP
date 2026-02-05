import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Add error logging to catch runtime errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
});

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(<App />);
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #1a1a1a; color: #fff; font-family: monospace;">
    <div style="max-width: 500px; padding: 20px;">
      <h1>Erro ao inicializar aplicação</h1>
      <p>${error instanceof Error ? error.message : String(error)}</p>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">Verifique o console (F12) para detalhes.</p>
    </div>
  </div>`;
}