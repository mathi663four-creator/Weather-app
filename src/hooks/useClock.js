import { useState, useEffect } from 'react';

/**
 * Returns a live clock { time, date } adjusted for a given UTC offset in seconds.
 * Defaults to IST (5.5 * 3600).
 */
export function useClock(tzOffsetSeconds) {
  const [clock, setClock] = useState({ time: '--:--:--', date: '--' });

  useEffect(() => {
    const offset = tzOffsetSeconds ?? 5.5 * 3600;

    const tick = () => {
      const nowUTC = new Date(
        new Date().getTime() + new Date().getTimezoneOffset() * 60000
      );
      const local = new Date(nowUTC.getTime() + offset * 1000);
      setClock({
        time: local.toLocaleTimeString([], {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        }),
        date: local.toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric',
        }),
      });
    };

    tick();
    const timer = setInterval(tick,1000);
    return () => clearInterval(timer);
  }, [tzOffsetSeconds]);

  return clock;
}