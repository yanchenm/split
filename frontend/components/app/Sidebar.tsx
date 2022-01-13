import { DocumentAddIcon, DocumentDuplicateIcon, DocumentSearchIcon } from '@heroicons/react/outline';
import React, { useState } from 'react';

import { DarkmodeContext } from '../../pages/_app';
import NewGroupModal from './NewGroupModal';
import ToggleButton from '../ui/ToggleButton';
import { useRouter } from 'next/router';


const Sidebar: React.FC = () => {
  const router = useRouter();

  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);

  const openNewGroupModal = () => {
    setIsNewGroupModalOpen(true);
  };

  const closeNewGroupModal = () => {
    setIsNewGroupModalOpen(false);
  };

  return (
    <DarkmodeContext.Consumer>
      {(darkmodeProps) => {
        return (
          <div className="font-default bg-gray-100 dark:bg-slate-900 text-neutral-800 dark:text-slate-300 w-54 space-y-6 px-4 py-7 transition duration-200 flex flex-none flex-col justify-between">
            {/* Logo */}
            <div>
              <div
                className="flex items-center justify-center space-x-2 px-2 mb-10 mt-10 cursor-pointer"
                onClick={() => router.push('/app')}
              >
                <span className="text-2xl font-extrabold">WMM</span>
              </div>

              {/* Navbar */}
              <nav>
                <div
                  className="hover:bg-gray-200 dark:hover:bg-slate-800 py-4 px-4 rounded transition duration-200 flex cursor-pointer"
                  onClick={openNewGroupModal}
                >
                  <DocumentAddIcon className="h-7 w-7" />
                  <button className="pl-4 text-left font-medium">New Group</button>
                </div>
                <div
                  className="hover:bg-gray-200 dark:hover:bg-slate-800 py-4 px-4 rounded  transition duration-200 flex cursor-pointer"
                  onClick={() => router.push('/app')}
                >
                  <DocumentSearchIcon className="h-7 w-7" />
                  <button className="pl-4 text-left font-medium">Open Groups</button>
                </div>
                <div
                  className="hover:bg-gray-200 dark:hover:bg-slate-800 py-4 px-4 rounded  transition duration-200 flex cursor-pointer"
                  onClick={() => router.push('/app/pastGroups')}
                >
                  <DocumentDuplicateIcon className="h-7 w-7" />
                  <button className="pl-4 text-left font-medium">Past Groups</button>
                </div>
              </nav>
            </div>
            {/* Dark mode toggle button */}
            <div className="w-full flex justify-center">
              <ToggleButton toggleHandler={darkmodeProps.toggleDarkmode} toggleState={darkmodeProps.isDarkmode} />
            </div>

            {/* New group modal */}
            <NewGroupModal isOpen={isNewGroupModalOpen} closeModal={closeNewGroupModal} openModal={openNewGroupModal} />
          </div>
        );
      }}
    </DarkmodeContext.Consumer>
  );
};

export default Sidebar;
