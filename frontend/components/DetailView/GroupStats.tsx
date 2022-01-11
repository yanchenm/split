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

const SingleStat: React.FC<WrapperProps> = ({ amount, label, svgSrc }) => {
  return (
    <div className="-mt-1 mx-7 flex flex-col">
      <h3 className="text-lg text-right text-slate-400">{label}</h3>
      <span className="flex flex-row ml-2">
        <img src={svgSrc} className="h-12 w-12"/>
        <h3 className="text-3xl pl-3 pt-1 text-slate-200">{amount}</h3>
      </span>
    </div>
  )
}

// Don't know if we pass in props or fetch from db
const GroupStats: React.FC<StatProps> = ({ totalExpenses, numTxns, userBalance }) => {

  const hello = () => {
    console.log("hello");
  }

  return (
    <div className="min-w-2xl max-w-3xl h-24 mt-10 border-solid border-2 border-slate-700 rounded-xl">
      <span className="flex flex-row justify-start ml-0 h-full items-center">
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
        <span className="pl-14">
          <AppButton className="text-slate-300" clickHandler={hello}>Settle Up</AppButton>
        </span>
      </span>
    </div>
  )
};

export default GroupStats;