import { PencilIcon, TrashIcon } from '@heroicons/react/solid';

import React from 'react';
import { address_to_avatar } from '../../utils/avatar';

type ExpenseProps = {
  name: string;
  paidBy: string;
  total: number;
  date: string;
  participants: any;
};

const Expense: React.FC<ExpenseProps> = ({ name, paidBy, participants, total, date }) => {
  console.log(address_to_avatar('asdfasfds'));
  return (
    <div className="grid grid-cols-12 text-start font-normal text-gray-700 dark:text-slate-200 hover:bg-gray-200 py-3 px-4 rounded-lg">
      <h3 className="col-span-2 text-md font-bold">{name}</h3>
      <div className="col-span-1 text-md font-medium"> {paidBy} </div>
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
      <h3 className="col-span-2 text-base font-medium">{total}</h3>
      <h3 className="col-span-2 text-base font-medium">{total}</h3>
      <h3 className="col-span-2 text-base font-medium">{date}</h3>
      <h3 className="col-span-1 font-medium flex items-center space-x-5">
        <PencilIcon className="pl-1 h-5 w-5 text-gray-400 hover:text-gray-800 cursor-pointer" />
        <TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-500 cursor-pointer" />
      </h3>
    </div>
  );
};

export default Expense;
