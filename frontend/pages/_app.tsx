import '../styles/globals.css';
import type { AppProps } from 'next/app';

import { UseWalletProvider } from 'use-wallet';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UseWalletProvider
      connectors={{
        injected: {
          chainId: [1, 4],
        }
      }}>
      <Component {...pageProps} />
    </UseWalletProvider>
  );
}

export default MyApp;
