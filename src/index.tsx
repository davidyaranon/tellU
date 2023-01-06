import { createRoot } from 'react-dom/client';
import App from './App';
import { ContextProvider } from './my-context';
const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <ContextProvider>
    <App />
  </ContextProvider>
);
