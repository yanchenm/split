import React from 'react';

type CardProps = {
  name: string;
  cost: number;
  numTxns: number;
  date: string;
}

type WrapperProps = {
  children: React.ReactNode;
  svgSrc: string;
}

const DetailWrapper: React.FC<WrapperProps> = ({ children, svgSrc }) => {
  return (
    <span className="flex flex-row items-center py-3 pl-8">
      <img src={svgSrc} className="h-12 w-12" />
      <div className="font-medium text-2xl mb-1 pl-5">{children}</div>
    </span>
  )
}

const CardButton: React.FC = ({ children }) => {
  return (
    <button className="bg-violet-900 hover:bg-violet-800 text-base px-6 rounded h-8">
      {children}
    </button>
  )
}

const SplitCard: React.FC<CardProps> = ({ name, cost, numTxns, date }) => {
  return (
    <div className="rounded-lg w-64 h-90 bg-slate-900 flex flex-col m-3 text-slate-300">
      <span className="pt-4 pb-1">
        <div className="font-bold text-3xl mb-1 text-center">{name}</div>
      </span>
      
      <hr className="mx-5 my-2 w-5/6 text-slate-600" />

      <DetailWrapper svgSrc="/dollar.svg">
        {cost} USD
      </DetailWrapper>

      <DetailWrapper svgSrc="/document_stats.svg">
        {numTxns}
        <h3 className="text-base">Transactions</h3>
      </DetailWrapper>

      <DetailWrapper svgSrc="/calendar.svg">
        {date}
        <h3 className="text-base">Last Change</h3>
      </DetailWrapper>

      <span className="flex flex-row items-center justify-evenly py-4">
        <CardButton>Edit</CardButton>
        <CardButton>View</CardButton>
      </span>
    </div>
  )
};

export default SplitCard;

/*
        */