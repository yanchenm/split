import React from 'react';

type buttonProps = {
  children: React.ReactNode;
  clickHandler: () => void;
  className?: string;
  isDisabled?: boolean;
};

const AppButton: React.FC<buttonProps> = ({ children, className, clickHandler, isDisabled }) => {
  return (
    <button
      className={`bg-violet-600 dark:bg-violet-900 hover:bg-violet-800 text-base px-1 rounded py-2 ${className}`}
      onClick={clickHandler}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
};

export default AppButton;
