import type { NextPage } from 'next/types';
import { useRouter } from 'next/router';
import { DarkmodeContext } from '../../_app';

import GroupStats from '../../../components/DetailView/GroupStats';
import ExpenseList from '../../../components/DetailView/ExpensesList';

import AppButton from '../../../components/UI/AppButton';

const DetailView: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <DarkmodeContext.Consumer>
      {(darkmodeProps) => {
        return (
          <div className={`${darkmodeProps.isDarkmode ? 'dark' : ''}`}>
            <div className="bg-gray-100 dark:bg-slate-800 text-neutral-800 dark:text-slate-400 h-screen overflow-y-auto">
              <div className="text-5xl pt-10 pl-10 flex flex-row items-center justify-between">
                <h3 className="pl-10 ml-9">{id}</h3>
                <AppButton
                  className="text-slate-100 font-medium mr-16"
                  clickHandler={() => {
                    router.push('/app');
                  }}
                >
                  Back
                </AppButton>
              </div>

              <div className="flex flex-col space-x-10 ml-20 h-5/6">
                <GroupStats totalExpenses={420} numTxns={69} userBalance={420} />

                <ExpenseList />
              </div>
            </div>
          </div>
        );
      }}
    </DarkmodeContext.Consumer>
  );
};

export default DetailView;
