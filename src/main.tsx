import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';
// After the stylesheet, so the canvas is measured against the final page
// metrics (scrollbar gutter included) but still before React paints.
import './lib/viewportStage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
