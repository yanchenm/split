import { DarkmodeContext, W3Context } from '../../_app';
import ExpenseList from '../../../components/detailview/ExpensesList';
import GroupStats from '../../../components/detailview/GroupStats';
import type { NextPage } from 'next/types';
import Sidebar from '../../../components/app/Sidebar';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Group, getGroup } from '../../../utils/routes/group';
import { Settlement, getSettlementsForGroup } from '../../../utils/routes/settle';
import { TransactionWithSplits, getTransactionsByGroupWithSplits } from '../../../utils/routes/transaction';

const DetailView: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [group, setGroup] = useState<Group | null>(null);
  const [settle, setSettle] = useState<Settlement | null>(null);
  const [txns, setTxns] = useState<Array<TransactionWithSplits> | null>(null);
  const [forceRerender, setForceRerender] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    if (typeof id !== 'string') {
      return;
    }
    getGroup(id).then((res) => {
      if (mounted) {
        setGroup(res.data);
      }
    });
    getSettlementsForGroup(id).then((res) => {
      if (mounted) {
        setSettle(res.data);
      }
    });
    getTransactionsByGroupWithSplits(id).then((res) => {
      if (mounted) {
        setTxns(res.data);
      }
    });
    return () => {
      mounted = false;
    };
  }, [id, forceRerender]);

  return (
    <W3Context.Consumer>
      {(consumerProps) => {
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
                        <GroupStats providedWeb3={consumerProps} group={group} settle={settle} txns={txns} setForceRerender={setForceRerender} forceRerender={forceRerender}/>
                        <ExpenseList group={group} txns={txns} providedWeb3={consumerProps}/>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          </DarkmodeContext.Consumer>
        );
      }}
    </W3Context.Consumer>
  );
};

export default DetailView;
