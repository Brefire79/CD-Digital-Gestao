import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AuthProvider } from './contexts/AuthContext';
import { OperationalProvider } from './contexts/OperationalContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <OperationalProvider>
          <App />
        </OperationalProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
