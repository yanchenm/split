import React from 'react';
import { DarkmodeContext } from '../../pages/_app';
import { DocumentAddIcon, DocumentSearchIcon, DocumentDuplicateIcon } from '@heroicons/react/outline';

import ToggleButton from '../UI/ToggleButton';

type ButtonProps = {
  buttonText: string;
  svgSrc: string;
}

const SidebarButton: React.FC<ButtonProps> = ({ buttonText, svgSrc }) => {
  return (
    <a className="hover:bg-gray-200 dark:hover:bg-slate-800 py-4 px-4 rounded  transition duration-200 flex">
      <img src={svgSrc} className="h-7 w-7"/>
      <button className="pl-4 text-left font-medium"> {buttonText} </button>
    </a>
  );
}

const Sidebar: React.FC = () => {

  return (
    <DarkmodeContext.Consumer>
      {(darkmodeProps) => {
        return (
          <div className="bg-gray-200 dark:bg-slate-900 text-neutral-800 dark:text-slate-300 w-64 space-y-6 px-4 py-7 transition duration-200 flex flex-col justify-between">
            {/* Logo */}
            <div>
              <a className="flex items-center space-x-2 px-2 mb-10">
                <span className="text-2xl font-extrabold">
                  WheresMyMoney
                  bitch
                </span>
              </a>

              {/* Navbar */}
              <nav>
                <div className="hover:bg-gray-200 dark:hover:bg-slate-800 py-4 px-4 rounded  transition duration-200 flex">
                  <DocumentAddIcon className="h-7 w-7" />
                  <button className="pl-4 text-left font-medium">New Group</button>
                </div>
                <div className="hover:bg-gray-200 dark:hover:bg-slate-800 py-4 px-4 rounded  transition duration-200 flex">
                  <DocumentSearchIcon className="h-7 w-7" />
                  <button className="pl-4 text-left font-medium">View Open Groups</button>
                </div>
                <div className="hover:bg-gray-200 dark:hover:bg-slate-800 py-4 px-4 rounded  transition duration-200 flex">
                  <DocumentDuplicateIcon className="h-7 w-7" />
                  <button className="pl-4 text-left font-medium">View Past Groups</button>
                </div>

              </nav>
            </div>
            {/* Dark mode toggle button */}
            <ToggleButton toggleHandler={darkmodeProps.toggleDarkmode} toggleState={darkmodeProps.isDarkmode} />
          </div>
        )
      }}
    </DarkmodeContext.Consumer>
  )
};

export default Sidebar;