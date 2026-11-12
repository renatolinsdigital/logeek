import '@fontsource/press-start-2p/400.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BuilderPage } from '@/pages/BuilderPage';
import './styles/global.scss';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('index.html must hold a #root element');

createRoot(rootElement).render(
  <StrictMode>
    <BuilderPage />
  </StrictMode>,
);
