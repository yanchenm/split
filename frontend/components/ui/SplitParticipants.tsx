import React, { ChangeEvent, useEffect, useState } from 'react';

import NumberFormat from 'react-number-format';
import { ParticipantState } from '../detailview/NewTransactionModal';

type SplitParticipantsProps = {
  participants: Record<string, ParticipantState>;
  total: number;
  onValueChange: (value: Record<string, ParticipantState>) => void;
};

const splitEqually = (total: number, numParticipants: number): number => {
  return Number((total / numParticipants).toFixed(2));
};

const SplitParticipants: React.FC<SplitParticipantsProps> = ({ participants, total, onValueChange }) => {
  const [participantState, setParticipantState] = useState<Record<string, ParticipantState>>(participants);
  const [currentChecked, setCurrentChecked] = useState<string[]>([]);
  const [allChecked, setAllChecked] = useState(false);
  const [allowCustom, setAllowCustom] = useState(false);

  const onCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    let checked;
    const newParticipantState = { ...participantState };

    if (!participantState[e.target.value].selected) {
      checked = [...currentChecked, e.target.value];
    } else {
      checked = currentChecked.filter((name) => name !== e.target.value);
      newParticipantState[e.target.value].selected = false;
      newParticipantState[e.target.value].share = 0;
      newParticipantState[e.target.value].isCustom = false;
    }

    const sharePerPerson = splitEqually(total, checked.length);
    for (const name of checked) {
      newParticipantState[name].selected = true;
      newParticipantState[name].share = sharePerPerson;
    }

    setCurrentChecked(checked);
    setParticipantState(newParticipantState);
  };

  useEffect(() => {
    const sharePerPerson = splitEqually(total, currentChecked.length);
    const newParticipantState = { ...participantState };
    for (const name of currentChecked) {
      newParticipantState[name].share = sharePerPerson;
    }
    setParticipantState(newParticipantState);
  }, [total]);

  useEffect(() => {
    onValueChange(participantState);
  }, [participantState]);

  useEffect(() => {
    if (currentChecked.length === Object.keys(participantState).length) {
      setAllChecked(true);
    } else {
      setAllChecked(false);
    }
  }, [currentChecked]);

  const onCheckAllChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (allChecked) {
      setCurrentChecked([]);
      setAllChecked(false);

      const newParticipantState = { ...participantState };
      for (const name of Object.keys(participantState)) {
        newParticipantState[name].selected = false;
        newParticipantState[name].share = 0;
        newParticipantState[name].isCustom = false;
      }
      setParticipantState(newParticipantState);
    } else {
      const sharePerPerson = splitEqually(total, Object.keys(participantState).length);
      const newParticipantState = { ...participantState };
      for (const name of Object.keys(participantState)) {
        newParticipantState[name].selected = true;
        newParticipantState[name].share = sharePerPerson;
      }

      setCurrentChecked(Object.keys(participantState));
      setParticipantState(newParticipantState);
      setAllChecked(true);
    }
  };

  const onAllowCustomChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAllowCustom(!allowCustom);
  };

  const onCustomInput = (e: ChangeEvent<HTMLInputElement>) => {
    const newParticipantState = { ...participantState };
    const participant = e.target.name.split('-')[0];

    newParticipantState[participant].isCustom = true;

    if (!newParticipantState[participant].selected) {
      setCurrentChecked([...currentChecked, participant]);
      newParticipantState[participant].selected = true;
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between">
        <div className="flex items-center mb-2 mt-3">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={onCheckAllChange}
            className="appearance-none h-3.5 w-3.5 border border-gray-300 bg-white cursor-pointer rounded checked:bg-violet-500 checked:border-violet-500 text-white"
          />
          <label className="font-semibold ml-3 text-base">Participants</label>
        </div>
        <div className="flex items-center mb-2 mt-3">
          <input
            type="checkbox"
            checked={allowCustom}
            onChange={onAllowCustomChange}
            className="appearance-none h-3.5 w-3.5 border border-gray-300 bg-white cursor-pointer rounded checked:bg-violet-500 checked:border-violet-500 text-white"
          />
          <label className="ml-3 text-sm">Custom</label>
        </div>
      </div>
      {Object.entries(participantState).map(([address, state]) => (
        <div key={address} className="flex items-center justify-between py-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              value={`${address}`}
              checked={state.selected}
              onChange={onCheckboxChange}
              className="appearance-none h-3.5 w-3.5 border border-gray-300 bg-white cursor-pointer rounded checked:bg-violet-500 checked:border-violet-500 text-white"
            />
            <label className="ml-3">{state.username}</label>
          </div>
          <NumberFormat
            name={`${address}-share`}
            disabled={!allowCustom}
            value={state.share}
            className="bg-white appearance-none rounded-md relative block w-32 px-3 py-1 border border-gray-200 placeholder-gray-500 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:z-10"
            inputMode="numeric"
            decimalScale={2}
            allowNegative={false}
            onChange={onCustomInput}
          />
        </div>
      ))}
    </div>
  );
};

export default SplitParticipants;
