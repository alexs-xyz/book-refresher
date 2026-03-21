import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';
import { ReaderApp } from './reader-app/ReaderApp';

const root = document.getElementById('reader-root');

if (!root) {
  throw new Error('Expected #reader-root element to exist.');
}

createRoot(root).render(
  <StrictMode>
    <ReaderApp />
  </StrictMode>
);
