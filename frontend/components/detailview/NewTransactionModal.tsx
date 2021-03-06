import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';

import ButtonWithLoading from '../ui/ButtonWithLoading';
import CurrencySelector from '../ui/CurrencySelector';
import CustomDatePicker from '../ui/DatePicker';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import NumberFormat from 'react-number-format';
import SplitParticipants from '../ui/SplitParticipants';
import { User } from '../../utils/routes/user';
import { createTransaction } from '../../utils/routes/transaction';
import { getUsersInGroup } from '../../utils/routes/group';
import { useRouter } from 'next/router';

type NewTransactionFormValues = {
  name: string;
  amount: number;
  currency: string;
  date: Date;
  participants: Record<string, ParticipantState>;
};

type NewTransactionModalProps = {
  groupId: string;
  isOpen: boolean;
  currency: string;
  closeModal: () => void;
  openModal: () => void;
  onDone: () => void;
};

export type ParticipantState = {
  username: string;
  selected: boolean;
  share: number | '';
  isCustom: boolean;
};

const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  groupId,
  isOpen,
  currency,
  closeModal,
  openModal,
  onDone,
}) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [toggleReset, setToggleReset] = useState(false);

  const formMethods = useForm<NewTransactionFormValues>();
  const formErrors = formMethods.formState.errors;

  useEffect(() => {
    if (!isOpen) {
      formMethods.reset();
      setToggleReset(!toggleReset);
      setError('');
    }
  }, [formMethods, isOpen]);

  useEffect(() => {
    if (groupId) {
      getUsersInGroup(groupId)
        .then((res) => {
          setUsers(res.data);
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [groupId]);

  const [participantState, setParticipantState] = useState<Record<string, ParticipantState>>({});
  useEffect(() => {
    const participants = users.reduce((map, user) => {
      map[user.address] = {
        username: user.username,
        selected: false,
        share: 0,
        isCustom: false,
      };
      return map;
    }, {} as Record<string, ParticipantState>);
    console.log(participants);
    setParticipantState(participants);
  }, [users]);

  const onSubmit: SubmitHandler<NewTransactionFormValues> = ({ name, amount, currency, date, participants }) => {
    setIsLoading(true);
    setError('');

    let amountString = amount.toFixed(2);
    let dateString = date.toISOString().split('T')[0];
    let splits = Object.keys(participants)
      .filter((address) => participants[address].selected)
      .map((address) => {
        return {
          address,
          share: Number(participants[address].share).toFixed(2),
        };
      });

    let splitsSum = splits.reduce((sum, split) => (sum += Number(split.share)), 0);
    if (splitsSum !== amount) {
      setError('The shares do not add up to the total amount.');
      setIsLoading(false);
      return;
    }

    let transaction = {
      name,
      group: groupId,
      total: amountString,
      currency,
      date: dateString,
      splits,
      is_settlement: 0,
    };

    createTransaction(transaction)
      .then((response) => {
        closeModal();
      })
      .catch((error) => {
        console.log('Error creating transaction: ' + error.message);
        setError('Failed to create transaction. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
        onDone();
      });
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
                defaultValue={new Date()}
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
                render={({ field: { onChange, value } }) => <CurrencySelector selected={value} onChange={onChange} />}
                rules={{ required: { value: true, message: 'Please select a currency.' } }}
                defaultValue={currency}
              />
              <div className="text-sm text-red-500 mt-1">{formErrors.currency?.message}</div>
            </div>
            <div className="col-span-2">
              {users.length > 0 && (
                <Controller
                  control={formMethods.control}
                  name="participants"
                  defaultValue={participantState}
                  render={({ field: { onChange, value } }) => (
                    <SplitParticipants
                      participants={value}
                      total={formMethods.watch('amount') || 0}
                      toggleReset={toggleReset}
                      onValueChange={(v) => onChange(v)}
                    />
                  )}
                />
              )}
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
