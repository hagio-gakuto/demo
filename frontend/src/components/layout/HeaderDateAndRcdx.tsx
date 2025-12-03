'use client';

import { useState, useEffect } from 'react';
import { formatCurrentDateToJST } from '@/libs/date-utils';

export const HeaderDateAndRcdx = () => {
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateDate = () => {
      setCurrentDate(formatCurrentDateToJST());
    };

    updateDate();
    const interval = setInterval(updateDate, 1000 * 60 * 60); // 1時間ごとに更新

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 ml-2">
      {currentDate && (
        <span className="text-sm font-medium text-white">{currentDate}</span>
      )}
    </div>
  );
};
