import '../styles/globals.css';
import type { AppProps } from 'next/app';
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import axios from 'axios';

export type ProvidedWeb3 = {
  w3: Web3;
  account: string | null;
  isHarmony: boolean;
  isConnected: boolean;
};

type ProvidedDarkmode = {
  isDarkmode: boolean;
  toggleDarkmode?: React.Dispatch<React.SetStateAction<boolean>>;
};

// Set axios to intercept requests and add auth header on all of them.
axios.interceptors.request.use(async (request) => {
  if (request) {
    // First check that token exists and isn't expired, try to update otherwise
    let authToken = localStorage.getItem('token');
    let currentExpiry = localStorage.getItem('tokenEpochTime');
    if (!authToken || !currentExpiry || new Date().getTime() / 1000 - parseInt(currentExpiry) > 60 * 60 * 24 * 14) {
      await tryUpdateToken();
      // Grab the new auth token this method created
      authToken = localStorage.getItem('token');
      currentExpiry = localStorage.getItem('tokenEpochTime');
    }
    if (request.headers && request.headers && authToken && currentExpiry) {
      request.headers.Authorization = authToken;
      request.headers.epoch_signed_time = currentExpiry;
    }
    return request;
  }
});

// Attempts to update user's web3 auth token for our site
const tryUpdateToken = async () => {
  let anyWindow = window as any;
  if (typeof anyWindow.ethereum !== 'undefined') {
    const currentToken = localStorage.getItem('token');
    const currentExpiry = localStorage.getItem('tokenEpochTime');
    let w3 = new Web3(anyWindow.ethereum);
    let accounts = await w3.eth.getAccounts();
    // Check if current token doesn't exist or is expired (Older than 14 days).
    if (!currentToken || !currentExpiry || new Date().getTime() / 1000 - parseInt(currentExpiry) > 60 * 60 * 24 * 14) {
      // Shifting by 0 forces the float to integer
      let epoch = String((new Date().getTime() / 1000) >> 0);
      let msg = w3.utils.toHex('Split app login: ' + epoch);
      let from = accounts[0];
      const signature = await anyWindow.ethereum.request({ method: 'personal_sign', params: [msg, from] });
      localStorage.setItem('token', signature);
      localStorage.setItem('tokenEpochTime', epoch);
    }
  }
};

export const W3Context = React.createContext<ProvidedWeb3 | null>(null); // Web3 Context
export const DarkmodeContext = React.createContext<ProvidedDarkmode>({ isDarkmode: false, toggleDarkmode: undefined }); // Darkmode context

function MyApp({ Component, pageProps }: AppProps) {
  let [providedWeb3, setProvidedWeb3] = useState<ProvidedWeb3 | null>(null);
  let [isDarkmode, setIsDarkMode] = useState(false);

  // Attempts to connect an injected wallet (like metamask).
  // Makes a metamask popup to connect if wallet not previously connected.
  const web3Connect = async () => {
    // Default window object in typescript doesn't include injected ethereum object
    let anyWindow = window as any;
    if (typeof anyWindow.ethereum !== 'undefined') {
      try {
        await anyWindow.ethereum.request({ method: 'eth_requestAccounts' });
        const chain = await anyWindow.ethereum.request({ method: 'eth_chainId' });
        const isConnected = await anyWindow.ethereum.isConnected();
        await tryUpdateToken();

        let w3 = new Web3(anyWindow.ethereum);
        let accounts = await w3.eth.getAccounts();

        // Add event handler callback on ethereum window for user changing account
        anyWindow.ethereum.on('accountsChanged', async (newAccounts: Array<string>) => {
          const chain = await anyWindow.ethereum.request({ method: 'eth_chainId' });
          const isConnected = await anyWindow.ethereum.isConnected();
          setProvidedWeb3({
            w3: new Web3(anyWindow.ethereum),
            account: newAccounts[0].toLowerCase(),
            isHarmony: chain === '0x63564c40',
            isConnected,
          });
        });

        // Add event handler callback on ethereum window for user changing network
        anyWindow.ethereum.on('chainChanged', async (chainId: string) => {
          const isConnected = await anyWindow.ethereum.isConnected();
          setProvidedWeb3({
            w3: new Web3(anyWindow.ethereum),
            account: accounts[0].toLowerCase(),
            isHarmony: chainId === '0x63564c40',
            isConnected,
          });
          anyWindow.location.reload();
        });

        setProvidedWeb3({
          w3,
          account: accounts[0].toLowerCase(),
          isHarmony: chain === '0x63564c40',
          isConnected,
        });
      } catch (error) {
        // Error happened, reset web3 login state to not logged in
        console.log(error);
        setProvidedWeb3(null);
      }
    }
  };

  // Dark mode toggleHandler
  const darkModeToggleHandler = () => {
    setIsDarkMode(!isDarkmode);
  };

  // Function to check if a user's wallet is already connected via metamask without triggering popup

  useEffect(() => {
    // Checks if user's account is already connected before calling web3Connect.
    // We don't want to call web3Connect as it will make a metamask prompt to connect if the user hasn't connected before.
    // Instead the user should consent by clicking the "Connect Wallet" button to trigger the connection flow manually.
    const tryConnect = async () => {
      let web3: Web3;
      let anyWindow = window as any;
      if (anyWindow.ethereum) {
        web3 = new Web3(anyWindow.ethereum);
      } else if (anyWindow.web3) {
        web3 = new Web3(anyWindow.web3);
      } else {
        return false;
      }

      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        web3Connect();
      }
    };

    tryConnect();
  }, []);

  return (
    <W3Context.Provider value={providedWeb3}>
      <DarkmodeContext.Provider value={{ isDarkmode: isDarkmode, toggleDarkmode: darkModeToggleHandler }}>
        <Component {...pageProps} web3Connect={web3Connect} providedWeb3={providedWeb3} />
      </DarkmodeContext.Provider>
    </W3Context.Provider>
  );
}

export default MyApp;
