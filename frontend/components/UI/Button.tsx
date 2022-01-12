import React, { ButtonHTMLAttributes } from 'react';

type ButtonProps = {
  children: React.ReactNode;
  clickHandler: () => void;
};

const Button: React.FC<ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, clickHandler }) => {
  return (
    <button
      onClick={clickHandler}
      className="bg-violet-800 hover:bg-blue-500 text-slate-200 font-semibold hover:text-white py-3 px-4 hover:border-transparent rounded-lg"
    >
      {children}
    </button>
  );
};

export default Button;
