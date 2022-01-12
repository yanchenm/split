import { ChartPieIcon, CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/outline';
import { ProvidedWeb3 } from '../../pages/_app';
import { Group } from '../../utils/routes/group';
import { Settlement } from '../../utils/routes/settle';

import AppButton from '../ui/AppButton';

type StatProps = {
  providedWeb3: ProvidedWeb3 | null;
  group: Group | null;
  settle: Settlement | null;
};

const GroupStats: React.FC<StatProps> = ({ providedWeb3, group, settle }) => {
  const settleUp = () => {
    console.log('hello');
  };

  let userBalance = 0;
  let totalExpenses = 0;
  let numTxns = 0;
  if (settle !== null && providedWeb3 !== null) {
    numTxns = settle.debts.length;
    for (let debt of settle.debts) {
      let amt = Number(debt.net_owed);
      if (debt.creditor === providedWeb3.account) {
        userBalance += amt;
      }
      if (debt.debtor === providedWeb3.account) {
        userBalance -= amt;
        totalExpenses += amt;
      }
    }
  }

  return (
    <div className="w-full border-solid border-2 border-neutral-300 dark:border-slate-700 rounded-xl py-4">
      <div className="grid grid-cols-5 items-center">
        <div className="flex flex-col col-span-1 mt-2 ml-4">
          <h3 className="ml-3 text-md font-medium text-gray-500 dark:text-slate-400 text-left">
            {userBalance < 0 ? 'You owe' : 'You are owed'}
          </h3>
          <span className="flex flex-row ml-3 my-2 space-x-2 items-center">
            <ChartPieIcon className={`h-6 w-6  ${userBalance < 0 ? 'text-red-500' : 'text-green-600'}`} />
            <h3 className="text-2xl text-gray-800 dark:text-slate-200 font-semibold">
              {userBalance} {group?.currency}
            </h3>
          </span>
        </div>

        <div className="flex flex-col col-span-1 mt-2 ml-4">
          <h3 className="ml-3 text-md font-medium text-gray-500 dark:text-slate-400">Total Expenses</h3>
          <span className="flex flex-row ml-3 my-2 space-x-2 items-center">
            <CurrencyDollarIcon className="h-6 w-6" />
            <h3 className="text-2xl text-gray-800 dark:text-slate-200 font-semibold">{totalExpenses}</h3>
          </span>
        </div>

        <div className="flex flex-col col-span-1 mt-2 ml-4">
          <h3 className="ml-3 text-md font-medium text-gray-500 dark:text-slate-400">Total Transactions</h3>
          <span className="flex flex-row ml-3 my-2 space-x-2 items-center">
            <DocumentTextIcon className="h-6 w-6" />
            <h3 className="text-2xl text-gray-800 dark:text-slate-200 font-semibold">{numTxns}</h3>
          </span>
        </div>

        <AppButton className="text-slate-100 font-medium col-start-5 mr-9" clickHandler={settleUp}>
          Settle Up
        </AppButton>
      </div>
    </div>
  );
};

export default GroupStats;
