import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Base styles first, so component styles imported below can override them.
import './styles/base.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
