import { DarkmodeContext } from '../../_app';
import ExpenseList from '../../../components/DetailView/ExpensesList';
import GroupStats from '../../../components/DetailView/GroupStats';
import type { NextPage } from 'next/types';
import Sidebar from '../../../components/App/Sidebar';
import { useRouter } from 'next/router';

const DetailView: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <DarkmodeContext.Consumer>
      {(darkmodeProps) => {
        return (
          <div className={`${darkmodeProps.isDarkmode ? 'dark' : ''} font-default`}>
            <div className="flex flex-row bg-white dark:bg-slate-800 text-neutral-800 dark:text-slate-400 h-screen w-full">
              <Sidebar />
              <div className="flex flex-row w-full justify-center overflow-y-auto">
                <div className="flex flex-col space-y-10 w-11/12 items-center">
                  <h3 className="text-3xl font-semibold mt-9 w-full">{'Test Trip'}</h3>
                  <GroupStats totalExpenses={420} numTxns={69} userBalance={420} />
                  <ExpenseList />
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </DarkmodeContext.Consumer>
  );
};

export default DetailView;
