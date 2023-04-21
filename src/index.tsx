import { createRoot } from 'react-dom/client';
import App from './App';
import { ContextProvider } from './my-context';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  
  /* Allows use of global variables using the Context API  and the useContext() hook */
  <ContextProvider>

    <App />

  </ContextProvider>
);
