import { ChartPieIcon, CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/outline';
import { ProvidedWeb3 } from '../../pages/_app';
import { Group } from '../../utils/routes/group';
import { Settlement, resolveSettle } from '../../utils/routes/settle';
import { TransactionWithSplits } from '../../utils/routes/transaction';
import { AbiItem } from 'web3-utils';

import AppButton from '../ui/AppButton';
import { Dispatch, SetStateAction } from 'react';

type StatProps = {
  providedWeb3: ProvidedWeb3 | null;
  group: Group | null;
  settle: Settlement | null;
  txns: Array<TransactionWithSplits> | null;
  setForceRerender: Dispatch<SetStateAction<boolean>>;
  forceRerender: boolean;
};

type HarmonyTxn = {
  to: string;
  amountInOne: string;
};

const contractAbi: AbiItem[] = [
  {
    type: 'function',
    name: 'multiTransfer',
    stateMutability: 'payable',
    inputs: [
      {
        name: '_addresses',
        type: 'address[]',
        internalType: 'address payable[]',
      },
      {
        type: 'uint256[]',
        internalType: 'uint256[]',
        name: '_amounts',
      },
    ],
    outputs: [],
  },
];

const contractAddr = '0xc70db95c991562f73fedaf0303f6e6a59da04a94';

const GroupStats: React.FC<StatProps> = ({ providedWeb3, group, settle, txns, forceRerender, setForceRerender }) => {
  const settleUp = () => {
    const toSendTxns: Array<HarmonyTxn> = [];
    if (providedWeb3 && settle && providedWeb3.account && group) {
      const web3 = providedWeb3.w3;
      for (let debt of settle.debts) {
        if (debt.debtor === providedWeb3.account) {
          toSendTxns.push({
            to: debt.creditor,
            amountInOne: Number(debt.net_owed_ones).toFixed(10),
          });
        }
      }
      const myAddrChecksum = web3.utils.toChecksumAddress(providedWeb3.account);
      if (toSendTxns.length === 0) {
        alert('You have no outstanding debts to pay :)');
      } else if (toSendTxns.length === 1) {
        // Use simple transaction to send to only one person
        web3.eth
          .sendTransaction({
            to: web3.utils.toChecksumAddress(toSendTxns[0].to),
            from: myAddrChecksum,
            value: web3.utils.toWei(toSendTxns[0].amountInOne, 'ether'),
          })
          .on('confirmation', (confirmationNumber: number, receipt: object) => {
            resolveSettle(group.id).then((res) => {
              if (res.status === 200) {
                setForceRerender(!forceRerender)
              } else {
                alert("Error when updating group transactions");
              }
            }).catch((err) => {
              alert("Error when updating group transactions");
            });
            console.log({ receipt, confirmationNumber });
          })
          .on('error', (error: Error) => {
            alert(error.message);
          });
      } else {
        // Use multisend contract to send to multiple people
        const contract = new web3.eth.Contract(contractAbi, contractAddr, { from: myAddrChecksum });
        const addrs = toSendTxns.map((txn) => web3.utils.toChecksumAddress(txn.to));
        const amounts = toSendTxns.map((txn) => web3.utils.toBN(web3.utils.toWei(txn.amountInOne, 'ether')));
        console.log(addrs, amounts);
        contract.methods
          .multiTransfer(addrs, amounts)
          .send({ from: myAddrChecksum, value: amounts.reduce((acc, amount) => acc.add(amount)) })
          .on('confirmation', (confirmationNumber: number, receipt: object) => {
            resolveSettle(group.id).then((res) => {
              if (res.status === 200) {
                setForceRerender(!forceRerender)
              } else {
                alert("Error when updating group transactions");
              }
            }).catch((err) => {
              alert("Error when updating group transactions");
            });
            console.log({ receipt, confirmationNumber });
          })
          .on('error', (error: Error) => {
            alert(error.message);
          });
      }
    }
  };

  let userBalance = 0;
  if (settle !== null && providedWeb3 !== null) {
    for (let debt of settle.debts) {
      let amt = Number(debt.net_owed);
      if (debt.creditor === providedWeb3.account) {
        userBalance += amt;
      }
      if (debt.debtor === providedWeb3.account) {
        userBalance -= amt;
      }
    }
  }

  let numTxns = 0;
  let totalExpenses = 0;
  if (txns !== null && providedWeb3 !== null) {
    numTxns = txns.length;
    for (let txn of txns) {
      for (let split of txn.splits) {
        if (split.user === providedWeb3.account) {
          totalExpenses += Number(split.share);
        }
      }
    }
  }


  return (
    <div className="w-full border-solid border-2 border-neutral-300 dark:border-slate-700 rounded-xl py-4">
      <div className="grid grid-cols-5 items-center">
        <div className="flex flex-col col-span-1 mt-2 ml-4">
          <h3 className="ml-3 text-md font-medium text-gray-500 dark:text-slate-400 text-left">
            {userBalance === 0 ? 'No Balance' : (userBalance < 0 ? 'You owe' : 'You are owed')}
          </h3>
          <span className="flex flex-row ml-3 my-2 space-x-2 items-center">
            <ChartPieIcon className={`h-6 w-6  ${userBalance < 0 ? 'text-red-500' : 'text-green-600'}`} />
            <h3 className="text-2xl text-gray-800 dark:text-slate-200 font-semibold">
              {userBalance < 0 ? (-1 * userBalance).toFixed(2) : userBalance.toFixed(2)} {group?.currency}
            </h3>
          </span>
        </div>

        <div className="flex flex-col col-span-1 mt-2 ml-4">
          <h3 className="ml-3 text-md font-medium text-gray-500 dark:text-slate-400">Your total expenses</h3>
          <span className="flex flex-row ml-3 my-2 space-x-2 items-center">
            <CurrencyDollarIcon className="h-6 w-6" />
            <h3 className="text-2xl text-gray-800 dark:text-slate-200 font-semibold">
              {totalExpenses.toFixed(2)} {group?.currency}
            </h3>
          </span>
        </div>

        <div className="flex flex-col col-span-1 mt-2 ml-4">
          <h3 className="ml-3 text-md font-medium text-gray-500 dark:text-slate-400">Total transactions</h3>
          <span className="flex flex-row ml-3 my-2 space-x-2 items-center">
            <DocumentTextIcon className="h-6 w-6" />
            <h3 className="text-2xl text-gray-800 dark:text-slate-200 font-semibold">{numTxns}</h3>
          </span>
        </div>

        <AppButton
          className="text-slate-100 font-medium col-start-5 mr-9"
          clickHandler={settleUp}
          isDisabled={providedWeb3 === null || settle === null || providedWeb3.account === null}
        >
          Settle Up
        </AppButton>
      </div>
    </div>
  );
};

export default GroupStats;
