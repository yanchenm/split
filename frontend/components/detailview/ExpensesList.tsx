import Expense from './Expense';
import React from 'react';
import { Group } from '../../utils/routes/group';
import { TransactionWithSplits } from '../../utils/routes/transaction';
import {displayAddress} from '../../utils/address';
import { ProvidedWeb3 } from '../../pages/_app';
import { deleteTransaction } from '../../utils/routes/transaction';
import { useState } from 'react';
import { useEffect } from 'react';

type StatProps = {
  group: Group | null;
  txns: Array<TransactionWithSplits> | null;
  providedWeb3: ProvidedWeb3 | null;
};

type ParticipantType = {
  name: string,
  portion: Number
};

type ExpenseType = {
  _id: string,
  name: string,
  paidBy: string,
  participants: ParticipantType[],
  total: number,
  yourShare: number,
  date: string
};


const ExpenseList: React.FC<StatProps> = ({group, txns, providedWeb3}) => {
  const [realExpenses, setRealExpense] = useState<ExpenseType[]>([]);
  const txnExpenses: ExpenseType[] = []

  useEffect(() => {
    if (group && txns && providedWeb3) {
      for (let txn of txns) {
        const _participants: ParticipantType[] = [];
        let yourShare = 0;
        txn.splits.forEach((split) => {
          if (split.user === providedWeb3.account) {
            yourShare = Number(split.share);
          }
          _participants.push({
            name: displayAddress(split.user),
            portion: Number(split.share)
          });
        })
        txnExpenses.push({
          _id: txn.transaction.id,
          name: txn.transaction.name,
          paidBy: displayAddress(txn.transaction.paid_by),
          participants: _participants,
          total: Number(txn.transaction.amount),
          yourShare,
          date: txn.transaction.date.split("T")[0]
        })
      }
  
      setRealExpense(txnExpenses);
    }
  }, [txns, group])

  // Sample expense
  /*
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
  }
  */

  const deleteExpenseHandler = (id: string) => {
    deleteTransaction(id).then(() => {
      let filtered = realExpenses.filter((expense) => {
        return expense._id != id;
      });

      console.log(filtered)
      setRealExpense(filtered)

      // setRealExpense(realExpenses.filter((expense) => {
      //   return expense._id != id;
      // }))
    })
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Column names */}
      <div className="grid grid-cols-12 text-gray-500 dark:text-slate-300 font-medium text-md p-3">
        <h1 className="col-span-2">Expense</h1>
        <h1 className="col-span-1">Paid by</h1>
        <h1 className="col-span-2">Participants</h1>
        <h1 className="col-span-2">Total</h1>
        <h1 className="col-span-2 -ml-1">Your Share</h1>
        <h1 className="col-span-2">Date</h1>
        <h1 className="col-span-1">Actions</h1>
      </div>
      <div className="overflow-y-auto dark:shadow-slate-900">
        {realExpenses.map((expense) => {
          return (
            <Expense
              key={expense._id}
              id={expense._id}
              name={expense.name}
              paidBy={expense.paidBy}
              participants={expense.participants}
              total={expense.total}
              yourShare={expense.yourShare}
              date={expense.date}
              deleteExpenseHandler={deleteExpenseHandler}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseList;
