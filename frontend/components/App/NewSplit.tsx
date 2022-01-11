import React from 'react';
import { useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { validateAddress } from '../../utils/address';
import Input from '../Input';
import Input2 from '../Input2';
import Button from '../UI/Button';

type NewSplitValues = {
  name: string;
  currency: string;
  participants: string;
};

const NewSplit: React.FC = () => {
  const formMethods = useForm<NewSplitValues>();
  const formErrors = formMethods.formState.errors;

  const onSubmit: SubmitHandler<NewSplitValues> = ({ name, currency, participants }) => {
    console.log(name)
    console.log(currency)
    console.log(participants)
  };

  return (
    <div className="items-center rounded-lg w-1/2 h-1/2 bg-slate-900 flex flex-col m-3 text-slate-300">
      <FormProvider {...formMethods}>
        <span className="pt-3 pb-2">
          <div className="font-bold text-2xl mb-1 text-center">Add New Split</div>
        </span>

        <form className="mt-12 w-3/4 md:w-1/2 lg:w-3/7 xl:w-1/3 flex flex-col space-y-5" onSubmit={formMethods.handleSubmit(onSubmit)}>
          <div className="flex flex-row">
            <Input
              formFieldName="name"
              placeholder="Split Name"
              autoComplete="off"
              errorState={Boolean(formErrors.addresses)}
              formRegisterOptions={{
                required: {
                  value: true,
                  message: 'Please enter a split name.',
                },
              }}
            />
          </div>
          <div className="flex flex-row">
            <Input
              formFieldName="currency"
              placeholder="Currency"
              autoComplete="off"
              errorState={Boolean(formErrors.addresses)}
              formRegisterOptions={{
                required: {
                  value: true,
                  message: 'Please enter a currency.',
                },
              }}
            />
          </div>
          <div className="flex flex-row">
            <Input2
              formFieldName="description"
              placeholder="Description"
              autoComplete="off"
              errorState={Boolean(formErrors.addresses)}
              formRegisterOptions={{
                required: {
                  value: true,
                  message: 'Please enter a descri.',
                },
              }}
            />
          </div>
          <Button>Add</Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default NewSplit;