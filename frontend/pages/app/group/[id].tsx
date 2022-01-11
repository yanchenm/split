import type { NextPage } from 'next/types';
import { useRouter } from 'next/router';

import GroupStats from '../../../components/DetailView/GroupStats';
import ExpenseList from '../../../components/DetailView/ExpensesList';

import AppButton from '../../../components/UI/AppButton';

const DetailView: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="bg-slate-800 text-slate-400 h-screen">
      <div className="text-5xl pt-10 pl-10 flex flex-row items-center justify-between">
         <h3 className="pl-10 text-slate-100 ml-9">{id}</h3>
         <AppButton className="mr-16 text-slate-300" clickHandler={() => {router.push('/app')}}>Back</AppButton>
      </div>

      <div className="flex flex-col space-x-10 ml-20 h-5/6">
        <GroupStats totalExpenses={420} numTxns={69} userBalance={420}/>

        <ExpenseList />

      </div>
    </div>
  )
};

export default DetailView;

