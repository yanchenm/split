import type { NextPage } from 'next/types';
import { useRouter } from 'next/router';

import GroupStats from '../../../components/DetailView/GroupStats';
import Expense from '../../../components/DetailView/Expense';

const SplitGroup: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="bg-slate-800 text-violet-100 min-h-screen">
      hi {id}
      <GroupStats />
      <Expense />
    </div>
  )
};

export default SplitGroup;

