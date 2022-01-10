import type { NextPage } from 'next/types';
import { useRouter } from 'next/router';

import GroupStats from '../../../components/DetailView/GroupStats';
import Expense from '../../../components/DetailView/Expense';
import ExpenseList from '../../../components/DetailView/ExpensesList';

const DetailView: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="bg-slate-800 text-slate-400 min-h-screen">
      <div className="text-5xl pt-10 pl-10">
         Viewing {id}
      </div>

      <div className="flex flex-col space-x-10 ml-20">
        <GroupStats totalExpenses={420} numTxns={69} userBalance={420}/>

        <ExpenseList />

      </div>
    </div>
  )
};

export default DetailView;

