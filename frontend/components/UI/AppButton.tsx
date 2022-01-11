import React from 'react';

type buttonProps = {
  children: React.ReactNode;
  clickHandler: () => void;
  className?: string;
}

const AppButton: React.FC<buttonProps> = ({ children, className, clickHandler}) => {

  return (
    <button 
      className={`bg-violet-900 hover:bg-violet-800 text-lg px-6 rounded h-8 ${className}`}
      onClick={clickHandler}
    >
      {children}
    </button>
  )
};

export default AppButton;