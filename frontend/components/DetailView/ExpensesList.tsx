import Expense from './Expense';
import React from 'react';

const ExpenseList: React.FC = () => {
  const dummyExpenses = [
    {
      _id: 'a',
      name: 'Mcdonalds',
      paidBy: 'bob',
      participants: [
        { name: 'bob', portion: 0.1 },
        { name: 'a', portion: 0.2 },
        { name: 'b', portion: 0.4 },
        { name: 'c', portion: 0.3 },
      ],
      total: 12345.12,
      date: '2022-01-01',
    },
    {
      _id: 'b',
      name: 'Canoe',
      paidBy: 'john',
      participants: [
        { name: 'john', portion: 0.1 },
        { name: 'a', portion: 0.2 },
        { name: 'b', portion: 0.4 },
        { name: 'c', portion: 0.3 },
      ],
      total: 12345.12,
      date: '2022-01-02',
    },
    {
      _id: 'c',
      name: 'Rouge',
      paidBy: 'greg',
      participants: [
        { name: 'greg', portion: 0.1 },
        { name: 'a', portion: 0.2 },
        { name: 'b', portion: 0.4 },
        { name: 'c', portion: 0.3 },
      ],
      total: 12345.12,
      date: '2022-01-03',
    },
    {
      _id: 'd',
      name: 'Wendys',
      paidBy: 'mary',
      participants: [
        { name: 'mary', portion: 0.1 },
        { name: 'a', portion: 0.2 },
        { name: 'b', portion: 0.4 },
        { name: 'c', portion: 0.3 },
      ],
      total: 12345.12,
      date: '2022-01-04',
    },
    {
      _id: 'e',
      name: 'Hayden Block',
      paidBy: 'jon',
      participants: [
        { name: 'jon', portion: 0.1 },
        { name: 'a', portion: 0.2 },
        { name: 'b', portion: 0.4 },
        { name: 'c', portion: 0.3 },
      ],
      total: 12345.12,
      date: '2022-01-05',
    },
    {
      _id: 'f',
      name: 'Rouge',
      paidBy: 'andy',
      participants: [
        { name: 'andy', portion: 0.1 },
        { name: 'a', portion: 0.2 },
        { name: 'b', portion: 0.4 },
        { name: 'c', portion: 0.3 },
      ],
      total: 12345.12,
      date: '2022-01-06',
    },
    {
      _id: 'g',
      name: 'Rouge',
      paidBy: 'andy',
      participants: [
        { name: 'andy', portion: 0.1 },
        { name: 'a', portion: 0.2 },
        { name: 'b', portion: 0.4 },
        { name: 'c', portion: 0.3 },
      ],
      total: 12345.12,
      date: '2022-01-06',
    },
    {
      _id: 'h',
      name: 'Rouge',
      paidBy: 'andy',
      participants: [
        { name: 'andy', portion: 0.1 },
        { name: 'a', portion: 0.2 },
        { name: 'b', portion: 0.4 },
        { name: 'c', portion: 0.3 },
      ],
      total: 12345.12,
      date: '2022-01-06',
    },
    {
      _id: 'i',
      name: 'Rouge',
      paidBy: 'andy',
      participants: [
        { name: 'andy', portion: 0.1 },
        { name: 'a', portion: 0.2 },
        { name: 'b', portion: 0.4 },
        { name: 'c', portion: 0.3 },
      ],
      total: 12345.12,
      date: '2022-01-06',
    },
    {
      _id: 'j',
      name: 'Rouge',
      paidBy: 'andy',
      participants: [
        { name: 'andy', portion: 0.1 },
        { name: 'a', portion: 0.2 },
        { name: 'b', portion: 0.4 },
        { name: 'c', portion: 0.3 },
      ],
      total: 12345.12,
      date: '2022-01-06',
    },
    {
      _id: 'k',
      name: 'Rouge',
      paidBy: 'andy',
      participants: [
        { name: 'andy', portion: 0.1 },
        { name: 'a', portion: 0.2 },
        { name: 'b', portion: 0.4 },
        { name: 'c', portion: 0.3 },
      ],
      total: 12345.12,
      date: '2022-01-06',
    },
  ];

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Column names */}
      <div className="grid grid-cols-12 text-gray-500 dark:text-slate-300 font-medium text-md p-3">
        <h1 className="col-span-2">Expense</h1>
        <h1 className="col-span-1">Paid by</h1>
        <h1 className="col-span-2">Participants</h1>
        <h1 className="col-span-2">Total</h1>
        <h1 className="col-span-2">Your Share</h1>
        <h1 className="col-span-2">Date</h1>
        <h1 className="col-span-1">Actions</h1>
      </div>
      <div className="overflow-y-auto dark:shadow-slate-900">
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
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseList;
