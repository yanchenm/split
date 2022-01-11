import type { NextPage } from 'next';

import SplitCard from '../../components/App/SplitCard';
import NewCard from '../../components/App/NewCard';
import Sidebar from '../../components/App/Sidebar';


const Dashboard: NextPage = () => {

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
    }
  ]

  return (
    <div className="min-h-screen flex">

      <Sidebar />

      {/* Content */}
      <div className="bg-slate-800 flex-1 p-10 text-2xl text-white font-bold h-screen">
        Your Splits
        <div className="mt-10 flex flex-row flex-wrap overflow-y-auto overflow-hidden h-5/6 shadow-xl shadow-slate-900 rounded-xl">
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
  )
};


export default Dashboard;
