import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Button from '../components/UI/Button';
import React, { useState } from 'react';
import { W3Context, DarkmodeContext } from './_app';
import ToggleButton from '../components/UI/ToggleButton';
import {displayAddress} from '../utils/address';

import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import Input from '../components/UI/Input';
import { useEffect } from 'react';
import ReactLoading from 'react-loading';
import ButtonWithLoading from '../components/UI/ButtonWithLoading';
import { getUser, createUser } from '../utils/routes/user';
import Modal from '../components/UI/Modal';

type PageProps = {
  web3Connect: () => Promise<void>;
};

const Home: NextPage<PageProps> = ({ ...props }) => {
  const router = useRouter();
  const { web3Connect } = props;

  const [isRegistered, setIsRegistered] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const formMethods = useForm<NewUserFormValues>();
  const formErrors = formMethods.formState.errors;
 
  type NewUserFormValues = {
    address: string,
    username: string;
    email: string;
  };
  
  useEffect(() => {
    ( async () => {
      try {
        const userResponse = await getUser();
        if (userResponse.status === 200 && userResponse.data) {
          setIsRegistered(true);
        } 
        else {
          setIsRegistered(false);
        }
      } catch (e) {
        console.log(e);
        setIsRegistered(false);
      }
    })();
  }, [])

  function closeModal() {
    setIsRegistered(true);
  }

  const onSubmit: SubmitHandler<NewUserFormValues> = ({ username, email }) => {
    setIsLoading(true);
    createUser({ username, email })
      .then((response) => {
        closeModal();
      })
      .catch((error) => {
        console.log('Error registering: ' + error.message);
        setError('Failed to register. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

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
            
            let isNotRegisteredAndConnected = !isRegistered && consumerProps?.isConnected || false;

            return (              
              <div className={`${darkmodeProps?.isDarkmode ? 'dark' : ''}`}>
                <div>
                  <Modal isOpen={isNotRegisteredAndConnected} title="Enter User Details" closeHandler={closeModal} openHandler={() => {}}>
                    <FormProvider {...formMethods}>
                      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
                        <div className="grid-cols-2 gap-x-3 gap-y-4 items-start justify-center max-w-full">
                          <div>
                            <label className="text-sm">Name</label>
                            <Input
                              id="username"
                              formFieldName="username"
                              formRegisterOptions={{
                                required: { value: true, message: 'Please enter a user name.' },
                                maxLength: { value: 64, message: 'Group name must be less than 64 characters.' },
                              }}
                            />
                            <div className="text-sm text-red-500 mt-1">{formErrors.name?.message}</div>
                          </div>
                          <div className="col-span-2">
                            <label className="text-sm">Email (optional)</label>
                            <Input
                              id="email"
                              formFieldName="email"
                              formRegisterOptions={{
                                required: { value: false, message: 'Please enter a email.' },
                                maxLength: { value: 64, message: 'Group name must be less than 64 characters.' },
                              }}
                            />
                            <div className="text-sm text-red-500 mt-1">{formErrors.description?.message}</div>
                          </div>
                        </div>
                        <div className="mt-6">
                          <div className={'text-red-600 text-center mb-3'}>{error}</div>
                          <ButtonWithLoading buttonText="Submit" loading={isLoading} />
                        </div>
                      </form>
                    </FormProvider>
                  </Modal>
                  </div>


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
