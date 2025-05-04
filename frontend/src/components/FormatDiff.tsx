import React from 'react';

type Props = {
  diff: number;
  className?: string;
};

const FormatDiff: React.FC<Props> = ({ diff, className }) => {
  if (diff > 0) {
    return <div className={`text-red-500 font-bold ${className}`}>({diff.toFixed(2)})</div>;
  } else if (diff < 0) {
    return <div className={`text-green-500 font-bold ${className}`}>({diff.toFixed(2)})</div>;
  } else {
    return <span className={`font-bold ${className}`}>(=)</span>;
  }
};

export default FormatDiff;
