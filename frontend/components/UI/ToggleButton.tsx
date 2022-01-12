import React, { useState } from 'react';
import { Switch } from '@headlessui/react';

type ToggleProps = {
  toggleHandler?: React.Dispatch<React.SetStateAction<boolean>>;
  toggleState: boolean;
};

const ToggleButton: React.FC<ToggleProps> = ({ toggleHandler, toggleState }) => {
  const typedToggler = toggleHandler as React.Dispatch<React.SetStateAction<boolean>>;

  return (
    <Switch
      checked={toggleState}
      onChange={typedToggler}
      className={`${
        toggleState ? 'bg-slate-600' : 'bg-gray-400'
      } relative inline-flex items-center h-6 rounded-full w-11`}
    >
      <span
        className={`${
          toggleState ? 'translate-x-6' : 'translate-x-1'
        } inline-block w-4 h-4 transform bg-gray-300 rounded-full`}
      />
    </Switch>
  );
};

export default ToggleButton;
