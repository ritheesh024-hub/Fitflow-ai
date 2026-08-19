import React from 'react';
import { useApp } from '../../context/AppContext';
import { TodayPlanCard } from '../plan/TodayPlanCard';
import { DailyCheckinCard } from './DailyCheckinCard';
import {
  Sparkles,
  Droplets,
  Dumbbell,
  Footprints,
  Moon,
  CheckSquare,
  ArrowUpRight,
  Plus,
  Flame,
  Bot,
  Calendar,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  Activity,
  Smile,
  Trophy,
  ShieldCheck,
} from 'lucide-react';

export const HomeDashboard: React.FC = () => {
  const {
    user,
    wellnessScore,
    todayHydration,
    addWater,
    todayActivity,
    workouts,
    todaySleep,
    habits,
    toggleHabit,
    dailyInsight,
    setActiveTab,
    openQuickAddWithType,
    startNewWorkout,
    isLoadingData,
    setIsDailySummaryOpen,
    fetchDailySummary,
    setIsWeeklyReviewOpen,
    fetchWeeklyReview,
    setIsPlanHistoryOpen,
  } = useApp();

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const todayStr = getTodayStr();

  const todayWorkout = workouts.find((w) => w.date === todayStr && w.completed);
  const completedHabitsCount = habits.filter((h) => h.completedDates.includes(todayStr)).length;
  const totalHabitsCount = habits.length;

  const waterPercent = Math.min(
    100,
    Math.round((todayHydration.waterMl / (todayHydration.goalMl || 2500)) * 100)
  );

  const stepTarget = user.dailyStepGoal || 8000;
  const stepPercent = Math.min(100, Math.round((todayActivity.steps / stepTarget) * 100));

  const hasData =
    todayActivity.steps > 0 ||
    todayHydration.waterMl > 0 ||
    !!todayWorkout ||
    !!todaySleep ||
    completedHabitsCount > 0;

  if (isLoadingData) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Skeleton Score Card */}
        <div className="h-56 rounded-3xl bg-slate-200 dark:bg-slate-800/60 w-full" />

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800/60" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. HERO: Today's Wellness Score Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20">
        {/* Glow accents */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left info */}
          <div className="space-y-2 max-w-md">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/10 text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Today’s Wellness Score</span>
            </div>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white">
                {wellnessScore.totalScore > 0 ? wellnessScore.totalScore : '—'}
              </span>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-bold text-emerald-300 flex items-center gap-0.5">
                  {wellnessScore.statusText}
                </span>
                <span className="text-xs text-indigo-200 font-medium">
                  {hasData
                    ? 'Transparent score from 5 balanced pillars'
                    : 'Complete a few activities to build your first score.'}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-indigo-100/80 font-normal leading-relaxed pt-1">
              Balanced daily index based on movement, workout recovery, hydration consistency, sleep rhythm, and daily habits.
            </p>
          </div>

          {/* Right: Category Breakdown Rings/Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-indigo-200">
                <span>Movement</span>
                <span className="text-white">{wellnessScore.activityScore}/20</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${(wellnessScore.activityScore / 20) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-indigo-200">
                <span>Workout</span>
                <span className="text-white">{wellnessScore.workoutScore}/20</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                  style={{ width: `${(wellnessScore.workoutScore / 20) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-indigo-200">
                <span>Hydration</span>
                <span className="text-white">{wellnessScore.hydrationScore}/20</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${(wellnessScore.hydrationScore / 20) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-indigo-200">
                <span>Sleep</span>
                <span className="text-white">{wellnessScore.sleepScore}/20</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${(wellnessScore.sleepScore / 20) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1 col-span-2 sm:col-span-2">
              <div className="flex justify-between text-[11px] font-semibold text-indigo-200">
                <span>Habits Completed</span>
                <span className="text-white">
                  {completedHabitsCount} of {totalHabitsCount}
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalHabitsCount ? (completedHabitsCount / totalHabitsCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 🤖 TODAY'S AI INSIGHT CARD (Requirement 2) */}
      <div
        id="home-ai-insight-card"
        className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-white to-emerald-50/70 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/60 shadow-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              🤖
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                {dailyInsight.headline || "Today's Insight"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Grounded analysis from your tracked daily activities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              id="ask-ai-insight-btn"
              onClick={() => setActiveTab('aicoach')}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
            <button
              id="view-details-insight-btn"
              onClick={() => {
                fetchDailySummary();
                setIsDailySummaryOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="pt-3">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            "{dailyInsight.suggestion || dailyInsight.observations?.[0] || 'Nice consistency today. You completed your planned workout and stayed active. Your hydration is still being tracked, so keep building that habit.'}"
          </p>
        </div>
      </div>

      {/* 3. AI DAILY CHECK-IN CARD (Requirement 4 & 5) */}
      <DailyCheckinCard />

      {/* 4. TODAY'S AI PERSONALIZED PLAN (Requirement 3 & 6) */}
      <TodayPlanCard />

      {/* 5. 🏆 WEEKLY REVIEW BANNER (Requirement 7 & 8) */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 text-white border border-emerald-800/60 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-emerald-300 border border-white/10">
            <Trophy className="w-3 h-3" />
            <span>Your Week ✨</span>
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white">
            AI Weekly Review & Consistency
          </h4>
          <p className="text-xs text-slate-300">
            Transparent breakdown of workouts, steps, hydration, and habit anchors.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            id="open-plan-history-btn"
            onClick={() => setIsPlanHistoryOpen(true)}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>My Plans</span>
          </button>
          <button
            id="open-weekly-review-btn"
            onClick={() => {
              fetchWeeklyReview();
              setIsWeeklyReviewOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>View Review</span>
          </button>
        </div>
      </div>

      {/* 6. COMPACT METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card A: Hydration */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-sm">
                  💧
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Hydration
                </span>
              </div>
              <button
                onClick={() => addWater(250)}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 transition-colors flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3 h-3" />
                <span>250ml</span>
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {(todayHydration.waterMl / 1000).toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                / {(todayHydration.goalMl / 1000).toFixed(1)} L
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {todayHydration.waterMl === 0 ? 'Start tracking hydration' : `${waterPercent}% of target`}
            </span>
            <button
              onClick={() => setActiveTab('hydration')}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
            >
              Details <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card B: Activity */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  🚶
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Activity
                </span>
              </div>
              <button
                onClick={() => openQuickAddWithType('activity')}
                className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                title="Add steps"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {todayActivity.steps.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-slate-400">steps</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              <span>{todayActivity.distanceKm} km</span>
              <span>•</span>
              <span>{todayActivity.activeMinutes} active mins</span>
            </div>

            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${stepPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {todayActivity.steps === 0
                ? 'Start tracking your activity.'
                : `${stepPercent}% of ${stepTarget.toLocaleString()} goal`}
            </span>
            <button
              onClick={() => setActiveTab('activity')}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
            >
              Details <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card C: Workout */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                  🏋️
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Workout
                </span>
              </div>
              {todayWorkout ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Done
                </span>
              ) : (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Ready</span>
              )}
            </div>

            {todayWorkout ? (
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                  {todayWorkout.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {todayWorkout.durationMinutes} mins • {todayWorkout.exercises.length} exercises logged
                </p>
              </div>
            ) : (
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Start Training Session
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Upper Body, Lower Body, or Custom Flow
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs">
            {todayWorkout ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Completed today ✓
              </span>
            ) : (
              <button
                onClick={() => startNewWorkout('Upper Body')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                + Start Workout
              </button>
            )}
            <button
              onClick={() => setActiveTab('workout')}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
            >
              Workout Hub <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card D: Sleep & Recovery */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                  😴
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Sleep & Recovery
                </span>
              </div>
              {todaySleep && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  {todaySleep.recoveryRating}
                </span>
              )}
            </div>

            {todaySleep ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {(todaySleep.durationMinutes / 60).toFixed(1)}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">hours sleep</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  Bedtime: {todaySleep.bedtime} • Energy:{' '}
                  {'★'.repeat(todaySleep.energyLevel)}
                </p>
              </div>
            ) : (
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  No sleep logged yet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Log your rest to calculate recovery score
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {todaySleep ? 'Restful night' : 'Log morning recovery'}
            </span>
            <button
              onClick={() => setActiveTab('sleep')}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
            >
              Sleep Log <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card E: Habits */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all sm:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                  ✅
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Today's Habits ({completedHabitsCount}/{totalHabitsCount})
                </span>
              </div>
              <button
                onClick={() => setActiveTab('habits')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                All Habits <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Quick interactive checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {habits.slice(0, 4).map((h) => {
                const isDone = h.completedDates.includes(todayStr);
                return (
                  <button
                    key={h.id}
                    onClick={() => toggleHabit(h.id)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{h.icon}</span>
                      <span className="text-xs font-semibold truncate">{h.name}</span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

