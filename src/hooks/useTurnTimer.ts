import { useEffect, useMemo, useState } from 'react';

export function useTurnTimer(turnEndsAt?: number) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!turnEndsAt) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [turnEndsAt]);

  const remainingMs = useMemo(() => {
    if (!turnEndsAt) return undefined;
    const ms = Math.max(0, turnEndsAt - now);
    return ms;
  }, [turnEndsAt, now]);

  return remainingMs;
}

export function formatMs(ms?: number) {
  if (ms == null) return '--:--';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

