import React from 'react';

type buttonProps = {
  children: React.ReactNode;
  clickHandler: () => void;
  className?: string;
}

const AppButton: React.FC<buttonProps> = ({ children, className, clickHandler}) => {

  return (
    <button 
      className={`bg-violet-600 dark:bg-violet-900 hover:bg-violet-800 text-base px-6 rounded h-8 ${className}`}
      onClick={clickHandler}
    >
      {children}
    </button>
  )
};

export default AppButton;