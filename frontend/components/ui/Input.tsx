import React, { InputHTMLAttributes } from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';

type InputProps = {
  formFieldName: string;
  formRegisterOptions?: RegisterOptions;
};

const Input: React.FC<InputProps & InputHTMLAttributes<HTMLInputElement>> = ({
  formFieldName,
  formRegisterOptions,
  ...props
}) => {
  const { register } = useFormContext();
  return (
    <input
      className={
        'bg-white appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-200 placeholder-gray-500 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:z-10'
      }
      {...register(formFieldName, formRegisterOptions)}
      {...props}
    />
  );
};

export default Input;
