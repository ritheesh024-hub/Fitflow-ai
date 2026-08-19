import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Dumbbell,
  Clock,
  Layers,
  Award,
  Calendar,
} from 'lucide-react';
import { WorkoutSession } from '../../../types';

interface WorkoutAnalyticsViewProps {
  workouts: WorkoutSession[];
  weeklyGoal?: number;
}

const CATEGORY_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const WorkoutAnalyticsView: React.FC<WorkoutAnalyticsViewProps> = ({
  workouts,
  weeklyGoal = 4,
}) => {
  const completedWorkouts = workouts.filter((w) => w.completed);

  // Calculate past 7 days training
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    const matchingWorkouts = completedWorkouts.filter((w) => w.date === dStr);
    const totalMins = matchingWorkouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0);
    const count = matchingWorkouts.length;

    return {
      day: dayLabel,
      date: dStr,
      minutes: totalMins,
      workouts: count,
    };
  });

  const totalWeeklyMinutes = last7Days.reduce((acc, d) => acc + d.minutes, 0);
  const totalWeeklyWorkouts = last7Days.reduce((acc, d) => acc + d.workouts, 0);

  const hours = Math.floor(totalWeeklyMinutes / 60);
  const mins = totalWeeklyMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const totalExercises = completedWorkouts.reduce((acc, w) => acc + w.exercises.length, 0);
  const totalSets = completedWorkouts.reduce((acc, w) => {
    return acc + w.exercises.reduce((eAcc, ex) => eAcc + ex.sets.filter((s) => s.completed).length, 0);
  }, 0);

  // Category distribution
  const categoryCounts = completedWorkouts.reduce((acc: Record<string, number>, w) => {
    const cat = w.category || 'Custom';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      {/* 1. Summary Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">This Week</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalWeeklyWorkouts}
            </span>
            <span className="text-xs font-medium text-slate-400">/ {weeklyGoal} goal</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {totalWeeklyWorkouts >= weeklyGoal ? 'Goal achieved! 🎯' : `${weeklyGoal - totalWeeklyWorkouts} remaining`}
          </p>
        </div>

        <div className="p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Training Time</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {timeFormatted}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Past 7 days volume</p>
        </div>

        <div className="p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Exercises</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalExercises}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">All logged sessions</p>
        </div>

        <div className="p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Sets</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {totalSets}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Completed sets</p>
        </div>
      </div>

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Training Duration (7 Days) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Training Duration
              </h4>
              <p className="text-xs text-slate-400">Active workout minutes over the past week</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              7 Days
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  unit="m"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '16px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value} minutes`, 'Duration']}
                />
                <Bar dataKey="minutes" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Routine Focus</h4>
            <p className="text-xs text-slate-400">Distribution across training categories</p>
          </div>

          {pieData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Log workouts to visualize routine balance!
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {pieData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span>{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
