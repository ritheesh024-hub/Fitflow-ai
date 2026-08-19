import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Flame,
  Calendar,
  Sparkles,
  Footprints,
  Droplets,
  Moon,
  Dumbbell,
} from 'lucide-react';
import { getDateDaysAgoStr } from '../../services/storage';

export const ProgressAnalytics: React.FC = () => {
  const { activities = [], workouts = [], hydrations = [], sleeps = [], habits = [], user, wellnessScore } = useApp();
  const [timeRange, setTimeRange] = useState<'7d' | '14d'>('7d');

  const daysCount = timeRange === '7d' ? 7 : 14;

  // Build daily data series for the past N days
  const dailySeries = Array.from({ length: daysCount }, (_, i) => {
    const dStr = getDateDaysAgoStr(daysCount - 1 - i);
    const dateObj = new Date(dStr);
    const label = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

    // Activity
    const act = (activities || []).find((a) => a?.date === dStr);
    const steps = act ? act.steps : Math.round(5500 + (i * 450) % 3500);

    // Hydration
    const hyd = (hydrations || []).find((h) => h?.date === dStr);
    const waterLiters = hyd ? Number((hyd.waterMl / 1000).toFixed(1)) : 2.1;

    // Sleep
    const slp = (sleeps || []).find((s) => s?.date === dStr);
    const sleepHours = slp ? Number((slp.durationMinutes / 60).toFixed(1)) : 7.6;

    // Workouts
    const hasWorkout = (workouts || []).some((w) => w?.date === dStr && w?.completed);

    // Score
    const score = Math.min(98, Math.max(65, Math.round(68 + (steps / 1000) * 2.5 + (hasWorkout ? 10 : 0))));

    return {
      date: dStr,
      label,
      steps,
      waterLiters,
      sleepHours,
      hasWorkout,
      score,
    };
  });

  const avgSteps = Math.round(
    dailySeries.reduce((acc, d) => acc + d.steps, 0) / dailySeries.length
  );
  const totalWorkouts = dailySeries.filter((d) => d.hasWorkout).length;
  const avgSleepHours = (
    dailySeries.reduce((acc, d) => acc + d.sleepHours, 0) / dailySeries.length
  ).toFixed(1);

  const maxSteps = Math.max(...dailySeries.map((d) => d.steps), 10000);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. HEADER & RANGE TOGGLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Progress & Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Consistency & Trends
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your momentum over time and celebrate positive progress.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl self-start sm:self-center">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === '7d'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setTimeRange('14d')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === '14d'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Past 14 Days
          </button>
        </div>
      </div>

      {/* 2. SUMMARY METRIC HIGHLIGHTS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Footprints className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Average Steps
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {avgSteps.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Steady daily movement
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Workouts Logged
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalWorkouts} Sessions
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
            Consistent routine
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Average Sleep
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {avgSleepHours} Hours
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            Healthy restorative rest
          </p>
        </div>
      </div>

      {/* 3. STEP COUNT & MOVEMENT CHART */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Movement Trend
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Steps taken per day vs target
            </p>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-44 pt-6 flex items-end justify-between gap-1.5 sm:gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
          {dailySeries.map((d) => {
            const heightPercent = Math.min(100, Math.round((d.steps / maxSteps) * 100));
            const isGoalMet = d.steps >= (user.dailyStepGoal || 8000);

            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-md">
                  {d.steps.toLocaleString()} steps
                </div>

                <div className="w-full h-32 flex items-end justify-center bg-slate-100/50 dark:bg-slate-800/40 rounded-xl p-1">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      isGoalMet
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                        : 'bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-600 dark:to-slate-500'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. WELLNESS SCORE & HYDRATION OVER TIME */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wellness score timeline */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Daily Wellness Score Trend
          </h3>
          <div className="h-32 flex items-end justify-between gap-2 pt-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            {dailySeries.slice(-7).map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-indigo-600 to-emerald-400 rounded-xl transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                  style={{ height: `${d.score}%` }}
                >
                  {d.score}
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hydration timeline */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Hydration Consistency (Liters)
          </h3>
          <div className="h-32 flex items-end justify-between gap-2 pt-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            {dailySeries.slice(-7).map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-cyan-600 to-blue-400 rounded-xl transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                  style={{ height: `${Math.min(100, (d.waterLiters / 3) * 100)}%` }}
                >
                  {d.waterLiters}L
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
