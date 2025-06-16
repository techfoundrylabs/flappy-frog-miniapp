import { useEffect, useState } from "react";

import { pad } from "@/utils";

export const useCountdown = (targetUnixTs: number) => {
  const [timeLeft, setTimeLeft] = useState(targetUnixTs);

  useEffect(() => {
    // Quando targetUnixTs cambia (es. da 0 a un valore > 0), aggiorniamo timeLeft
    setTimeLeft(targetUnixTs);

    if (targetUnixTs <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const delta = prev - 1;
        if (delta <= 0) {
          clearInterval(interval);
          return 0;
        }
        return delta;
      });
    }, 1000);

    return () => clearInterval(interval); // Cleanup corretto
  }, [targetUnixTs]); // Si aggiorna SOLO quando cambia targetUnixTs

  const totalSeconds = Math.max(0, timeLeft);
  const seconds = pad(totalSeconds % 60);
  const minutes = pad(Math.floor(totalSeconds / 60) % 60);
  const hours = pad(Math.floor(totalSeconds / 3600) % 24);
  const days = pad(Math.floor(totalSeconds / 86400));
  const timeLeftFormatted = `${days}d ${hours}h ${minutes}m ${seconds}s`;

  return { timeLeft, timeLeftFormatted };
};
