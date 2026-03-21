import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';
import { LandingPage } from './shared/LandingPage';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Expected #root element to exist.');
}

createRoot(root).render(
  <StrictMode>
    <LandingPage />
  </StrictMode>
);
