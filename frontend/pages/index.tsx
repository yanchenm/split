import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Button from '../components/UI/Button';
import React, { useState } from 'react';
import { W3Context, DarkmodeContext } from './_app';
import ToggleButton from '../components/UI/ToggleButton';
import axios from 'axios'

type PageProps = {
  web3Connect: () => Promise<void>;
}

const Home: NextPage<PageProps> = ({ ...props }) => {

  const router = useRouter();
  const { web3Connect } = props;

  return (
    <W3Context.Consumer>
        {(consumerProps) => (
          <DarkmodeContext.Consumer>
            {(darkmodeProps) => {
              let buttonArea = <></>;
              if (consumerProps && consumerProps.account && consumerProps.isConnected && consumerProps.isHarmony) {
                buttonArea = (
                  <div>
                    <p className='text-neutral-800 dark:text-slate-300 text-xl font-semibold '>{consumerProps.account?.substring(0, 6) + "..." + consumerProps.account?.substring(38)}</p>
                    <Button clickHandler={() => router.push({pathname: '/app'})}>Launch App</Button>
                  </div>
                )
              } else if (consumerProps && consumerProps.account && consumerProps.isConnected) {
                buttonArea = <p className='text-neutral-800 dark:text-slate-300 text-xl font-semibold'>Wrong chain! Please connect to Harmony Network</p>
              } else if (consumerProps && consumerProps.account) {
                buttonArea = <p className='text-neutral-800 dark:text-slate-300 text-xl font-semibold'>Network disconnected...</p>
              } else {
                buttonArea = <Button clickHandler={web3Connect}>Connect Wallet</Button>
              }

              return (
                  <div className={`${darkmodeProps?.isDarkmode? 'dark' : ''}`}>
                    <div className="bg-gray-300 dark:bg-slate-800 h-screen">
                      <div className="flex justify-between p-10">
                        <h1 className="text-neutral-800 dark:text-slate-300 text-3xl font-bold">Web3Split</h1>
                        <ToggleButton toggleState={darkmodeProps.isDarkmode} toggleHandler={darkmodeProps.toggleDarkmode}/>
                        {buttonArea}
                      </div>
                      <div className="flex flex-col h-40 justify-between items-center mt-40">
                        <h1 className="text-neutral-800 dark:text-slate-300 text-3xl font-bold text-center">Penis on the <br /> BLOCK CHAIN</h1>
                      </div>
                    </div>
                  </div>
              )
              }
            }
          </DarkmodeContext.Consumer>
        )}
    </W3Context.Consumer>
  )
};

export default Home;
