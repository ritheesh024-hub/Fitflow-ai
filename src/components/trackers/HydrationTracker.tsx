import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { HydrationEntry } from '../../types';
import {
  Droplets,
  Plus,
  Minus,
  Sparkles,
  Settings,
  Bell,
  Trash2,
  Edit2,
  CheckCircle2,
  Calendar,
  Clock,
  TrendingUp,
  X,
  Check,
  Volume2,
  Moon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export const HydrationTracker: React.FC = () => {
  const {
    todayHydration,
    hydrations,
    addWater,
    editWaterEntry,
    deleteWaterEntry,
    setWaterGoal,
    hydrationSettings,
    updateHydrationSettings,
    user,
  } = useApp();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCustomAddOpen, setIsCustomAddOpen] = useState(false);
  const [customMl, setCustomMl] = useState<number>(350);

  // Edit entry state
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingAmountMl, setEditingAmountMl] = useState<number>(250);

  // Goal config state
  const [newGoalInput, setNewGoalInput] = useState<number>(todayHydration.goalMl || user.waterGoalMl || 2500);

  // Reminder settings form
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(hydrationSettings.enabled);
  const [reminderInterval, setReminderInterval] = useState<number>(hydrationSettings.intervalHours);
  const [quietStart, setQuietStart] = useState<string>(hydrationSettings.quietHoursStart);
  const [quietEnd, setQuietEnd] = useState<string>(hydrationSettings.quietHoursEnd);

  const goal = todayHydration.goalMl || user.waterGoalMl || 2500;
  const currentWater = todayHydration.waterMl || 0;
  const progressPercent = Math.min(100, Math.round((currentWater / Math.max(1, goal)) * 100));
  const remainingMl = Math.max(0, goal - currentWater);

  // Circular gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // 7-day hydration chart data
  const todayStr = new Date().toISOString().split('T')[0];
  const chart7dData = useMemo(() => {
    const dataMap = new Map<string, typeof todayHydration>();
    hydrations.forEach((h) => dataMap.set(h.date, h));
    const list = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const found = dataMap.get(dStr);
      const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });

      list.push({
        date: dStr,
        dayName,
        isToday: dStr === todayStr,
        amountMl: found ? found.waterMl : 0,
        goalMl: found ? found.goalMl : goal,
        metGoal: found ? found.waterMl >= (found.goalMl || goal) : false,
      });
    }
    return list;
  }, [hydrations, todayStr, goal]);

  const avgIntake7d = Math.round(
    chart7dData.reduce((acc, d) => acc + d.amountMl, 0) / 7
  );
  const daysMetGoal7d = chart7dData.filter((d) => d.metGoal).length;

  const handleAddPreset = async (amount: number) => {
    await addWater(amount);
  };

  const handleCustomAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customMl <= 0) return;
    await addWater(Number(customMl));
    setIsCustomAddOpen(false);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalInput < 500) return;
    await setWaterGoal(Number(newGoalInput));
    setIsGoalModalOpen(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateHydrationSettings({
      enabled: reminderEnabled,
      intervalHours: reminderInterval,
      quietHoursStart: quietStart,
      quietHoursEnd: quietEnd,
    });
    setIsSettingsModalOpen(false);
  };

  const handleSaveEditEntry = async (entryId: string) => {
    if (editingAmountMl <= 0) return;
    await editWaterEntry(entryId, editingAmountMl);
    setEditingEntryId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            <Droplets className="w-4 h-4" />
            <span>Hydration & Vitality</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Daily Hydration 💧
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            "Stay refreshed and energized throughout the day."
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-sky-500" />
            <span>Reminders</span>
          </button>

          <button
            onClick={() => {
              setNewGoalInput(goal);
              setIsGoalModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Target ({goal}ml)</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN HYDRATION CARD: CIRCULAR PROGRESS + QUICK LOGGING */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Progress Circular Gauge */}
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 w-full lg:w-auto">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-sky-500 transition-all duration-1000 ease-out"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {progressPercent}%
                </span>
                <span className="text-[11px] font-semibold text-slate-400">of daily target</span>
              </div>
            </div>

            {/* Current vs Target */}
            <div className="text-center sm:text-left space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Water Intake
              </span>
              <div className="flex items-baseline justify-center sm:justify-start gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentWater.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-slate-400">
                  / {goal.toLocaleString()} ml
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {currentWater === 0 ? (
                  <span className="text-sky-600 dark:text-sky-400 font-semibold">
                    Start logging your water intake today.
                  </span>
                ) : remainingMl > 0 ? (
                  `${remainingMl.toLocaleString()} ml remaining to reach your target`
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Target achieved! Excellent hydration today 💧
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3.5 w-full lg:w-auto">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center min-w-[120px]">
              <span className="block text-xl font-bold text-sky-600 dark:text-sky-400">
                {(currentWater / 1000).toFixed(1)} L
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Logged Volume</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center min-w-[120px]">
              <span className="block text-xl font-bold text-slate-900 dark:text-white">
                {todayHydration.entries?.length || 0}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Check-ins</span>
            </div>
          </div>
        </div>

        {/* Quick Log Action Buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Quick Add Intake
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleAddPreset(250)}
              className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 border border-sky-200/60 dark:border-sky-800/60 text-sky-900 dark:text-sky-200 flex items-center justify-center gap-2 font-bold text-xs active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-lg">🥛</span>
              <span>+250 ml (Glass)</span>
            </button>

            <button
              onClick={() => handleAddPreset(500)}
              className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 border border-sky-200/60 dark:border-sky-800/60 text-sky-900 dark:text-sky-200 flex items-center justify-center gap-2 font-bold text-xs active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-lg">🧴</span>
              <span>+500 ml (Bottle)</span>
            </button>

            <button
              onClick={() => handleAddPreset(750)}
              className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 border border-sky-200/60 dark:border-sky-800/60 text-sky-900 dark:text-sky-200 flex items-center justify-center gap-2 font-bold text-xs active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-lg">🫙</span>
              <span>+750 ml (Large)</span>
            </button>

            <button
              onClick={() => setIsCustomAddOpen(true)}
              className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 font-bold text-xs active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Custom Amount</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. TODAY'S HYDRATION LOG & ENTRIES */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Log</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recent hydration timestamps and adjustments.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {todayHydration.entries?.length || 0} entries
          </span>
        </div>

        {todayHydration.entries.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              No hydration logged yet today.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Tap any quick add button above to record your first glass.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {todayHydration.entries.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm">
                    💧
                  </div>
                  <div>
                    {editingEntryId === entry.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editingAmountMl}
                          onChange={(e) => setEditingAmountMl(Number(e.target.value))}
                          className="w-24 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 text-xs font-bold"
                          min="10"
                        />
                        <button
                          onClick={() => handleSaveEditEntry(entry.id)}
                          className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingEntryId(null)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        +{entry.amountMl} ml
                      </span>
                    )}
                    <span className="block text-[11px] text-slate-400 font-medium">
                      {entry.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingEntryId(entry.id);
                      setEditingAmountMl(entry.amountMl);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit entry"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteWaterEntry(entry.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. 7-DAY HYDRATION HISTORY CHART */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              7-Day Hydration Flow
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily intake compared against target goal.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">
              Avg: <strong className="text-slate-900 dark:text-white">{(avgIntake7d / 1000).toFixed(1)}L/day</strong>
            </span>
            <span className="px-2.5 py-1 rounded-full font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              {daysMetGoal7d} of 7 Goal Days
            </span>
          </div>
        </div>

        <div className="h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart7dData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis dataKey="dayName" tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(val: any) => [`${val} ml`, 'Water Intake']}
                contentStyle={{
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              />
              <ReferenceLine y={goal} stroke="#0ea5e9" strokeDasharray="3 3" label={{ value: 'Target', fill: '#0ea5e9', fontSize: 10 }} />
              <Bar dataKey="amountMl" radius={[8, 8, 0, 0]} fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MODAL: CUSTOM AMOUNT */}
      {isCustomAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Log Custom Intake
              </h3>
              <button onClick={() => setIsCustomAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCustomAdd} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Water Volume (ml)
                </label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={customMl}
                  onChange={(e) => setCustomMl(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-base focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all"
                >
                  Add Water
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TARGET CONFIGURATION */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Set Daily Hydration Target
              </h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target (ml)
                </label>
                <input
                  type="number"
                  min="500"
                  step="100"
                  value={newGoalInput}
                  onChange={(e) => setNewGoalInput(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-base focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              {/* Quick Preset targets */}
              <div className="grid grid-cols-3 gap-2">
                {[2000, 2500, 3000].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setNewGoalInput(preset)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  >
                    {(preset / 1000).toFixed(1)} L
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all"
                >
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HYDRATION REMINDER SETTINGS */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-sky-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Hydration Reminders
                </h3>
              </div>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="mt-4 space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">
                    Enable Reminders
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Receive gentle nudge notifications
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="w-5 h-5 rounded-md text-sky-600 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reminder Interval
                </label>
                <select
                  value={reminderInterval}
                  onChange={(e) => setReminderInterval(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                >
                  <option value={1}>Every 1 hour</option>
                  <option value={2}>Every 2 hours (Recommended)</option>
                  <option value={3}>Every 3 hours</option>
                  <option value={4}>Every 4 hours</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quiet Hours (From)
                  </label>
                  <input
                    type="time"
                    value={quietStart}
                    onChange={(e) => setQuietStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quiet Hours (Until)
                  </label>
                  <input
                    type="time"
                    value={quietEnd}
                    onChange={(e) => setQuietEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
