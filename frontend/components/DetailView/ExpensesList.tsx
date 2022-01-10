import React from 'react';

import Expense from './Expense';


const ExpenseList: React.FC = () => {

  const dummyExpenses = [
    {
      name: 'Mcdonalds',
      paidBy: 'bob',
      total: 12345.12,
      date: '2020-12-25'
    },
    {
      name: 'Canoe',
      paidBy: 'john',
      total: 12345.12,
      date: '2020-12-25'
    },
    {
      name: 'Rouge',
      paidBy: 'greg',
      total: 12345.12,
      date: '2020-12-25'
    }
  ]

  return (
    <div className="flex flex-col mt-10 pl-0 max-w-2xl">
      {/* Column names */}
      <div className="ml-2 text-slate-300 flex flex-row font-medium text-lg">
        <h1 className="pr-24">Expense</h1>
        <h1 className="px-7">Paid by</h1>
        <h1 className="px-16">Total</h1>
        <h1 className="px-5">Date</h1>
      </div>
      <div>
        {dummyExpenses.map((expense) => {
          return (
            <Expense
              name={expense.name}
              paidBy={expense.paidBy}
              total={expense.total}
              date={expense.date}
            />
          )
        })}
      </div>
    </div>
  );
};

export default ExpenseList;