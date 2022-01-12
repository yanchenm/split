import { PlusIcon } from '@heroicons/react/outline';
import React from 'react';

const AddSplitCard: React.FC = () => {
  return (
    <div className="bg-gray-100 dark:bg-slate-900 rounded-lg w-64 h-64 flex m-3 hover:ring hover:ring-violet-600 cursor-pointer text-gray-600 dark:text-slate-300 hover:text-violet-600">
      <PlusIcon className="mx-auto my-auto h-12 w-12 " />
    </div>
  );
};

export default AddSplitCard;
