import React, { ChangeEvent, useEffect, useState } from 'react';

import NumberFormat from 'react-number-format';
import { ParticipantState } from '../detailview/NewTransactionModal';

type SplitParticipantsProps = {
  participants: Record<string, ParticipantState>;
  total: number;
  toggleReset: boolean;
  onValueChange: (value: Record<string, ParticipantState>) => void;
};

const splitEqually = (total: number, numParticipants: number): number[] => {
  if (numParticipants === 0) {
    return [];
  }

  const equalSplit = Number((total / numParticipants).toFixed(2));
  const diff = total * 100 - equalSplit * numParticipants * 100;
  const sign = diff < 0 ? -1 : 1;
  const diffAbs = Math.abs(diff);

  const splits = new Array(numParticipants);
  const sample = Array.from(new Array(numParticipants), (_, i) => i);

  for (let i = 0; i < diffAbs; i++) {
    const index = Math.floor(Math.random() * sample.length);
    splits[sample[index]] = 0.01 * sign;
    sample.splice(index, 1);
  }

  for (let i = 0; i < numParticipants; i++) {
    if (splits[i] === undefined) {
      splits[i] = equalSplit;
    } else {
      splits[i] += equalSplit;
    }
  }

  return splits;
};

const SplitParticipants: React.FC<SplitParticipantsProps> = ({ participants, total, toggleReset, onValueChange }) => {
  const [participantState, setParticipantState] = useState<Record<string, ParticipantState>>(participants);
  const [allChecked, setAllChecked] = useState(false);
  const [allowCustom, setAllowCustom] = useState(false);

  const updateAutoChecked = (state: Record<string, ParticipantState>): Record<string, ParticipantState> => {
    const newParticipantState = { ...state };
    const autoChecked = Object.keys(newParticipantState).filter(
      (address) => newParticipantState[address].selected && !newParticipantState[address].isCustom
    );

    let availableTotal = total;
    Object.keys(newParticipantState).forEach((address) => {
      if (newParticipantState[address].isCustom) {
        availableTotal -= newParticipantState[address].share;
      }
    });

    const shares = splitEqually(availableTotal, autoChecked.length);
    for (let i = 0; i < autoChecked.length; i++) {
      newParticipantState[autoChecked[i]].share = shares[i];
    }
    return newParticipantState;
  };

  const onCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    let checked;
    const newParticipantState = { ...participantState };

    if (!participantState[e.target.value].selected) {
      newParticipantState[e.target.value].selected = true;
    } else {
      newParticipantState[e.target.value].selected = false;
      newParticipantState[e.target.value].share = 0;
      newParticipantState[e.target.value].isCustom = false;
    }

    const updatedState = updateAutoChecked(newParticipantState);
    setParticipantState(updatedState);
  };

  useEffect(() => {
    setParticipantState(updateAutoChecked(participantState));
  }, [total]);

  useEffect(() => {
    onValueChange(participantState);
    let checked = Object.keys(participantState).every((address) => participantState[address].selected);
    setAllChecked(checked);
  }, [participantState]);

  useEffect(() => {
    setAllChecked(false);
    setAllowCustom(false);

    const newState = { ...participantState };
    for (const name of Object.keys(newState)) {
      newState[name].selected = false;
      newState[name].share = 0;
      newState[name].isCustom = false;
    }
    setParticipantState(newState);
  }, [toggleReset]);

  const onCheckAllChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (allChecked) {
      setAllChecked(false);

      const newParticipantState = { ...participantState };
      for (const name of Object.keys(participantState)) {
        newParticipantState[name].selected = false;
        newParticipantState[name].share = 0;
        newParticipantState[name].isCustom = false;
      }
      setParticipantState(newParticipantState);
    } else {
      const newParticipantState = { ...participantState };
      for (const [index, name] of Object.keys(participantState).entries()) {
        newParticipantState[name].selected = true;
      }

      setParticipantState(updateAutoChecked(newParticipantState));
      setAllChecked(true);
    }
  };

  const onAllowCustomChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (allowCustom) {
      let newParticipantState = { ...participantState };
      for (const name of Object.keys(participantState)) {
        participantState[name].isCustom = false;
      }
      setParticipantState(updateAutoChecked(newParticipantState));
    }

    setAllowCustom(!allowCustom);
  };

  const onCustomInput = (e: ChangeEvent<HTMLInputElement>) => {
    const newParticipantState = { ...participantState };
    const participant = e.target.name.split('-')[0];

    newParticipantState[participant].isCustom = true;
    if (!newParticipantState[participant].selected) {
      newParticipantState[participant].selected = true;
    }
    newParticipantState[participant].share = Number(e.target.value);
    setParticipantState(updateAutoChecked(newParticipantState));
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
