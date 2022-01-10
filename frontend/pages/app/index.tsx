import type { NextPage } from 'next';
import { Scrollbars } from 'react-custom-scrollbars';

import SplitCard from '../../components/App/SplitCard';
import NewCard from '../../components/App/NewCard';
import Sidebar from '../../components/App/Sidebar';


const Dashboard: NextPage = () => {

  return (
    <div className="min-h-screen flex">

      <Sidebar />

      {/* Content */}
      <div className="bg-slate-800 flex-1 p-10 text-2xl text-white font-bold h-screen">
        Your Splits
        {/*<div className="bg-slate-700 mt-10 flex flex-row flex-wrap overflow-y-auto overflow-hidden h-5/6 border-solid border-2 border-slate-500 rounded-xl">*/}
        <div className="mt-10 flex flex-row flex-wrap overflow-y-auto overflow-hidden h-5/6 shadow-xl shadow-slate-900 rounded-xl">
          <SplitCard groupId="a" name="Vancouver trip" cost={10} numTxns={69} date="Jan 1, 2022" />
          <SplitCard groupId="b" name="Japan trip" cost={69} numTxns={10} date="Jan 2, 2022" />
          <SplitCard groupId="c" name="Japan trip" cost={69} numTxns={10} date="Jan 2, 2022" />
          <SplitCard groupId="d" name="Afghanistan trip" cost={10} numTxns={69} date="Jan 3, 2022" />
          <SplitCard groupId="e" name="Japan trip" cost={69} numTxns={10} date="Jan 4, 2022" />
          <SplitCard groupId="d" name="Afghanistan trip" cost={10} numTxns={69} date="Jan 3, 2022" />
          <SplitCard groupId="e" name="Japan trip" cost={69} numTxns={10} date="Jan 4, 2022" />
          <NewCard />
        </div>
      </div>
    </div>
  )
};


export default Dashboard;
