import React from 'react';
import { formatMs, useTurnTimer } from '@hooks/useTurnTimer';

export const Timer: React.FC<{ turnEndsAt?: number }> = ({ turnEndsAt }) => {
  const remaining = useTurnTimer(turnEndsAt);
  return (
    <div>
      <h6>Timer</h6>
      <div className="display-6">{formatMs(remaining)}</div>
    </div>
  );
};

