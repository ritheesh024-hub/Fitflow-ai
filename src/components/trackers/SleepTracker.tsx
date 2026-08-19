import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Moon, Sparkles, Clock, BatteryCharging, Star, ShieldCheck } from 'lucide-react';

export const SleepTracker: React.FC = () => {
  const { todaySleep, logSleep, user, sleeps } = useApp();

  const [hours, setHours] = useState(todaySleep ? todaySleep.durationMinutes / 60 : 7.5);
  const [bedtime, setBedtime] = useState(todaySleep?.bedtime || '23:00');
  const [wakeTime, setWakeTime] = useState(todaySleep?.wakeTime || '06:30');
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(todaySleep?.energyLevel || 4);

  const goalHours = user.sleepGoalHours || 8;
  const currentHours = todaySleep ? Number((todaySleep.durationMinutes / 60).toFixed(1)) : 7.7;
  const percent = Math.min(100, Math.round((currentHours / goalHours) * 100));

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    logSleep({
      durationMinutes: Math.round(hours * 60),
      bedtime,
      wakeTime,
      energyLevel,
      recoveryRating:
        energyLevel >= 4
          ? 'Optimal Recovery'
          : energyLevel === 3
          ? 'Fair Recovery'
          : 'Low Energy Recovery',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. HERO SLEEP CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white shadow-xl shadow-purple-950/20 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/10 text-purple-300">
              <Moon className="w-3.5 h-3.5" />
              <span>Sleep & Recovery</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                {currentHours}
              </span>
              <span className="text-sm sm:text-base font-semibold text-purple-200">
                / {goalHours} Hours Target
              </span>
            </div>

            <p className="text-xs sm:text-sm text-purple-200/80 font-medium">
              {todaySleep?.recoveryRating || 'Good Recovery'} • Quality score:{' '}
              {'★'.repeat(todaySleep?.energyLevel || 4)}
            </p>
          </div>

          {/* Sleep Stats Box */}
          <div className="grid grid-cols-2 gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div>
              <span className="text-[11px] text-purple-300 font-medium block">Bedtime</span>
              <span className="text-sm font-bold text-white">{bedtime}</span>
            </div>
            <div>
              <span className="text-[11px] text-purple-300 font-medium block">Wake Up</span>
              <span className="text-sm font-bold text-white">{wakeTime}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-white/10 rounded-full mt-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* 2. LOG SLEEP RECORD */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Log Today's Sleep & Recovery
        </h3>

        <form onSubmit={handleSaveSleep} className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Sleep Duration</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">{hours} Hours</span>
            </div>
            <input
              type="range"
              min="4"
              max="12"
              step="0.25"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full accent-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Bedtime
              </label>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Wake Up Time
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Morning Energy & Recovery Rating
            </label>
            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setEnergyLevel(lvl)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    energyLevel === lvl
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {lvl === 1 && '😴 Low'}
                  {lvl === 2 && '🥱 Fair'}
                  {lvl === 3 && '🙂 Good'}
                  {lvl === 4 && '⚡ Great'}
                  {lvl === 5 && '🌟 Peak'}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-purple-500/20 active:scale-98 transition-all"
          >
            Save Sleep Record
          </button>
        </form>
      </div>

      {/* 3. RECENT SLEEP HISTORY */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Recent Sleep History
        </h3>

        {(sleeps || []).length > 0 ? (
          <div className="space-y-2">
            {(sleeps || []).slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">😴</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                      {(s.durationMinutes / 60).toFixed(1)} Hours Sleep
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {s.date} • {s.bedtime} to {s.wakeTime}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  {s.recoveryRating}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            No past sleep logs found. Log your sleep above to track your recovery history!
          </p>
        )}
      </div>
    </div>
  );
};
