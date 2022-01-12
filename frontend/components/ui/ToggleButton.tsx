import React, { useState } from 'react';
import { Switch } from '@headlessui/react';
import { MoonIcon, SunIcon } from '@heroicons/react/outline';

type ToggleProps = {
  toggleHandler?: React.Dispatch<React.SetStateAction<boolean>>;
  toggleState: boolean;
};

const ToggleButton: React.FC<ToggleProps> = ({ toggleHandler, toggleState }) => {
  const typedToggler = toggleHandler as React.Dispatch<React.SetStateAction<boolean>>;

  return (
    <div className="flex">
      <SunIcon className={`${toggleState ? 'text-slate-200' : 'text-black-200'} 'font-semibold rounded-lg h-7 w-7 mr-1 pb-1`} />
      <Switch
        checked={toggleState}
        onChange={typedToggler}
        className={`${
          toggleState ? 'bg-violet-600' : 'bg-slate-300'
        } relative inline-flex items-center h-6 rounded-full w-11`}
      >
        <span
          className={`${
            toggleState ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-white rounded-full`}
        />
      </Switch>
      <MoonIcon className={`${toggleState ? 'text-slate-200' : 'text-black-200'} 'font-semibold rounded-lg h-7 w-7 ml-1 pb-1`} />
    </div>
  );
};

export default ToggleButton;