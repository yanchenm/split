import React, { ButtonHTMLAttributes } from 'react';

type ButtonProps = {
  children: React.ReactNode;
  clickHandler: () => void;
}

const Button: React.FC<ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, clickHandler }) => {

  return (
    <button 
      onClick={clickHandler}
      className="bg-violet-900 hover:bg-blue-500 text-slate-200 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
    >
      {children}
    </button>
  )
}

export default Button;