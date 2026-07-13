"use client";

import * as React from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function getTimeLeft(target: Date) {
  const now = new Date().getTime();
  const diff = Math.max(0, target.getTime() - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { diff, days, hours, minutes, seconds };
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-semibold tabular-nums md:text-3xl">
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export function Countdown({ endsAtISO }: { endsAtISO: string }) {
  const target = React.useMemo(() => new Date(endsAtISO), [endsAtISO]);
  const [timeLeft, setTimeLeft] = React.useState<ReturnType<typeof getTimeLeft> | null>(
    null
  );

  React.useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(target));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const days = timeLeft ? pad(timeLeft.days) : "--";
  const hours = timeLeft ? pad(timeLeft.hours) : "--";
  const minutes = timeLeft ? pad(timeLeft.minutes) : "--";
  const seconds = timeLeft ? pad(timeLeft.seconds) : "--";

  return (
    <div className="mt-6 flex items-center justify-start gap-4">
      <Stat value={days} label="Days" />
      <span className="text-muted-foreground">:</span>
      <Stat value={hours} label="Hours" />
      <span className="text-muted-foreground">:</span>
      <Stat value={minutes} label="Minutes" />
      <span className="text-muted-foreground">:</span>
      <Stat value={seconds} label="Seconds" />
    </div>
  );
}
