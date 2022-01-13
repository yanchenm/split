import { ChevronLeftIcon, ChevronRightIcon, SelectorIcon } from '@heroicons/react/solid';
import React, { forwardRef } from 'react';

import DatePicker from 'react-datepicker';
import { format } from 'date-fns';

type DatePickerProps = {
  selected: Date | undefined | null;
  onChange: (date: Date | undefined | null) => void;
};

const CustomDatePicker: React.FC<DatePickerProps> = ({ selected, onChange }) => {
  return (
    <div className="relative w-full">
      <DatePicker
        selected={selected}
        onChange={(date) => {
          onChange(date);
        }}
        maxDate={new Date()}
        nextMonthButtonLabel=">"
        previousMonthButtonLabel="<"
        popperClassName="react-datepicker-left"
        customInput={<DateButtonInput />}
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex items-center justify-between px-2 py-2">
            <span className="text-lg text-gray-900">{format(date, 'MMMM yyyy')}</span>

            <div className="space-x-2">
              <button
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                type="button"
                className={`
                          ${prevMonthButtonDisabled && 'cursor-not-allowed opacity-50'}
                          inline-flex p-1 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-violet-500
                        `}
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                type="button"
                className={`
                          ${nextMonthButtonDisabled && 'cursor-not-allowed opacity-50'}
                          inline-flex p-1 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-violet-500
                         `}
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
};

// @ts-ignore
const DateButtonInput = forwardRef(({ value, onClick }, ref) => (
  <button
    onClick={onClick}
    // @ts-ignore
    ref={ref}
    type="button"
    className="justify-start text-left w-full px-4 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-violet-500"
  >
    {value ? format(new Date(value), 'd MMM yyyy') : 'Select date'}
    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
      <SelectorIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
    </span>
  </button>
));
DateButtonInput.displayName = 'DateButtonInput';

export default CustomDatePicker;
