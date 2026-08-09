import React from 'react';
import ReactDOM from 'react-dom/client';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import App from './App';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AptosWalletAdapterProvider autoConnect={true} optInWallets={['Petra']}>
      <App />
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);
