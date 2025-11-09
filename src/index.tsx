import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './main.css';
import App from './App';
import { ClientProvider } from 'context/ClientContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ClientProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClientProvider>
  </React.StrictMode>,
);

