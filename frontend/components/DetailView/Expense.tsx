import React from 'react';

type ExpenseProps = {
  name: string;
  paidBy: string;
  total: number;
  date: string;
  participants: any;
}

const Expense: React.FC<ExpenseProps> = ({ name, paidBy, participants, total, date }) => {

  return (
    <div className="py-5 grid grid-cols-12 text-start font-normal text-gray-700 dark:text-slate-200">
      <h3 className="col-span-2 text-xl font-bold">{ name }</h3>
      <div className="col-span-1 text-xl font-medium"> { paidBy } </div>
      <div className="col-span-5 flex flex-row ml-4">
        {
          participants.map((person: any) => {
            return (
              <span className="mr-auto text-start" key={person.name}> {/* FIX KEY */}
                <h3 className="dark:text-slate-400">{person.name}</h3>
                <h3 className="text-lg font-medium dark:text-slate-200">${(person.portion*total).toFixed(2)}</h3>
              </span>
            )
          })
        }
      </div>
      <h3 className="col-span-1 text-base font-medium col-start-10">{ total }</h3>
      <h3 className="col-span-2 text-base font-medium">{ date }</h3>
    </div>
  );
};

export default Expense;
