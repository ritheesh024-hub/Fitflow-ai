import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Dumbbell,
  Droplets,
  Footprints,
  Moon,
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
  Calendar,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Plus,
  Flame,
} from 'lucide-react';
import { DayOfWeekKey } from '../../types';

export const TodayPlanCard: React.FC = () => {
  const {
    activePlan,
    togglePlanTask,
    startWorkoutFromPlan,
    setPlanModalOpen,
    setPlanAdaptModalOpen,
    setPlanCreateModalOpen,
    todayHydration,
    todayActivity,
    workouts,
    todaySleep,
  } = useApp();

  // Determine current day of week (e.g. 'monday', 'tuesday', etc.)
  const dayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday, ...
  const dayKeys: DayOfWeekKey[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const currentDayKey = dayKeys[dayIndex];

  // If no active plan, show a banner to create an AI Personalized Plan
  if (!activePlan) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-7 shadow-xl shadow-indigo-950/20 border border-indigo-700/40">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Personalized Plan</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Ready for a personalized weekly routine? ✨
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed font-normal">
              Tell FitFlow AI what you want to improve, and get a balanced 7-day schedule with workouts, hydration goals, and restorative habits.
            </p>
          </div>

          <button
            onClick={() => setPlanCreateModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 flex items-center gap-2 active:scale-98 transition-all shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create AI Plan</span>
          </button>
        </div>
      </div>
    );
  }

  // Find today's schedule in the active plan
  const todaySchedule =
    activePlan.days.find((d) => d.dayOfWeek === currentDayKey) || activePlan.days[0];

  const isWorkoutDay = !!todaySchedule.workout;
  const completedTasksCount = todaySchedule.tasks.filter((t) => t.completed).length;
  const totalTasksCount = todaySchedule.tasks.length;
  const allTasksCompleted = totalTasksCount > 0 && completedTasksCount === totalTasksCount;

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60 shadow-lg shadow-indigo-900/5 dark:shadow-black/30 overflow-hidden transition-all">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-emerald-600 text-white px-5 sm:px-7 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-lg font-bold shadow-xs">
            {isWorkoutDay ? '🏋️' : '🌿'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md text-emerald-200">
                Today's Plan ({todaySchedule.dayName})
              </span>
              <span className="text-xs font-semibold text-indigo-100">
                {activePlan.title}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight mt-0.5">
              {todaySchedule.focusTheme}
            </h3>
          </div>
        </div>

        {/* Buttons to view full plan or adapt */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setPlanAdaptModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Adapt schedule if your day changed"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-300" />
            <span>Adapt Plan</span>
          </button>
          <button
            onClick={() => setPlanModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Weekly Plan</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-7 space-y-6">
        {/* Workout or Rest Highlight Box */}
        {isWorkoutDay && todaySchedule.workout ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-md">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-wider">
                  Target Session
                </span>
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  {todaySchedule.workout.durationMinutes} mins • {todaySchedule.workout.category}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {todaySchedule.workout.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Focus: {todaySchedule.workout.focus} • {todaySchedule.workout.exercises.length} exercises planned
              </p>
            </div>

            <button
              onClick={() => startWorkoutFromPlan(todaySchedule.workout!)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all shrink-0 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Workout</span>
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0">
              🌿
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-100">
                Active Recovery & Rest Day
              </h4>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed font-medium">
                No intense workout scheduled today. Focus on light walking, hydration, and restful evening recovery.
              </p>
            </div>
          </div>
        )}

        {/* Daily Tasks Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Today's Daily Checklist
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {completedTasksCount}/{totalTasksCount}
              </span>
            </div>
            {allTasksCompleted && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All complete!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {todaySchedule.tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => togglePlanTask(todaySchedule.dayOfWeek, task.id)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  task.completed
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 font-bold ${
                      task.completed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {task.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${task.completed ? 'line-through opacity-80' : ''}`}>
                      {task.title}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {task.category.toUpperCase()} • {task.targetValue || 'Daily habit'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Quick Row: Targets for Steps, Water, Sleep */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Movement</p>
            <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              {todaySchedule.activity.targetSteps.toLocaleString()} steps
            </p>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Hydration</p>
            <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              {(todaySchedule.hydration.targetMl / 1000).toFixed(1)} L Water
            </p>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Night Rest</p>
            <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              {todaySchedule.recovery.sleepTargetHours} hrs Sleep
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
