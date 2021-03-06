import { DarkmodeContext, W3Context } from '../../_app';
import { Group, getGroup, getUsersInGroup } from '../../../utils/routes/group';
import { PlusIcon, ShareIcon } from '@heroicons/react/outline';
import { Settlement, getSettlementsForGroup } from '../../../utils/routes/settle';
import { TransactionWithSplits, getTransactionsByGroupWithSplits } from '../../../utils/routes/transaction';
import { useEffect, useState } from 'react';

import ExpenseList from '../../../components/detailview/ExpensesList';
import GroupStats from '../../../components/detailview/GroupStats';
import Head from 'next/head';
import NewInviteModal from '../../../components/detailview/NewInviteModal';
import NewTransactionModal from '../../../components/detailview/NewTransactionModal';
import type { NextPage } from 'next/types';
import Sidebar from '../../../components/app/Sidebar';
import { useRouter } from 'next/router';

const DetailView: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [group, setGroup] = useState<Group | null>(null);
  const [settle, setSettle] = useState<Settlement | null>(null);
  const [txns, setTxns] = useState<Array<TransactionWithSplits> | null>(null);
  const [forceRerender, setForceRerender] = useState<boolean>(false);
  const [isNewTxnModalOpen, setIsNewTxnModalOpen] = useState(false);
  const [isNewInviteModalOpen, setIsNewInviteModalOpen] = useState(false);

  const openNewInviteModal = () => {
    setIsNewInviteModalOpen(true);
  };

  const closeNewInviteModal = () => {
    setIsNewInviteModalOpen(false);
  };
  const [userMap, setUserMap] = useState<Record<string, string>>({});

  const openNewTxnModal = () => {
    setIsNewTxnModalOpen(true);
  };

  const closeNewTxnModal = () => {
    setIsNewTxnModalOpen(false);
  };

  const forceRerenderPage = () => {
    setForceRerender(!forceRerender);
  };

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
    // @ts-ignore
    getUsersInGroup(id).then((res) => {
      if (mounted) {
        // @ts-ignore
        const users = res.data.reduce((map, user) => {
          map[user.address] = user.username;
          return map;
        }, {} as Record<string, string>);
        setUserMap(users);
      }
    });
    return () => {
      mounted = false;
    };
  }, [id, forceRerender]);

  return (
    <>
      <Head>
        <title>WheresMyMoney</title>
      </Head>
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
                          <div className="flex flex-row justify-between w-full">
                            <h3 className="text-3xl font-semibold mt-9 w-full">{group?.name}</h3>
                            <div className="flex flex-row mt-9 space-x-3 items-center">
                              <ShareIcon
                                className="h-8 w-8 hover:text-violet-600 cursor-pointer"
                                onClick={openNewInviteModal}
                              />
                              <PlusIcon
                                className="h-10 w-10 hover:text-violet-600 cursor-pointer"
                                onClick={openNewTxnModal}
                              />
                            </div>
                          </div>
                          <GroupStats
                            providedWeb3={consumerProps}
                            group={group}
                            settle={settle}
                            txns={txns}
                            setForceRerender={setForceRerender}
                            forceRerender={forceRerender}
                          />
                          {group && Object.keys(userMap).length > 0 && (
                            <ExpenseList
                              group={group}
                              txns={txns}
                              providedWeb3={consumerProps}
                              userMap={userMap}
                              forceRerender={forceRerender}
                              setForceRerender={setForceRerender}
                            />
                          )}

                          {group && (
                            <NewTransactionModal
                              groupId={group.id}
                              isOpen={isNewTxnModalOpen}
                              closeModal={closeNewTxnModal}
                              openModal={openNewTxnModal}
                              onDone={forceRerenderPage}
                              currency={group.currency}
                            />
                          )}
                          {group && (
                            <NewInviteModal
                              groupId={group.id}
                              isOpen={isNewInviteModalOpen}
                              closeModal={closeNewInviteModal}
                              openModal={openNewInviteModal}
                            />
                          )}
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
    </>
  );
};

export default DetailView;
