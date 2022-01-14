import { DarkmodeContext } from '../_app';
import type { NextPage } from 'next';
import Sidebar from '../../components/app/Sidebar';
import Head from 'next/head';

const PastGroups: NextPage = () => {
  return (
    <>
      <Head>
        <title>WheresMyMoney</title>
      </Head>
      <DarkmodeContext.Consumer>
        {(darkmodeProps) => {
          return (
            <div className={`min-h-screen flex ${darkmodeProps.isDarkmode ? 'dark' : ''}`}>
              <Sidebar />

              {/* Content */}
              <div className="bg-gray-200 text-neutral-800 dark:bg-slate-800 dark:text-white flex-1 p-10 text-2xl font-bold h-screen transition duration-200">
                Past Groups
                <div className="bg-gray-200 dark:bg-slate-800 dark:shadow-slate-900 mt-10 flex flex-row flex-wrap overflow-y-auto overflow-hidden h-5/6 rounded-xl content-start"></div>
              </div>
            </div>
          );
        }}
      </DarkmodeContext.Consumer>
    </>
  );
};

export default PastGroups;
