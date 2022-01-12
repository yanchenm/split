import React from 'react';

import AppButton from '../UI/AppButton';

type StatProps = {
  totalExpenses: number;
  numTxns: number;
  userBalance: number;
}

type WrapperProps = {
  amount: number;
  label: string;
  svgSrc: string;
}

const SingleStat: React.FC<WrapperProps> = ({ amount, label, svgSrc}) => {
  return (
    <div className="flex flex-col col-span-1 mt-2 ml-4">
      <h3 className="ml-10 text-lg font-medium text-gray-500 dark:text-slate-400">{label}</h3>
      <span className="flex flex-row ml-2">
        <img src={svgSrc} className="h-12 w-12"/>
        <h3 className="text-3xl pl-3 pt-1 text-gray-800 dark:text-slate-200 font-semibold">{amount}</h3>
      </span>
    </div>

  )
}

const GroupStats: React.FC<StatProps> = ({ totalExpenses, numTxns, userBalance }) => {

  const hello = () => {
    console.log("hello");
  }

  return (
    <div className="max-w-5xl h-24 ml-9 mt-10 border-solid border-2 border-neutral-300 dark:border-slate-700 rounded-xl">
      <div className="grid grid-cols-5 items-center">
        <SingleStat 
          svgSrc={userBalance > 0 ? '/green_dollar.svg' : '/red_dollar.svg'}
          label='Your Total'
          amount={userBalance} 
        />
        <SingleStat 
          svgSrc='/cake.svg'
          label='Total Expenses'
          amount={totalExpenses} 
        />
        <SingleStat 
          svgSrc='/plus.svg'
          label='Total Transactions'
          amount={numTxns} 
        />
        <AppButton className="text-slate-100 font-medium col-start-5 mr-9 mt-2" clickHandler={hello}>Settle Up</AppButton>
      </div>
    </div>
  )
};

export default GroupStats;