import type { NextPage } from 'next';
import { useWallet } from 'use-wallet';
import { useEffect } from 'react';

const Dashboard: NextPage = () => {

  const activate = (connector: any) => wallet.connect(connector)

  useEffect(() => {
    activate('injected');
  }, []);

  const wallet = useWallet();

  return (
    <div className="font-default">
      <h1>Dashboard</h1> 
      {wallet.isConnected() ? wallet.account : "Wallet not connected"}
    </div>
  )
};


export default Dashboard;
