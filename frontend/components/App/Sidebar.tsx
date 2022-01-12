import { DocumentAddIcon, DocumentDuplicateIcon, DocumentSearchIcon } from '@heroicons/react/outline';

import { DarkmodeContext } from '../../pages/_app';
import React from 'react';
import Link from 'next/link';
import ToggleButton from '../UI/ToggleButton';
import { useRouter } from 'next/router';

type ButtonProps = {
  buttonText: string;
  svgSrc: string;
};

const Sidebar: React.FC = () => {
  const router = useRouter();

  return (
    <DarkmodeContext.Consumer>
      {(darkmodeProps) => {
        return (
          <div className="font-default bg-gray-100 dark:bg-slate-900 text-neutral-800 dark:text-slate-300 w-64 space-y-6 px-4 py-7 transition duration-200 flex flex-col justify-between">
            {/* Logo */}
            <div>
              <a className="flex items-center space-x-2 px-2 mb-10">
                <span className="text-2xl font-extrabold">WheresMyMoney bitch</span>
              </a>

              {/* Navbar */}
              <nav>
                <div className="hover:bg-gray-200 dark:hover:bg-slate-800 py-4 px-4 rounded  transition duration-200 flex">
                  <DocumentAddIcon className="h-7 w-7" />
                  <button className="pl-4 text-left font-medium" onClick={() => router.push('/app/newGroup')}>New Group</button>
                </div>
                <div className="hover:bg-gray-200 dark:hover:bg-slate-800 py-4 px-4 rounded  transition duration-200 flex">
                  <DocumentSearchIcon className="h-7 w-7" />
                  <button className="pl-4 text-left font-medium" onClick={() => router.push('/app/openGroups')}>View Open Groups</button>
                </div>
                <div className="hover:bg-gray-200 dark:hover:bg-slate-800 py-4 px-4 rounded  transition duration-200 flex">
                  <DocumentDuplicateIcon className="h-7 w-7" />
                  <button className="pl-4 text-left font-medium" onClick={() => router.push('/app/pastGroups')}>View Past Groups</button>
                </div>
              </nav>
            </div>
            {/* Dark mode toggle button */}
            <ToggleButton toggleHandler={darkmodeProps.toggleDarkmode} toggleState={darkmodeProps.isDarkmode} />
          </div>
        );
      }}
    </DarkmodeContext.Consumer>
  );
};

export default Sidebar;
