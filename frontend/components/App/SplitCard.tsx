import React from 'react';
import { useRouter } from 'next/router';

import AppButton from '../UI/AppButton';

type CardProps = {
  groupId: string;
  name: string;
  currency: string;
  userBalance: number;
  lastUpdate: string;
}

type WrapperProps = {
  children: React.ReactNode;
  svgSrc: string;
}

const SplitDetail: React.FC<WrapperProps> = ({ children, svgSrc }) => {
  return (
    <span className="flex flex-row items-center py-2 pl-8">
      <img src={svgSrc} className="h-12 w-12" />
      <div className="font-medium text-xl mb-1 pl-5">{children}</div>
    </span>
  )
}

const SplitCard: React.FC<CardProps> = ({ name, userBalance, currency, lastUpdate, groupId }) => {

  const router = useRouter();

  const viewHandler = () => {
    router.push(`/app/group/${groupId}`)
  }

  return (
    <div className="rounded-lg w-64 h-64 bg-slate-900 flex flex-col m-3 text-slate-300">
      <span className="pt-2 pb-0">
        <div className="font-bold text-2xl mb-1 text-center">{name}</div>
      </span>
      
      <hr className="mx-5 my-2 w-5/6 text-slate-600" />

      <SplitDetail svgSrc="/green_dollar.svg">
        <h3 className="text-base text-slate-400">{userBalance < 0 ? "You owe" : "You are owed"}</h3> 
        {userBalance} {currency}
      </SplitDetail>

      <SplitDetail svgSrc="/calendar.svg">
        <h3 className="text-base text-slate-400">Last Change</h3>
        {lastUpdate}
      </SplitDetail>

      <span className="flex flex-row items-center justify-evenly py-4">
        <AppButton className="w-40" clickHandler={viewHandler}>View Details</AppButton>
      </span>
    </div>
  )
};

export default SplitCard;