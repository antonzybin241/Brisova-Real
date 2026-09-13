import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './theme/fonts/fonts.css';
import './styles/theme.css';
import './theme/themes/themes.css';
import './styles/brisova.css';
import './styles/modern.css';
import './styles/responsive.css';
import './styles/brand.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initTheme } from './theme/themes';

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiConfig } from 'wagmi';
import { BrowserRouter } from 'react-router-dom';
import { WalletSessionProvider } from './components/providers/WalletSessionProvider';
import { SUPPORTED_CHAINS } from './config/chains';
import { APP_FULL_NAME } from './config/constants';

const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'ac09aec8ba932273ba8fcffbf74619e7';

const metadata = {
  name: APP_FULL_NAME,
  description: 'Brisova — Institutional access to tokenized real estate on Ethereum',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://brisova.io',
  icons: ['/logo.png'],
};

const wagmiConfig = defaultWagmiConfig({
  chains: SUPPORTED_CHAINS,
  projectId,
  metadata,
  enableEIP6963: true,
  enableInjected: true,
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains: SUPPORTED_CHAINS,
  themeMode: 'light',
  themeVariables: {
    '--w3m-font-family': 'Manrope, "Segoe UI", sans-serif',
    '--w3m-accent': '#b08a5a',
    '--w3m-color-mix': '#f6f1e9',
    '--w3m-color-mix-strength': 40,
    '--w3m-border-radius-master': '3px',
  },
  featuredWalletIds: [
    'c57ca95b47569778a828d19182413d2773260023265ce1ee3c74bcd17adfd8ee',
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b46a5331ce84b07ae4b6b25',
  ],
});

initTheme();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <WagmiConfig config={wagmiConfig}>
        <WalletSessionProvider>
          <App />
        </WalletSessionProvider>
      </WagmiConfig>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
