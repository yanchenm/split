import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import ButtonWithLoading from '../../components/UI/ButtonWithLoading';
import CurrencySelector from '../../components/UI/CurrencySelector';
import Input from '../../components/UI/Input';
import Modal from '../UI/Modal';
import { createGroup } from '../../utils/routes/group';
import { useState } from 'react';

type NewGroupFormValues = {
  name: string;
  currency: string;
  description: string;
};

type NewGroupModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  openModal: () => void;
};

const currencies = ['CAD', 'USD', 'EUR'];

const NewGroupModal: React.FC<NewGroupModalProps> = ({ isOpen, closeModal, openModal }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formMethods = useForm<NewGroupFormValues>();
  const formErrors = formMethods.formState.errors;

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
    <Modal isOpen={isOpen} title="Create Group" closeHandler={closeModal} openHandler={openModal}>
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
    </Modal>
  );
};

export default NewGroupModal;
