import { ChartPieIcon, CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/outline';

type StatProps = {
  totalExpenses: number;
  numTxns: number;
  userBalance: number;
};

const GroupStats: React.FC<StatProps> = ({ totalExpenses, numTxns, userBalance }) => {
  const hello = () => {
    console.log('hello');
  };

  return (
    <div className="w-full h-24 border-solid border-2 border-neutral-300 dark:border-slate-700 rounded-xl">
      <div className="grid grid-cols-5 items-center">
        <div className="flex flex-col col-span-1 mt-2 ml-4">
          <h3 className="ml-3 text-md font-medium text-gray-500 dark:text-slate-400 text-left">
            {userBalance < 0 ? 'You owe' : 'You are owed'}
          </h3>
          <span className="flex flex-row ml-3 my-2 space-x-2 items-center">
            <ChartPieIcon className={`h-6 w-6  ${userBalance < 0 ? 'text-red-500' : 'text-green-600'}`} />
            <h3 className="text-2xl text-gray-800 dark:text-slate-200 font-semibold">{userBalance}</h3>
          </span>
        </div>

        <div className="flex flex-col col-span-1 mt-2 ml-4">
          <h3 className="ml-3 text-md font-medium text-gray-500 dark:text-slate-400">Total Expenses</h3>
          <span className="flex flex-row ml-3 my-2 space-x-2 items-center">
            <CurrencyDollarIcon className="h-6 w-6" />
            <h3 className="text-2xl text-gray-800 dark:text-slate-200 font-semibold">{totalExpenses}</h3>
          </span>
        </div>

        <div className="flex flex-col col-span-1 mt-2 ml-4">
          <h3 className="ml-3 text-md font-medium text-gray-500 dark:text-slate-400">Total Transactions</h3>
          <span className="flex flex-row ml-3 my-2 space-x-2 items-center">
            <DocumentTextIcon className="h-6 w-6" />
            <h3 className="text-2xl text-gray-800 dark:text-slate-200 font-semibold">{numTxns}</h3>
          </span>
        </div>

        <AppButton className="text-slate-100 font-medium col-start-5 mr-9" clickHandler={hello}>
          Settle Up
        </AppButton>
      </div>
    </div>
  );
};

export default GroupStats;
