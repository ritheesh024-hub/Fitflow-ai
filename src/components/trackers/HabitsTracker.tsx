import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Habit, HabitCategory, HabitFrequency } from '../../types';
import {
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Trophy,
  Calendar,
  Sparkles,
  Trash2,
  Edit2,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

const CATEGORY_STYLES: Record<
  HabitCategory,
  { bg: string; text: string; border: string; label: string }
> = {
  movement: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    label: 'Movement',
  },
  hydration: {
    bg: 'bg-sky-50 dark:bg-sky-950/60',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800',
    label: 'Hydration',
  },
  nutrition: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    label: 'Nutrition',
  },
  sleep: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    label: 'Sleep & Recovery',
  },
  mindfulness: {
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    label: 'Mindfulness',
  },
  lifestyle: {
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    label: 'Lifestyle',
  },
  fitness: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    label: 'Fitness',
  },
  recovery: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    label: 'Recovery',
  },
  mindset: {
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    label: 'Mindset',
  },
  general: {
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    label: 'General',
  },
};

const SUGGESTED_ICONS = ['💧', '🚶', '😴', '🧘', '🥗', '🏋️', '📚', '☀️', '🍵', '🚴', '🌿', '🍎'];

export const HabitsTracker: React.FC = () => {
  const { habits, toggleHabit, createHabit, deleteHabit, updateHabit } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');

  // New habit form state
  const [habitName, setHabitName] = useState('');
  const [habitIcon, setHabitIcon] = useState('✨');
  const [habitDescription, setHabitDescription] = useState('');
  const [habitCategory, setHabitCategory] = useState<HabitCategory>('lifestyle');
  const [habitFrequency, setHabitFrequency] = useState<HabitFrequency>('daily');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [formError, setFormError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // 7-day window for matrix and quick toggles
  const past7Days = useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      list.push({
        date: dStr,
        dayName: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
        dayShort: d.toLocaleDateString(undefined, { weekday: 'short' }),
        isToday: dStr === todayStr,
      });
    }
    return list;
  }, [todayStr]);

  // Filter habits
  const filteredHabits = useMemo(() => {
    if (selectedCategoryFilter === 'all') return habits;
    return habits.filter((h) => h.category === selectedCategoryFilter);
  }, [habits, selectedCategoryFilter]);

  // Overall metrics
  const activeHabits = habits.filter((h) => h.active);
  const completedTodayCount = activeHabits.filter((h) =>
    h.completedDates.includes(todayStr)
  ).length;
  const todayCompletionRate =
    activeHabits.length > 0
      ? Math.round((completedTodayCount / activeHabits.length) * 100)
      : 0;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) {
      setFormError('Please enter a name for your habit.');
      return;
    }

    try {
      await createHabit({
        name: habitName.trim(),
        icon: habitIcon,
        description: habitDescription.trim(),
        category: habitCategory,
        frequency: habitFrequency,
        reminderEnabled,
        reminderTime,
      });
      // Reset form
      setHabitName('');
      setHabitIcon('✨');
      setHabitDescription('');
      setFormError(null);
      setIsAddModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Could not create habit.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Habits & Routines</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Daily Habits ✨
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            "Small steps every day create lasting lifestyle change."
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'matrix'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              7-Day Matrix
            </button>
          </div>

          <button
            onClick={() => {
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Habit</span>
          </button>
        </div>
      </div>

      {/* 2. TODAY'S PROGRESS BANNER */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl shrink-0">
            {todayCompletionRate}%
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {completedTodayCount} of {activeHabits.length} Habits Completed Today
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {todayCompletionRate === 100 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  All done for today! Outstanding discipline 🎉
                </span>
              ) : (
                'Non-shaming momentum: Every completed check-in solidifies your routine.'
              )}
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto self-start sm:self-auto">
          {['all', 'movement', 'hydration', 'nutrition', 'sleep', 'mindfulness', 'lifestyle'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedCategoryFilter === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* 3. VIEW 1: HABIT CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHabits.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <span className="text-4xl">✨</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No habits found in this category.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Create a habit like drinking water, daily walks, or evening stretching to begin tracking!
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Create Your First Habit
              </button>
            </div>
          ) : (
            filteredHabits.map((habit) => {
              const isCompletedToday = habit.completedDates.includes(todayStr);
              const catStyle = CATEGORY_STYLES[habit.category] || CATEGORY_STYLES.lifestyle;

              return (
                <div
                  key={habit.id}
                  className={`p-6 rounded-3xl border transition-all duration-200 shadow-xs bg-white dark:bg-slate-900 flex flex-col justify-between gap-5 ${
                    isCompletedToday
                      ? 'border-emerald-500/50 dark:border-emerald-500/40'
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {/* Top Bar: Icon, Name, Category */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                        {habit.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {habit.name}
                          </h3>
                        </div>
                        {habit.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {habit.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                          >
                            {catStyle.label}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {habit.frequency}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete Action */}
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 dark:text-slate-600 transition-colors"
                      title="Delete habit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Middle: Streaks and 7-Day Mini Dots */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                        <Flame className="w-4 h-4" />
                        <span>{habit.streak}-day streak</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Trophy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Best: {habit.bestStreak} days</span>
                      </div>
                    </div>

                    {/* 7-Day Quick Toggles */}
                    <div className="flex items-center justify-between gap-1">
                      {past7Days.map((d) => {
                        const isDone = habit.completedDates.includes(d.date);
                        return (
                          <button
                            key={d.date}
                            onClick={() => toggleHabit(habit.id, d.date)}
                            className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                              isDone
                                ? 'bg-emerald-500 text-white font-bold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                            title={`${d.dayShort} (${d.date}): ${isDone ? 'Completed' : 'Not completed'}`}
                          >
                            <span className="text-[10px] uppercase">{d.dayName}</span>
                            {isDone ? (
                              <Check className="w-3 h-3 stroke-[3]" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Big Check-In Button for Today */}
                  <button
                    onClick={() => toggleHabit(habit.id, todayStr)}
                    className={`w-full py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer ${
                      isCompletedToday
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700/80'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'
                    }`}
                  >
                    {isCompletedToday ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed Today ✓</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" />
                        <span>Mark as Completed</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 4. VIEW 2: 7-DAY MATRIX GRID VIEW */}
      {viewMode === 'matrix' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 overflow-x-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                7-Day Consistency Matrix
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any cell to toggle past or present check-ins.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">Past 7 Days</span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Habit
                </th>
                <th className="py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  Streak
                </th>
                {past7Days.map((d) => (
                  <th
                    key={d.date}
                    className={`py-3 px-2 text-xs font-bold text-center ${
                      d.isToday ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400'
                    }`}
                  >
                    <span className="block">{d.dayShort}</span>
                    <span className="text-[10px] font-normal">{d.date.slice(5)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredHabits.map((habit) => (
                <tr key={habit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{habit.icon}</span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {habit.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      🔥 {habit.streak}
                    </span>
                  </td>
                  {past7Days.map((d) => {
                    const isDone = habit.completedDates.includes(d.date);
                    return (
                      <td key={d.date} className="py-3.5 px-2 text-center">
                        <button
                          onClick={() => toggleHabit(habit.id, d.date)}
                          className={`w-8 h-8 rounded-xl mx-auto flex items-center justify-center transition-all cursor-pointer ${
                            isDone
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Circle className="w-3.5 h-3.5 opacity-40" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: CREATE CUSTOM HABIT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Create Custom Habit
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Habit Icon
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {SUGGESTED_ICONS.map((ic) => (
                    <button
                      type="button"
                      key={ic}
                      onClick={() => setHabitIcon(ic)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                        habitIcon === ic
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 scale-110 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Habit Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10-Minute Morning Stretch"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Why this habit matters to your wellness flow"
                  value={habitDescription}
                  onChange={(e) => setHabitDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value as HabitCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="movement">Movement</option>
                    <option value="hydration">Hydration</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="sleep">Sleep & Recovery</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="lifestyle">Lifestyle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Frequency
                  </label>
                  <select
                    value={habitFrequency}
                    onChange={(e) => setHabitFrequency(e.target.value as HabitFrequency)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              {/* Reminder Config */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Set Daily Reminder Time
                  </span>
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="w-4 h-4 rounded-md text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                {reminderEnabled && (
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
