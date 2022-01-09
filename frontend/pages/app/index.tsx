import type { NextPage } from 'next';

import SplitCard from '../../components/App/SplitCard';
import NewCard from '../../components/App/NewCard';
import Sidebar from '../../components/App/Sidebar';

const Dashboard: NextPage = () => {

  return (
    <div className="relative min-h-screen flex">

      <Sidebar />

      {/* Content */}
      <div className="bg-slate-800 flex-1 p-10 text-2xl text-white font-bold">
        Your Splits
        <div className="flex flex-row">
          <SplitCard name="Vancouver trip" cost={10} numTxns={69} date="Jan 1, 2022" />
          <SplitCard name="Japan trip" cost={69} numTxns={10} date="Jan 2, 2022" />
          <SplitCard name="Japan trip" cost={69} numTxns={10} date="Jan 2, 2022" />
        </div>
        <div className="flex flex-row">
          <SplitCard name="Afghanistan trip" cost={10} numTxns={69} date="Jan 3, 2022" />
          <SplitCard name="Japan trip" cost={69} numTxns={10} date="Jan 4, 2022" />
          <NewCard />
        </div>
      </div>
    </div>
  )
};


export default Dashboard;
