import React, { useEffect, useState } from 'react';
import { TransactionWithSplits, deleteTransaction } from '../../utils/routes/transaction';

import Expense from './Expense';
import { Group } from '../../utils/routes/group';
import { ProvidedWeb3 } from '../../pages/_app';
import { displayAddress } from '../../utils/address';

type StatProps = {
  group: Group | null;
  txns: Array<TransactionWithSplits> | null;
  providedWeb3: ProvidedWeb3 | null;
  userMap: Record<string, string>;
  // @ts-ignore
  forceRerender;
  // @ts-ignore
  setForceRerender;
};

type ParticipantType = {
  name: string;
  portion: Number;
};

type ExpenseType = {
  _id: string;
  name: string;
  paidBy: string;
  paidById: string;
  participants: ParticipantType[];
  total: number;
  yourShare: number;
  date: string;
  currency: string;
};

const ExpenseList: React.FC<StatProps> = ({ group, txns, providedWeb3, userMap, forceRerender, setForceRerender }) => {
  const [realExpenses, setRealExpense] = useState<ExpenseType[]>([]);
  const txnExpenses: ExpenseType[] = [];

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
            portion: Number(split.share),
          });
        });
        txnExpenses.push({
          _id: txn.transaction.id,
          name: txn.transaction.name,
          paidBy: userMap[txn.transaction.paid_by],
          paidById: txn.transaction.paid_by,
          participants: _participants,
          total: Number(txn.transaction.amount),
          yourShare,
          date: txn.transaction.date.split('T')[0],
          currency: txn.transaction.currency,
        });
      }

      setRealExpense(txnExpenses);
    }
  }, [txns, group]);

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

      setRealExpense(filtered);
      setForceRerender(!forceRerender);
    });
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Column names */}
      <div className="grid grid-cols-12 text-gray-500 dark:text-slate-300 font-medium text-md p-3">
        <h3 className="flex col-span-3">
          <div className="w-1/2">Expense</div>
          <div className="w-1/2">Paid by</div>
        </h3>
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
              user_id={providedWeb3?.account}
              id={expense._id}
              //@ts-ignore
              name={expense.name}
              paidBy={expense.paidBy}
              paidById={expense.paidById}
              participants={expense.participants}
              total={expense.total}
              yourShare={expense.yourShare}
              date={expense.date}
              deleteExpenseHandler={deleteExpenseHandler}
              currency={expense.currency}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseList;
