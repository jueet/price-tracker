import React from 'react';

type Props = {
  date: string;
  title: string;
};

const DateDisplayer: React.FC<Props> = ({ date, title }) => {
  return (
    <div className="flex flex-row justify-between items-center">
      <div>{title}</div>
      <div>{date}</div>
    </div>
  );
};

export default DateDisplayer;
