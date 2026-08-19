import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Plus, Minus, CheckCircle2, Sparkles, Timer } from 'lucide-react';

interface RestTimerFloatingProps {
  initialSeconds?: number;
  isOpen: boolean;
  onClose: () => void;
  onTimerComplete?: () => void;
}

const PRESET_TIMES = [30, 60, 90, 120];

export const RestTimerFloating: React.FC<RestTimerFloatingProps> = ({
  initialSeconds = 60,
  isOpen,
  onClose,
  onTimerComplete,
}) => {
  const [targetSeconds, setTargetSeconds] = useState(initialSeconds);
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setTargetSeconds(initialSeconds);
    setSecondsRemaining(initialSeconds);
    setIsRunning(true);
    setIsCompleted(false);
  }, [initialSeconds, isOpen]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            if (onTimerComplete) onTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining, onTimerComplete]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = targetSeconds > 0 ? ((targetSeconds - secondsRemaining) / targetSeconds) * 100 : 100;

  const adjustTime = (delta: number) => {
    setSecondsRemaining((prev) => Math.max(5, prev + delta));
    setTargetSeconds((prev) => Math.max(5, prev + delta));
    setIsCompleted(false);
  };

  const selectPreset = (secs: number) => {
    setTargetSeconds(secs);
    setSecondsRemaining(secs);
    setIsRunning(true);
    setIsCompleted(false);
  };

  const resetTimer = () => {
    setSecondsRemaining(targetSeconds);
    setIsRunning(true);
    setIsCompleted(false);
  };

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-4 sm:right-6 z-40 animate-in slide-in-from-bottom-5 duration-200">
      <div className="w-80 sm:w-88 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-indigo-100 dark:border-slate-800 p-4.5 overflow-hidden relative">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Rest Timer
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timer Display */}
        <div className="flex items-center justify-between gap-4 py-2">
          {/* Circular / Big Time */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 font-mono">
              {formatTime(secondsRemaining)}
            </span>
            <span className="text-xs text-slate-400 font-semibold">remaining</span>
          </div>

          {/* Quick Adjust Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => adjustTime(-15)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all text-xs font-bold"
              title="-15 seconds"
            >
              -15s
            </button>
            <button
              onClick={() => adjustTime(15)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all text-xs font-bold"
              title="+15 seconds"
            >
              +15s
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden my-2.5">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isCompleted
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Completion Notice */}
        {isCompleted ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 my-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Ready for your next set? 💪</span>
            </div>
            <button
              onClick={onClose}
              className="text-[11px] font-bold text-emerald-800 dark:text-emerald-200 underline"
            >
              Dismiss
            </button>
          </div>
        ) : null}

        {/* Presets & Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1 overflow-x-auto">
            {PRESET_TIMES.map((sec) => (
              <button
                key={sec}
                onClick={() => selectPreset(sec)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  targetSeconds === sec
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
              title={isRunning ? 'Pause' : 'Resume'}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={resetTimer}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
