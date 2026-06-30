import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './shared/i18n'; // initialises i18next (side-effect import)
import './index.css';   // Tailwind v4 + design tokens
import App from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
