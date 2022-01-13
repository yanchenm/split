import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';

import ButtonWithLoading from '../ui/ButtonWithLoading';
import CurrencySelector from '../ui/CurrencySelector';
import CustomDatePicker from '../ui/DatePicker';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import NumberFormat from 'react-number-format';
import SplitParticipants from '../ui/SplitParticipants';
import { useRouter } from 'next/router';

type NewTransactionFormValues = {
  name: string;
  amount: number;
  currency: string;
  date: Date;
  participants: Record<string, ParticipantState>;
};

type NewTransactionModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  openModal: () => void;
};

export type ParticipantState = {
  selected: boolean;
  share: number;
};

const testState = {
  Alice: {
    selected: false,
    share: 0,
  },
  Bob: {
    selected: false,
    share: 0,
  },
  Charlie: {
    selected: false,
    share: 0,
  },
};

const currencies = ['CAD', 'USD', 'EUR'];

const NewTransactionModal: React.FC<NewTransactionModalProps> = ({ isOpen, closeModal, openModal }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formMethods = useForm<NewTransactionFormValues>();
  const formErrors = formMethods.formState.errors;

  useEffect(() => {
    if (!isOpen) {
      formMethods.reset();
      setError('');
    }
  }, [formMethods, isOpen]);

  const onSubmit: SubmitHandler<NewTransactionFormValues> = (data) => {
    console.log(data);
  };

  return (
    <Modal isOpen={isOpen} title="Add New Transaction" closeHandler={closeModal} openHandler={openModal}>
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
              <label className="text-sm">Date</label>
              <Controller
                control={formMethods.control}
                name="date"
                render={({ field: { onChange, value } }) => <CustomDatePicker onChange={onChange} selected={value} />}
                rules={{ required: { value: true, message: 'Please select a date.' } }}
              />
              <div className="text-sm text-red-500 mt-1">{formErrors.date?.message}</div>
            </div>
            <div>
              <label className="text-sm">Amount</label>
              <Controller
                control={formMethods.control}
                name="amount"
                render={({ field: { onChange, value } }) => (
                  <NumberFormat
                    className="bg-white appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-200 placeholder-gray-500 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:z-10"
                    value={value}
                    onValueChange={(v) => onChange(v.floatValue)}
                    inputMode="numeric"
                    decimalScale={2}
                    allowNegative={false}
                  />
                )}
                rules={{ required: { value: true, message: 'Please enter an amount.' } }}
              />
              <div className="text-sm text-red-500 mt-1">{formErrors.amount?.message}</div>
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
              <Controller
                control={formMethods.control}
                name="participants"
                defaultValue={testState}
                render={({ field: { onChange, value } }) => (
                  <SplitParticipants
                    participants={value}
                    total={formMethods.watch('amount') || 0}
                    onValueChange={(v) => onChange(v)}
                  />
                )}
              />
              <div className="text-sm text-red-500 mt-1">{formErrors.participants?.message}</div>
            </div>
          </div>
          <div className="mt-6">
            <div className={'text-red-600 text-center mb-3'}>{error}</div>
            <ButtonWithLoading buttonText="Submit" loading={isLoading} />
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default NewTransactionModal;
