import type { NextPage } from 'next';
import { Switch } from '@headlessui/react';
import { DarkmodeContext } from '../_app';

import SplitCard from '../../components/App/SplitCard';
import NewCard from '../../components/App/NewCard';
import Sidebar from '../../components/App/Sidebar';
import { useRouter } from 'next/router';

const splitGroups = [
  {
    groupId: 'a',
    name: 'Seattle trip',
    userBalance: 1,
    currency: 'USD',
    lastUpdate: 'Jan 1, 2022'
  },
  {
    groupId: 'b',
    name: 'Whistler trip',
    userBalance: -2,
    currency: 'CAD',
    lastUpdate: 'Jan 2, 2022'
  },
  {
    groupId: 'c',
    name: 'Sydney trip',
    userBalance: 3,
    currency: 'AUD',
    lastUpdate: 'Jan 3, 2022'
  },
  {
    groupId: 'd',
    name: 'Alabama trip',
    userBalance: -4,
    currency: 'USD',
    lastUpdate: 'Jan 4, 2022'
  },
  {
    groupId: 'e',
    name: 'Quebec trip',
    userBalance: 5,
    currency: 'CAD',
    lastUpdate: 'Jan 5, 2022'
  },
  {
    groupId: 'f',
    name: 'Lisbon trip',
    userBalance: -6,
    currency: 'USD',
    lastUpdate: 'Jan 6, 2022'
  },
  {
    groupId: 'g',
    name: 'Calgary trip',
    userBalance: 7,
    currency: 'CAD',
    lastUpdate: 'Jan 7, 2022'
  }
]

const Dashboard: NextPage = () => {

  const router = useRouter();

  return (
    <DarkmodeContext.Consumer>
      {(darkmodeProps) => {
        return (
          <div className={`min-h-screen flex ${darkmodeProps.isDarkmode ? 'dark' : ''}`}>

            <Sidebar />

            {/* Content */}
            <div className="bg-gray-100 text-neutral-800 dark:bg-slate-800 dark:text-white flex-1 p-10 text-2xl font-bold h-screen">
              Current Splits
              <div className="bg-gray-200 dark:bg-slate-800 dark:shadow-slate-900 mt-10 flex flex-row flex-wrap overflow-y-auto overflow-hidden h-5/6 shadow-xl rounded-xl content-start">
                {
                  splitGroups.map((split) => {
                    return (
                      <SplitCard
                        key={split.groupId}
                        groupId={split.groupId}
                        name={split.name}
                        currency={split.currency}
                        userBalance={split.userBalance}
                        lastUpdate={split.lastUpdate}
                      />
                    )
                  })
                }
                <NewCard />
              </div>
            </div>
          </div>
        )}
      }
    </DarkmodeContext.Consumer>
  )
};


export default Dashboard;
