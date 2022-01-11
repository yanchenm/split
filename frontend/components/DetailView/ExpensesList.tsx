import React from 'react';

import Expense from './Expense';


const ExpenseList: React.FC = () => {

  const dummyExpenses = [
    {
      _id: 'a',
      name: 'Mcdonalds',
      paidBy: 'bob',
      participants: [{name:'bob',portion:0.1},{name:'a',portion:0.2},{name:'b',portion:0.4},{name:'c',portion:0.3}],
      total: 12345.12,
      date: '2022-01-01'
    },
    {
      _id: 'b',
      name: 'Canoe',
      paidBy: 'john',
      participants: [{name:'john',portion:0.1},{name:'a',portion:0.2},{name:'b',portion:0.4},{name:'c',portion:0.3}],
      total: 12345.12,
      date: '2022-01-02'
    },
    {
      _id: 'c',
      name: 'Rouge',
      paidBy: 'greg',
      participants: [{name:'greg',portion:0.1},{name:'a',portion:0.2},{name:'b',portion:0.4},{name:'c',portion:0.3}],
      total: 12345.12,
      date: '2022-01-03'
    },
    {
      _id: 'd',
      name: 'Wendys',
      paidBy: 'mary',
      participants: [{name:'mary',portion:0.1},{name:'a',portion:0.2},{name:'b',portion:0.4},{name:'c',portion:0.3}],
      total: 12345.12,
      date: '2022-01-04'
    },
    {
      _id: 'e',
      name: 'Hayden Block',
      paidBy: 'jon',
      participants: [{name:'jon',portion:0.1},{name:'a',portion:0.2},{name:'b',portion:0.4},{name:'c',portion:0.3}],
      total: 12345.12,
      date: '2022-01-05'
    },
    {
      _id: 'f',
      name: 'Rouge',
      paidBy: 'andy',
      participants: [{name:'andy',portion:0.1},{name:'a',portion:0.2},{name:'b',portion:0.4},{name:'c',portion:0.3}],
      total: 12345.12,
      date: '2022-01-06'
    },
    {
      _id: 'g',
      name: 'Rouge',
      paidBy: 'andy',
      participants: [{name:'andy',portion:0.1},{name:'a',portion:0.2},{name:'b',portion:0.4},{name:'c',portion:0.3}],
      total: 12345.12,
      date: '2022-01-06'
    },
    {
      _id: 'h',
      name: 'Rouge',
      paidBy: 'andy',
      participants: [{name:'andy',portion:0.1},{name:'a',portion:0.2},{name:'b',portion:0.4},{name:'c',portion:0.3}],
      total: 12345.12,
      date: '2022-01-06'
    },
    {
      _id: 'i',
      name: 'Rouge',
      paidBy: 'andy',
      participants: [{name:'andy',portion:0.1},{name:'a',portion:0.2},{name:'b',portion:0.4},{name:'c',portion:0.3}],
      total: 12345.12,
      date: '2022-01-06'
    },
    {
      _id: 'j',
      name: 'Rouge',
      paidBy: 'andy',
      participants: [{name:'andy',portion:0.1},{name:'a',portion:0.2},{name:'b',portion:0.4},{name:'c',portion:0.3}],
      total: 12345.12,
      date: '2022-01-06'
    },
    {
      _id: 'k',
      name: 'Rouge',
      paidBy: 'andy',
      participants: [{name:'andy',portion:0.1},{name:'a',portion:0.2},{name:'b',portion:0.4},{name:'c',portion:0.3}],
      total: 12345.12,
      date: '2022-01-06'
    },
  ]

  return (
    <div className="flex flex-col mt-10 pl-0 max-w-5xl h-3/4 pb-8">
      {/* Column names */}
      <div className="pl-5 grid grid-cols-12 text-slate-300 font-normal text-lg">
        <h1 className="col-span-2">Expense</h1>
        <h1 className="col-span-1">Paid by</h1>
        <h1 className="col-span-5 ml-4">Participants</h1>
        <h1 className="col-span-1 col-start-10">Total</h1>
        <h1>Date</h1>
      </div>
      <hr className="my-2 w-full" />
      <div className="pl-5 divide-y divide-slate-500 overflow-y-auto shadow-xl shadow-slate-900 rounded-xl">
        {dummyExpenses.map((expense) => {
          return (
            <Expense
              key={expense._id}
              name={expense.name}
              paidBy={expense.paidBy}
              participants={expense.participants}
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
