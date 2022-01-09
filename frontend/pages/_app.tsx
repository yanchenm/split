import '../styles/globals.css';
import type { AppProps } from 'next/app';
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';

type ProvidedWeb3 = {
  w3: Web3,
  account: string | null,
  isHarmony: boolean,
  isConnected: boolean
}

export const W3Context = React.createContext<ProvidedWeb3 | null>(null);
function MyApp({ Component, pageProps }: AppProps) {
  let [providedWeb3, setProvidedWeb3] = useState<ProvidedWeb3 | null>(null);

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
        console.log({ chain });
        let w3 = new Web3(anyWindow.ethereum);
        let accounts = await w3.eth.getAccounts();

        // Add event handler callback on ethereum window for user changing account
        anyWindow.ethereum.on('accountsChanged', async (newAccounts: Array<string>) => {
          const chain = await anyWindow.ethereum.request({ method: 'eth_chainId' });
          const isConnected = await anyWindow.ethereum.isConnected();
          setProvidedWeb3({
            w3: new Web3(anyWindow.ethereum),
            account: newAccounts[0],
            isHarmony: chain === "0x63564c40",
            isConnected,
          });
        })

        // Add event handler callback on ethereum window for user changing network
        anyWindow.ethereum.on('chainChanged', async (chainId: string) => {
          const isConnected = await anyWindow.ethereum.isConnected();
          setProvidedWeb3({
            w3: new Web3(anyWindow.ethereum),
            account: accounts[0],
            isHarmony: chainId === "0x63564c40",
            isConnected
          });
          anyWindow.location.reload();
        })

        setProvidedWeb3({
          w3,
          account: accounts[0],
          isHarmony: chain === "0x63564c40",
          isConnected
        });
      } catch (error) {
        // Error happened, reset web3 login state to not logged in
        console.log(error);
        setProvidedWeb3(null);
      }
    }
  }

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

      try {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          web3Connect();
        }
      } catch (error) {
        // no op on error
      }
    };

    tryConnect();
  }, [])

  return (
    <W3Context.Provider value={providedWeb3}>
      <Component {...pageProps} web3Connect={web3Connect} />
    </W3Context.Provider>
  );
}

export default MyApp;
