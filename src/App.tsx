import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

const App: React.FC = () => {
  const [now, setNow] = useState<Date>(new Date());
  const [intervalMinutes, setIntervalMinutes] = useState<number>(15);
  const [nextDingTime, setNextDingTime] = useState<Date | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [runningIntervalMinutes, setRunningIntervalMinutes] = useState<number | null>(null);
  const [pausedRemainingMs, setPausedRemainingMs] = useState<number | null>(null);
  const dingTimeoutRef = useRef<number | null>(null);
  const dingAudioRef = useRef<HTMLAudioElement | null>(null);
  const remainingMsRef = useRef<number | null>(null);

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  // Update the current time every second
  useEffect(() => {
    const updateClock = setInterval(() => {
      setNow(new Date());
      setIsLoading(false);
    }, 1000);

    return () => clearInterval(updateClock);
  }, []);

  // Preload the ding audio once
  useEffect(() => {
    const audio = new Audio("/ding.wav");
    dingAudioRef.current = audio;
    audio.load();
  }, []);

  const restartDing = useCallback(() => {
    const audio = dingAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(() => null);
  }, []);

  // Clear any scheduled ding when leaving the page
  useEffect(() => {
    return () => {
      if (dingTimeoutRef.current) {
        clearTimeout(dingTimeoutRef.current);
      }
    };
  }, []);

  const scheduleDing = useCallback(
    (delayMs: number, cycleMinutes: number) => {
      if (dingTimeoutRef.current) {
        clearTimeout(dingTimeoutRef.current);
      }

      const target = new Date(Date.now() + delayMs);
      setNextDingTime(target);

      dingTimeoutRef.current = window.setTimeout(() => {
        restartDing();
        remainingMsRef.current = null;
        scheduleDing(cycleMinutes * 60 * 1000, cycleMinutes);
      }, delayMs);
    },
    [restartDing],
  );

  // Start recurring dings
  const startDingTimer = () => {
    const selected = intervalMinutes;
    setRunningIntervalMinutes(selected);
    setIsPaused(false);
    setIsRunning(true);
    scheduleDing(selected * 60 * 1000, selected);
  };

  const pauseTimer = () => {
    if (!isRunning || isPaused || !nextDingTime) return;
    const remaining = Math.max(0, nextDingTime.getTime() - Date.now());
    remainingMsRef.current = remaining;
    setPausedRemainingMs(remaining);
    if (dingTimeoutRef.current) {
      clearTimeout(dingTimeoutRef.current);
    }
    setIsPaused(true);
  };

  const resumeTimer = () => {
    if (!isRunning || !isPaused) return;
    const activeMinutes = runningIntervalMinutes ?? intervalMinutes;
    const delay =
      (remainingMsRef.current ?? pausedRemainingMs) ?? activeMinutes * 60 * 1000;
    setRunningIntervalMinutes(activeMinutes);
    setIsPaused(false);
    setPausedRemainingMs(null);
    scheduleDing(delay, activeMinutes);
  };

  // Stop the timer
  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setPausedRemainingMs(null);
    setRunningIntervalMinutes(null);
    setNextDingTime(null);
    if (dingTimeoutRef.current) {
      clearTimeout(dingTimeoutRef.current);
    }
    remainingMsRef.current = null;
  };

  function Clock({
    hours,
    minutes,
    seconds,
    size,
  }: {
    hours: string;
    minutes: string;
    seconds: string;
    size?: "small";
  }) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center space-x-4 text-slate-800",
          size === "small" ? "text-2xl lg:text-3xl" : "text-4xl lg:text-5xl",
        )}
      >
        <div className="flex flex-col items-center px-4">
          <span>{hours}</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center px-4">
          <span>{minutes}</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center px-4">
          <span>{seconds}</span>
        </div>
      </div>
    );
  }

  const nextTimeDisplay = useMemo(() => {
    if (isPaused && pausedRemainingMs !== null) {
      const target = new Date(Date.now() + pausedRemainingMs);
      return {
        hours: target.getHours().toString().padStart(2, "0"),
        minutes: target.getMinutes().toString().padStart(2, "0"),
        seconds: target.getSeconds().toString().padStart(2, "0"),
      };
    }
    if (!nextDingTime) return null;
    return {
      hours: nextDingTime.getHours().toString().padStart(2, "0"),
      minutes: nextDingTime.getMinutes().toString().padStart(2, "0"),
      seconds: nextDingTime.getSeconds().toString().padStart(2, "0"),
    };
  }, [nextDingTime, isPaused, pausedRemainingMs]);

  const activeInterval = runningIntervalMinutes ?? intervalMinutes;

  const progress = useMemo(() => {
    if (!isRunning || !nextDingTime) return 0;
    const totalMs = activeInterval * 60 * 1000;
    const remaining = isPaused
      ? pausedRemainingMs ?? remainingMsRef.current ?? totalMs
      : Math.max(0, nextDingTime.getTime() - now.getTime());
    return Math.min(100, Math.max(0, 100 - (remaining / totalMs) * 100));
  }, [isRunning, nextDingTime, activeInterval, now, isPaused, pausedRemainingMs]);

  const quickPresets = [5, 10, 15, 20, 30, 60, 90, 120];
  const activeCycleMinutes = isRunning && runningIntervalMinutes ? runningIntervalMinutes : intervalMinutes;

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden overflow-y-auto text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_25%,rgba(56,189,248,0.3),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(52,211,153,0.25),transparent_35%),radial-gradient(circle_at_50%_75%,rgba(244,114,182,0.22),transparent_30%)] animate-slow-pan" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70 bg-gradient-to-br from-white/80 via-emerald-50/60 to-cyan-50/70 animate-gradient bg-[length:400%_400%]" />

      <div className="relative w-full max-w-7xl mx-auto px-6 py-14 lg:py-16">
        <div className="mb-12 text-center flex flex-col items-center gap-3">
          <p className="inline-flex items-center px-3 py-1 rounded-full border border-emerald-200/80 bg-white/70 text-xs uppercase tracking-[0.2em] text-emerald-700 shadow-sm shadow-emerald-100">
            Slow down, stay present
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold font-title text-emerald-800 drop-shadow-[0_8px_24px_rgba(16,185,129,0.2)]">
            Mindfulness Timer
          </h1>
          <p className="text-slate-600 text-sm lg:text-base">
            A calm, lightweight bell that keeps you pausing before the day runs away.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] items-stretch">
          <div className="relative overflow-hidden rounded-3xl border border-white/45 bg-white/18 backdrop-blur-lg shadow-[0_25px_80px_rgba(16,185,129,0.18)] p-8 lg:p-10 gap-5 flex flex-col h-full">
            <div className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rotate-6 rounded-[32px] bg-gradient-to-br from-cyan-200 via-white/10 to-emerald-200 opacity-80 blur-3xl" />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={clsx("inline-flex h-3 w-3 rounded-full ", isRunning ? "bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.25)]" : "bg-slate-400")} />
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">
                  {isPaused ? "Paused" : isRunning ? "Running" : "Idle"}
                </p>
              </div>
              <div className="text-xs text-slate-600">Set your rhythm</div>
            </div>

            <div className="mt-4 mb-4 flex flex-col items-center gap-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Current Time
              </p>
              {isLoading ? (
                <div className="mt-2 text-sm text-slate-500">Loading...</div>
              ) : (
                <Clock hours={hours} minutes={minutes} seconds={seconds} />
              )}
            </div>

            <div className="relative mt-4">
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-lime-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-end text-xs text-slate-600">
                <span>{activeCycleMinutes}m cycle</span>
              </div>
            </div>

            <div
              key={`controls-${isRunning}-${isPaused}`}
              className="flex flex-col sm:flex-row gap-3 animate-slide-down"
            >
              {!isRunning ? (
                <button
                  key="start"
                  onClick={startDingTimer}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-300 via-emerald-200 to-lime-200 px-5 py-3.5 text-center text-base font-semibold text-emerald-900 shadow-lg shadow-emerald-200/60 transition-transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-200/70 active:translate-y-0"
                >
                  Start timer
                </button>
              ) : isPaused ? (
                <button
                  key="resume"
                  onClick={resumeTimer}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-300 via-emerald-200 to-lime-200 px-5 py-3.5 text-center text-base font-semibold text-emerald-900 shadow-lg shadow-emerald-200/60 transition-transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-200/70 active:translate-y-0"
                >
                  Resume
                </button>
              ) : (
                <button
                  key="pause"
                  onClick={pauseTimer}
                  className="flex-1 rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-3.5 text-center text-base font-semibold text-cyan-800 shadow-md shadow-cyan-100/80 transition-transform hover:-translate-y-0.5 hover:border-cyan-300 active:translate-y-0"
                >
                  Pause
                </button>
              )}
              {isRunning && (
                <button
                  key="stop"
                  onClick={stopTimer}
                  className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-center text-base font-semibold text-emerald-800 shadow-md shadow-emerald-100/80 transition-transform hover:-translate-y-0.5 hover:border-emerald-300 active:translate-y-0"
                >
                  Stop
                </button>
              )}
            </div>

            {isRunning && nextTimeDisplay && (
              <div className="mt-8 rounded-2xl border border-emerald-100/80 bg-white/80 p-4 flex items-center justify-between">
                <div className="text-sm text-slate-600">Pause and realign at</div>
                <Clock
                  size="small"
                  hours={nextTimeDisplay.hours}
                  minutes={nextTimeDisplay.minutes}
                  seconds={nextTimeDisplay.seconds}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="relative rounded-3xl border border-white/40 bg-gradient-to-br from-white/16 via-cyan-50/18 to-emerald-50/18 backdrop-blur-lg p-8 lg:p-10 shadow-[0_20px_60px_rgba(16,185,129,0.14)] animate-slide-down w-full flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="interval" className="text-lg font-semibold text-slate-800">
                  Set interval
                </label>
                <span className="text-xs text-slate-500">Minutes</span>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <input
                    id="interval"
                    type="number"
                    min="1"
                    className="w-32 rounded-xl border border-emerald-100 bg-white px-3 py-2 text-center text-lg font-semibold text-slate-800 shadow-inner shadow-emerald-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    value={intervalMinutes}
                    onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                  />
                  <div className="text-xs text-slate-600">Adjust minutes then restart timer</div>
                </div>

                <div className="grid grid-cols-4 gap-3 w-full justify-items-center">
                  {quickPresets.map((value) => (
                    <button
                      key={value}
                      onClick={() => setIntervalMinutes(value)}
                      className={clsx(
                        "w-full rounded-full border px-3 py-2 text-sm transition-all text-center",
                        intervalMinutes === value
                          ? "border-emerald-400 bg-emerald-200/60 text-emerald-900 shadow-lg shadow-emerald-300/50"
                          : "border-emerald-100 bg-white/90 text-slate-700 hover:border-emerald-300/60 hover:text-emerald-900",
                      )}
                    >
                      {value}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
