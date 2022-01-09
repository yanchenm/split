import React from 'react';
import Button from '../Button';

type CardProps = {
  name: string;
  cost: number;
  numTxns: number;
  date: string;
}

const SplitCard: React.FC<CardProps> = ({ name, cost, numTxns, date }) => {
  const hello = () => {
    console.log("working");
  }

  return (
    <div className="rounded-lg w-64 h-90 bg-slate-900 flex flex-col m-3 text-slate-300">
      <span className="pt-4 pb-1">
        <div className="font-bold text-3xl mb-1 text-center">{name}</div>
      </span>
      
      <hr className="mx-5 my-2 w-5/6 text-slate-600" />

      <span className="flex flex-row items-center py-3 pl-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="#05B914">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="font-medium text-2xl mb-1 pl-5">{cost} USD</div>
      </span>

      <span className="flex flex-row items-center py-3 pl-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div className="font-medium text-2xl mb-1 pl-5">{numTxns}<h3 className="text-base">Transactions</h3></div>
      </span>

      <span className="flex flex-row items-center py-3 pl-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-11 w-11 pl-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <div className="font-medium text-xl mb-1 pl-5">{date}<h3 className="text-base">Last Change</h3></div>
      </span>

      <span className="flex flex-row items-center justify-evenly py-4">
        <button className="bg-violet-900 hover:bg-violet-800 text-base px-6 rounded h-8">
          Edit
        </button>
        <button className="bg-violet-900 hover:bg-violet-800 text-base px-6 rounded h-8">
          View
        </button>
      </span>
    </div>
  )
};

export default SplitCard;

/*
        */