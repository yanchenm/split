import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

import ButtonWithLoading from '../../components/UI/ButtonWithLoading';
import CurrencySelector from '../../components/UI/CurrencySelector';
import Input from '../../components/UI/Input';
import type { NextPage } from 'next';
import { createGroup } from '../../utils/routes/group';

type NewGroupFormValues = {
  name: string;
  currency: string;
  description: string;
};

const currencies = ['CAD', 'USD', 'EUR'];

const NewGroup: NextPage = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formMethods = useForm<NewGroupFormValues>();
  const formErrors = formMethods.formState.errors;

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const onSubmit: SubmitHandler<NewGroupFormValues> = ({ name, currency, description }) => {
    setIsLoading(true);
    createGroup({ name, currency, description })
      .catch((error) => {
        console.log('Error creating group: ' + error);
        setError(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={openModal}
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Open dialog
        </button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="font-default fixed inset-0 z-10 overflow-y-auto" onClose={closeModal}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-xl p-6 my-8 text-left align-middle transition-all transform bg-gray-100 shadow-2xl rounded-2xl">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                  Create Group
                </Dialog.Title>
                <div className="mt-3">
                  <FormProvider {...formMethods}>
                    <form onSubmit={formMethods.handleSubmit(onSubmit)}>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-4 items-start justify-center max-w-full">
                        <div>
                          <label className="text-sm">Name</label>
                          <Input
                            id="name"
                            formFieldName="name"
                            formRegisterOptions={{
                              required: { value: true, message: 'Please enter a group name.' },
                              maxLength: { value: 64, message: 'Group name must be less than 64 characters.' },
                            }}
                          />
                          <div className="text-sm text-red-500 mt-1">{formErrors.name?.message}</div>
                        </div>
                        <div>
                          <label className="text-sm">Currency</label>
                          <Controller
                            control={formMethods.control}
                            name="currency"
                            render={({ field: { onChange, value } }) => (
                              <CurrencySelector selected={value} onChange={onChange} options={currencies} />
                            )}
                            rules={{ required: { value: true, message: 'Please select a currency.' } }}
                          />
                          <div className="text-sm text-red-500 mt-1">{formErrors.currency?.message}</div>
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm">Description (optional)</label>
                          <textarea
                            className="bg-white appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-200 placeholder-gray-500 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:z-10"
                            {...formMethods.register('description', {
                              maxLength: { value: 512, message: 'Description must be less than 512 characters.' },
                            })}
                          />
                          <div className="text-sm text-red-500 mt-1">{formErrors.description?.message}</div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <ButtonWithLoading buttonText="Submit" loading={isLoading} />
                      </div>
                    </form>
                  </FormProvider>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default NewGroup;
