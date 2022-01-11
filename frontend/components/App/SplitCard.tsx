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
    <span className="flex flex-row items-center py-2 pt-0 pl-8">
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
    <div className="bg-gray-100 dark:bg-slate-900 dark:text-slate-300 rounded-lg w-64 h-64 flex flex-col m-3  grow-0">
      <span className="pt-3 pb-2">
        <div className="font-bold text-2xl mb-1 text-center">{name}</div>
      </span>
      
      <hr className="mx-5 py-2 w-5/6" />

      <SplitDetail svgSrc={userBalance < 0 ? "/red_dollar.svg" : "/green_dollar.svg"}>
        <h3 className="dark:text-slate-400 text-sm">{userBalance < 0 ? "You owe" : "You are owed"}</h3> 
        {userBalance} {currency}
      </SplitDetail>

      <SplitDetail svgSrc="/calendar.svg">
        <h3 className="dark:text-slate-400 text-sm ">Last Change</h3>
        {lastUpdate}
      </SplitDetail>

      <span className="flex flex-row items-center justify-evenly pt-2 pb-7">
        <AppButton className="w-40 text-gray-100" clickHandler={viewHandler}>View Details</AppButton>
      </span>
    </div>
  )
};

export default SplitCard;