import ButtonWithLoading from '../ui/ButtonWithLoading';
import Modal from '../ui/Modal';
import React from 'react';
import { displayAddress } from '../../utils/address';

type ConfirmSettleModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  openModal: () => void;
  debts: DebtDetails[];
  currency: string;
  onSettle: () => void;
  isLoading: boolean;
};

export type DebtDetails = {
  username: string;
  address: string;
  amount: number;
  ones: number;
};

const ConfirmSettleModal: React.FC<ConfirmSettleModalProps> = ({
  debts,
  currency,
  isOpen,
  closeModal,
  openModal,
  isLoading,
  onSettle,
}) => {
  let total = debts.reduce((sum, debt) => sum + debt.amount, 0);
  let total_ones = debts.reduce((sum, debt) => sum + debt.ones, 0);
  return (
    <Modal isOpen={isOpen} title="Confirm Settlement" closeHandler={closeModal} openHandler={openModal}>
      <div className="flex flex-col w-full pt-3 mb-6">
        <div className="flex flex-row">
          <div className="w-full text-2xl text-gray-800 dark:text-slate-200 font-semibold text-center">
            {`${total.toFixed(2)} ${currency}`}
          </div>
          <span className="text-2xl text-gray-800 font-semibold">=</span>
          <div className="w-full text-2xl text-gray-800 dark:text-slate-200 font-semibold text-center">{`${total_ones.toFixed(
            5
          )} ONE`}</div>
        </div>
        <h3 className="font-medium mt-6 mb-3">To be paid to:</h3>
        <div className="flex flex-col w-full space-y-3">
          {debts.map((debt) => (
            <div className="grid grid-cols-12 w-full items-center text-sm" key={debt.address}>
              <div className="col-span-6">
                <div>{debt.username}</div>
                <div className="font-mono">{displayAddress(debt.address)}</div>
              </div>
              <div className="col-span-3">
                {debt.amount.toFixed(2)} {currency}
              </div>
              <div className="col-span-3">{debt.ones.toFixed(5)} ONE</div>
            </div>
          ))}
        </div>
      </div>
      <ButtonWithLoading buttonText="Settle" loading={isLoading} onClick={onSettle} />
    </Modal>
  );
};

export default ConfirmSettleModal;
