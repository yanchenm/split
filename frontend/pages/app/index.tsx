import { DarkmodeContext, ProvidedWeb3 } from '../_app';
import NewCard from '../../components/app/NewCard';
import type { NextPage } from 'next';
import Sidebar from '../../components/app/Sidebar';
import SplitCard from '../../components/app/SplitCard';
import { getGroupsByUser } from '../../utils/routes/group';
import { getSettlementsForGroup } from '../../utils/routes/settle';
import type { Group } from '../../utils/routes/group';
import { useEffect, useState } from 'react';
import ReactLoading from 'react-loading';
import NewGroupModal from '../../components/app/NewGroupModal';

type GroupWithBalance = {
  group: Group;
  userBalance: number;
};

type PageProps = {
  providedWeb3: ProvidedWeb3 | null;
};

const Dashboard: NextPage<PageProps> = ({ ...props }) => {
  const { providedWeb3 } = props;
  const [splitGroups, setSplitGroups] = useState<Array<Group>>([]);
  const [splitGroupsWithBalance, setSplitGroupsWithBalance] = useState<Array<GroupWithBalance>>([]);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);

  const openNewGroupModal = () => {
    setIsNewGroupModalOpen(true);
  };
  const closeNewGroupModal = () => {
    setIsNewGroupModalOpen(false);
  };

  useEffect(() => {
    let mounted = true;
    getGroupsByUser().then((res) => {
      if (mounted) {
        setSplitGroups(res.data);
      }
    })
    return () => {
      mounted = false
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    let promises = splitGroups.map((group) => getSettlementsForGroup(group.id));
    Promise.all(promises).then((resps) => {
      if (mounted) {
        console.log(resps);
        const idToGroup: any = {};
        splitGroups.forEach((group) => (idToGroup[group.id] = group));
        setSplitGroupsWithBalance(
          resps.map((res) => {
            let totalOwed = 0;
            let group_id = res.data.group_id;
            if (providedWeb3 && providedWeb3.account) {
              for (let debt of res.data.debts) {
                if (debt.creditor === providedWeb3.account) {
                  totalOwed += Number(debt.net_owed);
                }
                if (debt.debtor === providedWeb3.account) {
                  totalOwed -= Number(debt.net_owed);
                }
              }
            }
            return {
              group: idToGroup[group_id],
              userBalance: totalOwed,
            };
          })
        );
      }
    });
    return () => {
      mounted = false
    };
  }, [splitGroups, providedWeb3]);

  console.log({ splitGroupsWithBalance });

  return (
    <DarkmodeContext.Consumer>
      {(darkmodeProps) => {
        return (
          <div className={`min-h-screen flex ${darkmodeProps.isDarkmode ? 'dark' : ''}`}>
            <Sidebar />

            {/* Content */}
            <div className="bg-white text-neutral-800 dark:bg-slate-800 dark:text-white flex-1 p-10 text-2xl font-bold h-screen transition duration-200">
              Current Groups
              <div className="bg-white dark:bg-slate-800 dark:shadow-slate-900 mt-10 flex flex-row flex-wrap h-5/6 rounded-xl content-start">
                {splitGroups.length === 0 ? (
                  <ReactLoading />
                ) : splitGroups.length > splitGroupsWithBalance.length ? (
                  splitGroups.map((split) => {
                    return (
                      <SplitCard
                        key={split.id}
                        groupId={split.id}
                        name={split.name}
                        currency={split.currency}
                        lastUpdate={split.updated_at.split('T')[0]}
                      />
                    );
                  })
                ) : (
                  splitGroupsWithBalance.map((split) => {
                    return (
                      <SplitCard
                        key={split.group.id}
                        groupId={split.group.id}
                        name={split.group.name}
                        currency={split.group.currency}
                        userBalance={split.userBalance}
                        lastUpdate={split.group.updated_at.split('T')[0]}
                      />
                    );
                  })
                )}
                <NewCard clickHandler={openNewGroupModal}/>
              </div>
            </div>
            <NewGroupModal isOpen={isNewGroupModalOpen} closeModal={closeNewGroupModal} openModal={openNewGroupModal} />
          </div>
        );
      }}
    </DarkmodeContext.Consumer>
  );
};

export default Dashboard;
