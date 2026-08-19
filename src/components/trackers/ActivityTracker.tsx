import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityType, DistanceUnit, ActivityLogEntry } from '../../types';
import {
  Footprints,
  Plus,
  Flame,
  MapPin,
  Clock,
  TrendingUp,
  Calendar,
  Layers,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Info,
  X,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

export const ActivityTracker: React.FC = () => {
  const { todayActivity, activities, logActivity, user } = useApp();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [activeMetricChart, setActiveMetricChart] = useState<'steps' | 'minutes' | 'distance'>('steps');
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isHealthConnectModalOpen, setIsHealthConnectModalOpen] = useState(false);

  // Quick Add Form State
  const [formSteps, setFormSteps] = useState<number>(2500);
  const [formDistance, setFormDistance] = useState<string>('1.8');
  const [formUnit, setFormUnit] = useState<DistanceUnit>('km');
  const [formMinutes, setFormMinutes] = useState<number>(25);
  const [formType, setFormType] = useState<ActivityType>('walking');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState<string | null>(null);

  const goal = user.dailyStepGoal || 8000;
  const currentSteps = todayActivity.steps || 0;
  const stepPercent = Math.min(100, Math.round((currentSteps / goal) * 100));

  // Circular progress stroke calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stepPercent / 100) * circumference;

  // Format today's string
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper for generating range days
  const rangeDaysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

  const chartData = useMemo(() => {
    const dataList = [];
    const dateMap = new Map<string, typeof todayActivity>();
    activities.forEach((act) => dateMap.set(act.date, act));

    for (let i = rangeDaysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const found = dateMap.get(dStr);

      const dayName =
        rangeDaysCount <= 7
          ? d.toLocaleDateString(undefined, { weekday: 'short' })
          : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      dataList.push({
        date: dStr,
        dayName,
        isToday: dStr === todayStr,
        steps: found ? found.steps : 0,
        minutes: found ? found.activeMinutes : 0,
        distance: found ? found.distanceKm : 0,
      });
    }
    return dataList;
  }, [activities, rangeDaysCount, todayStr]);

  // Weekly summary calculations
  const past7DaysData = useMemo(() => {
    const dateMap = new Map<string, typeof todayActivity>();
    activities.forEach((act) => dateMap.set(act.date, act));
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const found = dateMap.get(dStr);
      list.push({
        date: dStr,
        steps: found ? found.steps : 0,
        distance: found ? found.distanceKm : 0,
        minutes: found ? found.activeMinutes : 0,
      });
    }
    return list;
  }, [activities]);

  const totalSteps7d = past7DaysData.reduce((acc, d) => acc + d.steps, 0);
  const avgSteps7d = Math.round(totalSteps7d / 7);
  const totalDist7d = Number(past7DaysData.reduce((acc, d) => acc + d.distance, 0).toFixed(1));
  const totalMins7d = past7DaysData.reduce((acc, d) => acc + d.minutes, 0);
  const activeDays7d = past7DaysData.filter((d) => d.steps > 0 || d.minutes > 0).length;

  const handleOpenAddModal = (presetType?: ActivityType) => {
    if (presetType) setFormType(presetType);
    setFormDate(todayStr);
    setFormError(null);
    setIsQuickAddModalOpen(true);
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formSteps < 0 || formMinutes < 0 || Number(formDistance) < 0) {
      setFormError('Values cannot be negative. Please check your inputs.');
      return;
    }

    try {
      await logActivity({
        steps: Number(formSteps) || 0,
        distance: Number(formDistance) || 0,
        distanceUnit: formUnit,
        activeMinutes: Number(formMinutes) || 0,
        activityType: formType,
        date: formDate,
      });
      setIsQuickAddModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save activity.');
    }
  };

  const ACTIVITY_TYPE_CONFIG: Record<
    ActivityType,
    { label: string; icon: string; defaultUnit: string }
  > = {
    walking: { label: 'Walking', icon: '🚶', defaultUnit: 'km' },
    running: { label: 'Running', icon: '🏃', defaultUnit: 'km' },
    cycling: { label: 'Cycling', icon: '🚴', defaultUnit: 'km' },
    sports: { label: 'Sports & Games', icon: '⚽', defaultUnit: 'km' },
    other: { label: 'Other Movement', icon: '✨', defaultUnit: 'km' },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <Footprints className="w-4 h-4" />
            <span>Daily Movement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Today's Movement 🚶
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            "Every bit of movement counts."
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenAddModal('walking')}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Activity</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN CARD: TODAY'S STEPS & ROUNDED PROGRESS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Circular Progress & Metrics */}
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 w-full lg:w-auto">
            {/* Visual Circular Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                {/* Background Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Progress Arc */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-emerald-500 transition-all duration-1000 ease-out"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {stepPercent}%
                </span>
                <span className="text-[11px] font-semibold text-slate-400">of daily goal</span>
              </div>
            </div>

            {/* Step Count & Description */}
            <div className="text-center sm:text-left space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Steps
              </span>
              <div className="flex items-baseline justify-center sm:justify-start gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentSteps.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-slate-400">
                  / {goal.toLocaleString()} steps
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {currentSteps === 0 ? (
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    Start tracking your movement today.
                  </span>
                ) : stepPercent >= 100 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Target achieved! Fantastic dedication today 🌟
                  </span>
                ) : (
                  `${(goal - currentSteps).toLocaleString()} steps remaining to hit your target`
                )}
              </p>
            </div>
          </div>

          {/* Key Sub-metrics */}
          <div className="grid grid-cols-3 gap-3.5 w-full lg:w-auto">
            {/* Distance */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center min-w-[100px]">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
              <span className="block text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {todayActivity.distanceKm}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Distance (km)</span>
            </div>

            {/* Active Minutes */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center min-w-[100px]">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mx-auto mb-1.5" />
              <span className="block text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {todayActivity.activeMinutes}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Active Mins</span>
            </div>

            {/* Approx Energy */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center min-w-[100px]">
              <Flame className="w-4 h-4 text-amber-500 mx-auto mb-1.5" />
              <span className="block text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                ~{todayActivity.approxCalories}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Approx kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. THIS WEEK: 7-DAY SUMMARY & HIGHLIGHT CARD */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">This Week</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personal weekly movement consistency without comparisons.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              {activeDays7d} of 7 Active Days
            </span>
          </div>
        </div>

        {/* 4 Weekly Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Average Steps
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {avgSteps7d.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">steps / day</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Distance
            </span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {totalDist7d}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">km logged</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Active Minutes
            </span>
            <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {totalMins7d}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">total minutes</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Active Days
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {activeDays7d} / 7
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">consistent days</span>
          </div>
        </div>

        {/* 7-Day Highlight Mini Bar Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>7-Day Activity Flow</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Today highlighted
            </span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.slice(-7)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="dayName" tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString()} steps`, 'Daily Steps']}
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar
                  dataKey="steps"
                  radius={[8, 8, 0, 0]}
                  fill="#10b981"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. ACTIVITY HISTORY & INTERACTIVE CHARTS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Activity History</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track multi-week progress and movement patterns.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setActiveMetricChart('steps')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeMetricChart === 'steps'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Steps
              </button>
              <button
                onClick={() => setActiveMetricChart('minutes')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeMetricChart === 'minutes'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Active Mins
              </button>
              <button
                onClick={() => setActiveMetricChart('distance')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeMetricChart === 'distance'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Distance
              </button>
            </div>

            {/* Time Range Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {(['7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                    timeRange === r
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis dataKey="dayName" tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(val: any) => [
                  activeMetricChart === 'steps'
                    ? `${Number(val).toLocaleString()} steps`
                    : activeMetricChart === 'minutes'
                    ? `${val} minutes`
                    : `${val} km`,
                  activeMetricChart === 'steps' ? 'Steps' : activeMetricChart === 'minutes' ? 'Minutes' : 'Distance',
                ]}
                contentStyle={{
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              />
              <Area
                type="monotone"
                dataKey={activeMetricChart}
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#activityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Activity List Logs */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Daily Breakdown
          </h3>

          {activities.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Nothing tracked yet.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Your progress will appear here as you track.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {activities.slice(0, 10).map((act) => {
                const isToday = act.date === todayStr;
                return (
                  <div
                    key={act.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base shrink-0">
                        <Footprints className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {isToday ? 'Today' : act.date}
                          </span>
                          {isToday && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {act.logs?.length || 1} logged session{act.logs && act.logs.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-sm text-slate-900 dark:text-white block">
                        {act.steps.toLocaleString()} steps
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {act.distanceKm} km • {act.activeMinutes} mins
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. DEVICE INTEGRATION & HEALTH DATA STATUS CARD */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Connect Health Data
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Status: <span className="font-semibold text-slate-600 dark:text-slate-300">Manual Tracking Active (Health sync coming soon)</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsHealthConnectModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            Configure Integrations
          </button>
        </div>
      </div>

      {/* MODAL 1: MANUAL QUICK ADD ACTIVITY */}
      {isQuickAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-sm">
                  🚶
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Log Movement Entry
                </h3>
              </div>
              <button
                onClick={() => setIsQuickAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveActivity} className="mt-4 space-y-4">
              {/* Activity Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Activity Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['walking', 'running', 'cycling', 'sports', 'other'] as ActivityType[]).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setFormType(type)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        formType === type
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-base">{ACTIVITY_TYPE_CONFIG[type].icon}</span>
                      <span className="capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Steps Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Steps Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={formSteps}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormSteps(val);
                    // auto calculate approx distance if standard walking/running
                    if (val > 0) {
                      const estKm = ((val * 0.75) / 1000).toFixed(2);
                      setFormDistance(estKm);
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Distance & Unit */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Distance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formDistance}
                    onChange={(e) => setFormDistance(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unit
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value as DistanceUnit)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="km">km</option>
                    <option value="mi">mi</option>
                  </select>
                </div>
              </div>

              {/* Active Minutes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Active Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  value={formMinutes}
                  onChange={(e) => setFormMinutes(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 active:scale-95 transition-all"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: HEALTH CONNECT ARCHITECTURE MODAL */}
      {isHealthConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Device & Health Providers
                </h3>
              </div>
              <button
                onClick={() => setIsHealthConnectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              FitFlow AI is architected with a modular <code className="text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">activityProvider</code> pipeline ready for native health syncing.
            </p>

            <div className="space-y-2.5">
              {/* Manual Provider (Active) */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">✍️</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Manual Input Provider
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      Active & Synced to Firestore
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                  Active
                </span>
              </div>

              {/* Apple Health (HealthKit) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🍎</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Apple Health (HealthKit)
                    </h4>
                    <p className="text-[11px] text-slate-400">iOS platform sync</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  Coming Soon
                </span>
              </div>

              {/* Health Connect (Android) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🤖</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Health Connect / Google Fit
                    </h4>
                    <p className="text-[11px] text-slate-400">Android health data</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  Coming Soon
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsHealthConnectModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
