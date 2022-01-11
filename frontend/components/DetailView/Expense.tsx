import React from 'react';

type ExpenseProps = {
  name: string;
  paidBy: string;
  total: number;
  date: string;
}

const Expense: React.FC<ExpenseProps> = ({ name, paidBy, total, date }) => {

  return (
    <div>
      <hr className="my-2 w-full slate-600" />
      <div className="my-5 grid grid-cols-4 text-start">
        <h3>{ name }</h3>
        <div>
          { paidBy }
        </div>
        <h3>{ total }</h3>
        <h3>{ date }</h3>
      </div>
    </div>
  );
};

export default Expense;
