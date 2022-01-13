import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import { Fragment, useEffect, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';

import { getSupportedCurrencies } from '../../utils/routes/currency';

type CurrencySelectorProps = {
  selected: string;
  onChange: (value: string) => void;
};

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ selected, onChange }) => {
  const [currencyList, setCurrencyList] = useState<string[]>([]);

  useEffect(() => {
    getSupportedCurrencies().then((res) => setCurrencyList(res.data));
  }, []);

  return (
    <Listbox value={selected} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-200 rounded-lg cursor-default hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-violet-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
          <span className="block truncate">{selected || 'Select currency'}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <SelectorIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-20">
            {currencyList.map((option) => (
              <Listbox.Option
                key={option}
                className={({ active }) =>
                  `${active ? 'text-violet-900 bg-violet-100' : 'text-gray-900'}
                          cursor-default select-none relative py-2 pl-10 pr-4`
                }
                value={option}
              >
                {({ selected, active }) => (
                  <>
                    <span className={`${selected ? 'font-medium' : 'font-normal'} block truncate`}>{option}</span>
                    {selected ? (
                      <span
                        className={`${active ? 'text-violet-600' : 'text-violet-600'}
                                absolute inset-y-0 left-0 flex items-center pl-3`}
                      >
                        <CheckIcon className="w-5 h-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default CurrencySelector;
