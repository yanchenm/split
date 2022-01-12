import React from 'react';
import { DocumentTextIcon, CurrencyDollarIcon, ChartPieIcon } from '@heroicons/react/outline';

import AppButton from '../UI/AppButton';

type StatProps = {
  totalExpenses: number;
  numTxns: number;
  userBalance: number;
};

const GroupStats: React.FC<StatProps> = ({ totalExpenses, numTxns, userBalance }) => {
  const hello = () => {
    console.log('hello');
  };

  return (
    <div className="max-w-5xl h-24 ml-9 mt-10 border-solid border-2 border-neutral-300 dark:border-slate-700 rounded-xl">
      <div className="grid grid-cols-5 items-center">
        <div className="flex flex-col col-span-1 mt-2 ml-4">
          <h3 className="ml-3 text-lg font-medium text-gray-500 dark:text-slate-400 text-left">
            {userBalance < 0 ? 'You owe' : 'You are owed'}
          </h3>
          <span className="flex flex-row ml-2">
            <ChartPieIcon className={`h-12 w-12  ${userBalance < 0 ? 'text-red-500' : 'text-green-600'}`} />
            <h3 className="text-3xl pl-3 pt-1 text-gray-800 dark:text-slate-200 font-semibold">{userBalance}</h3>
          </span>
        </div>

        <div className="flex flex-col col-span-1 mt-2 ml-4">
          <h3 className="ml-3 text-lg font-medium text-gray-500 dark:text-slate-400">Total Expenses</h3>
          <span className="flex flex-row ml-2">
            <CurrencyDollarIcon className="h-12 w-12" />
            <h3 className="text-3xl pl-3 pt-1 text-gray-800 dark:text-slate-200 font-semibold">{totalExpenses}</h3>
          </span>
        </div>

        <div className="flex flex-col col-span-1 mt-2 ml-4">
          <h3 className="ml-3 text-lg font-medium text-gray-500 dark:text-slate-400">Total Transactions</h3>
          <span className="flex flex-row ml-2">
            <DocumentTextIcon className="h-12 w-12" />
            <h3 className="text-3xl pl-3 pt-1 text-gray-800 dark:text-slate-200 font-semibold">{numTxns}</h3>
          </span>
        </div>

        <AppButton className="text-slate-100 font-medium col-start-5 mr-9 mt-2" clickHandler={hello}>
          Settle Up
        </AppButton>
      </div>
    </div>
  );
};

export default GroupStats;
