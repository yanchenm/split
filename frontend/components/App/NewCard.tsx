import React from 'react';
import { PlusIcon } from '@heroicons/react/outline';

const AddSplitCard: React.FC = () => {

  return (
    <div className="bg-gray-100 dark:bg-slate-900 rounded-lg w-64 h-64 flex m-3 ">
        <PlusIcon className="mx-auto my-auto h-12 w-12 text-gray-600 dark:text-slate-300"/>
    </div>
  );
}

export default AddSplitCard;