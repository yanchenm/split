import { PencilIcon, TrashIcon } from '@heroicons/react/solid';

import React from 'react';
import { address_to_avatar } from '../../utils/avatar';
import { displayAddress } from '../../utils/address';

type ExpenseProps = {
  id: string;
  user_id: string | null | undefined,
  user_name: string;
  paidBy: string;
  paidById: string;
  total: number;
  yourShare: number;
  date: string;
  participants: any;
  deleteExpenseHandler: (id: string) => void;
};

const Expense: React.FC<ExpenseProps> = ({
  user_id,
  id,
  //@ts-ignore
  name,
  paidBy,
  paidById,
  participants,
  total,
  yourShare,
  date,
  deleteExpenseHandler,
}) => {
  return (
    <div className="grid grid-cols-12 text-start font-normal text-gray-700 dark:text-slate-200 hover:bg-gray-200 py-3 px-4 rounded-lg">
      <h3 className="flex col-span-3 text-md truncate">
        <div className="w-1/2 font-bold truncate pr-3">{name}</div>
        <div className="w-1/2 font-medium pr-3 truncate">{paidBy}</div>
      </h3>
      <div className="col-span-2 flex flex-row space-x-1">
        {participants.map((person: any) => {
          return (
            <span className="text-start" key={person.name}>
              <img
                className="h-7 w-7"
                src={`data:image/svg+xml;utf8,${encodeURIComponent(address_to_avatar(person.name))}`}
              />
            </span>
          );
        })}
      </div>
      <h3 className="col-span-2 text-base font-medium">{total.toFixed(2)}</h3>
      <h3 className="col-span-2 text-base font-medium">{yourShare.toFixed(2)}</h3>
      <h3 className="col-span-2 text-base font-medium">{date}</h3>
      <h3 className="col-span-1 font-medium flex items-center space-x-5">
        <PencilIcon className="pl-1 h-5 w-5 text-gray-400 hover:text-gray-800 cursor-pointer" />
        { paidById === user_id ? <TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-500 cursor-pointer" onClick={() => {deleteExpenseHandler(id)}}/> : null }
      </h3>
    </div>
  );
};

export default Expense;
