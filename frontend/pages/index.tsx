import type { NextPage } from 'next';
import Button from '../components/UI/Button';
import React from 'react';
import { W3Context } from './_app';
import axios from 'axios'

type PageProps = {
  web3Connect: () => Promise<void>
}

const Home: NextPage<PageProps> = ({ ...props }) => {
  const { web3Connect } = props;
  return (
    <W3Context.Consumer>
      {(consumerProps) => {
        let buttonArea = <></>;
        if (consumerProps && consumerProps.account && consumerProps.isConnected && consumerProps.isHarmony) {
          buttonArea = <p className='text-xl font-semibold text-slate-300'>{consumerProps.account?.substring(0, 6) + "..." + consumerProps.account?.substring(38)}</p>
        } else if (consumerProps && consumerProps.account && consumerProps.isConnected) {
          buttonArea = <p className='text-xl font-semibold text-slate-300'>Wrong chain! Please connect to Harmony Network</p>
        } else if (consumerProps && consumerProps.account) {
          buttonArea = <p className='text-xl font-semibold text-slate-300'>Network disconnected...</p>
        } else {
          buttonArea = <Button clickHandler={web3Connect}>Connect Wallet</Button>
        }

        return (
          <div className="bg-slate-800 h-screen">
            <div className="flex justify-between p-10">
              <h1 className="text-3xl font-bold text-slate-300">Web3Split</h1>
              {buttonArea}
            </div>
            <div className="flex flex-col h-40 justify-between items-center mt-40">
              <h1 className="text-3xl font-bold text-slate-300 text-center">Penis on the <br /> BLOCK CHAIN</h1>
            </div>
          </div>
        )
      }}
    </W3Context.Consumer>
  )
};

export default Home;
