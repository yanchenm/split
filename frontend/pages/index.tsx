import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Button from '../components/UI/Button';
import React from 'react';
import { W3Context, DarkmodeContext } from './_app';
import ToggleButton from '../components/UI/ToggleButton';
import {displayAddress} from '../utils/address';

type PageProps = {
  web3Connect: () => Promise<void>;
};

const Home: NextPage<PageProps> = ({ ...props }) => {
  const router = useRouter();
  const { web3Connect } = props;

  return (
    <W3Context.Consumer>
      {(consumerProps) => (
        <DarkmodeContext.Consumer>
          {(darkmodeProps) => {
            let buttonArea = <></>;
            let startButtonArea = <></>;
            if (consumerProps && consumerProps.account && consumerProps.isConnected && consumerProps.isHarmony) {
              buttonArea = (
                <div>
                  <p className="text-neutral-800 dark:text-slate-300 text-xl font-semibold ">
                    {consumerProps.account ? displayAddress(consumerProps.account) : ""}
                  </p>
                  <Button
                    classNames={'bg-violet-800 hover:bg-blue-500'}
                    clickHandler={() => router.push({ pathname: '/app' })}
                  >
                    Launch App
                  </Button>
                </div>
              );
              startButtonArea = (
                <Button
                  classNames={'bg-gradient-to-r from-purple-500 to-violet-600 margin-top mt-6'}
                  clickHandler={() => router.push({ pathname: '/app' })}
                >
                  Get Started
                </Button>
              );
            } else if (consumerProps && consumerProps.account && consumerProps.isConnected) {
              buttonArea = (
                <p className="text-neutral-800 dark:text-slate-300 text-xl font-semibold">
                  Please connect to Harmony Network
                </p>
              );
            } else if (consumerProps && consumerProps.account) {
              buttonArea = (
                <p className="text-neutral-800 dark:text-slate-300 text-xl font-semibold">Network disconnected...</p>
              );
            } else {
              buttonArea = (
                <Button classNames={'bg-violet-800 hover:bg-blue-500'} clickHandler={web3Connect}>
                  Connect Wallet
                </Button>
              );
              startButtonArea = (
                <Button
                  classNames={'bg-gradient-to-r from-purple-500 to-violet-600 margin-top mt-6'}
                  clickHandler={web3Connect}
                >
                  Get Started
                </Button>
              );
            }

            return (
              <div className={`${darkmodeProps?.isDarkmode ? 'dark' : ''}`}>
                <div className="bg-gray-300 dark:bg-slate-800 h-screen">
                  <div className="flex justify-between p-10">
                    <h1 className="text-neutral-800 dark:text-slate-300 text-3xl font-bold">WheresMyMoney</h1>
                    {buttonArea}
                  </div>
                  <div className="flex flex-col h-40 justify-between items-center mt-40">
                    <h1 className="font-bold text-7xl text-transparent text-center bg-clip-text bg-gradient-to-r from-purple-500 to-violet-600">
                      Find Your Money on the <br /> BLOCK CHAIN
                    </h1>
                    {startButtonArea}
                  </div>
                  <div className="fixed inset-x-10 bottom-10">
                    <ToggleButton toggleState={darkmodeProps.isDarkmode} toggleHandler={darkmodeProps.toggleDarkmode} />
                  </div>
                </div>
              </div>
            );
          }}
        </DarkmodeContext.Consumer>
      )}
    </W3Context.Consumer>
  );
};

export default Home;
