import type { NextPage } from 'next';

import { useRouter } from 'next/router';
import { useEffect } from 'react';

import Button from '../components/Button';
import { useWallet } from 'use-wallet';

const Home: NextPage = () => {

  const wallet = useWallet();
  const activate = (connector: any) => wallet.connect(connector)
  const router = useRouter();

  const connectAndRedirect = async () => {
    try {
      await activate('injected');
    } catch (e) {
      console.log(e)
      return;
    }
    router.push('/dashboard');
  }

  const checkExistingConnection = async () => {
    await activate('injected');
    console.log(wallet.isConnected())
  }

  /*
  useEffect(() => {
    checkExistingConnection();
  }, [])
  */

  return (
    <div className="font-default bg-slate-800 h-screen">
      <div className="flex justify-between p-10">
        <h1 className="text-3xl font-bold text-slate-300">Web3Split</h1>
        <Button clickHandler={connectAndRedirect} >
          Connect to Wallet
        </Button>
      </div>
      <div className="flex flex-col h-40 justify-between items-center mt-40">
        <h1 className="text-3xl font-bold text-slate-300 text-center">Penis on the <br/> BLOCK CHAIN</h1>
      </div>
    </div>
  )
};

export default Home;
