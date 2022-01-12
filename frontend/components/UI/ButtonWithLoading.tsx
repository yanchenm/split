import React, { ButtonHTMLAttributes } from 'react';

import ReactLoading from 'react-loading';

type ButtonProps = {
  buttonText: string;
  loading: boolean;
};

const ButtonWithLoading: React.FC<ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>> = ({
  buttonText,
  loading,
  ...props
}) => {
  return (
    <button
      className={
        'group relative w-full flex justify-center py-2 px-4 border border-transparent font-default text-md font-medium rounded-md text-white bg-violet-600 active:bg-violet-400 focus:outline-none' +
        (loading ? '' : ' hover:bg-violet-500')
      }
      disabled={loading}
      {...props}
    >
      <div>{loading ? <ReactLoading type={'spin'} color={'#fff'} height={28} width={28} /> : buttonText}</div>
    </button>
  );
};

export default ButtonWithLoading;
