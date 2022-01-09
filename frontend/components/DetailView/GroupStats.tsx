import React from 'react';

type StatProps = {
  totalExpenses: number;
  numTxns: number;
  userBalance: number;
}

// Don't know if we pass in props or fetch from db
const GroupStats: React.FC<StatProps> = ({ totalExpenses, numTxns, userBalance }) => {

  return (
    <div>
      group stats
    </div>
  )
};

export default GroupStats;