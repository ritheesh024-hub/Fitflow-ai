import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Droplets,
  Dumbbell,
  Footprints,
  Apple,
  Moon,
  Smile,
  CheckSquare,
  Plus,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { FoodCategory, WorkoutSession } from '../../types';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setQuickAddOpen,
    quickAddInitialType,
    addWater,
    addSteps,
    startNewWorkout,
    addMeal,
    logSleep,
    habits,
    toggleHabit,
    showToast,
  } = useApp();

  const [activeScreen, setActiveScreen] = useState<string | null>(null);

  // Subform states
  const [customWater, setCustomWater] = useState(250);
  const [customSteps, setCustomSteps] = useState(1500);
  const [mealName, setMealName] = useState('');
  const [mealNotes, setMealNotes] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [mealTime, setMealTime] = useState('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<FoodCategory[]>(['vegetables', 'protein']);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [sleepEnergy, setSleepEnergy] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [moodRating, setMoodRating] = useState<'energized' | 'calm' | 'tired' | 'stressed' | 'focused'>('energized');
  const [moodNote, setMoodNote] = useState('');

  useEffect(() => {
    if (isQuickAddOpen) {
      setActiveScreen(quickAddInitialType || null);
    } else {
      setActiveScreen(null);
    }
  }, [isQuickAddOpen, quickAddInitialType]);

  if (!isQuickAddOpen) return null;

  const handleClose = () => {
    setQuickAddOpen(false);
    setActiveScreen(null);
  };

  const toggleCategory = (cat: FoodCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;
    const finalTime = useCustomTime && mealTime
      ? mealTime
      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    addMeal({
      name: mealName.trim(),
      description: mealName.trim(),
      notes: mealNotes.trim() || undefined,
      mealType,
      categories: selectedCategories,
      time: finalTime,
    });
    setMealName('');
    setMealNotes('');
    setMealTime('');
    setUseCustomTime(false);
    handleClose();
  };

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    logSleep({
      durationMinutes: Math.round(sleepHours * 60),
      bedtime: '23:00',
      wakeTime: '06:30',
      energyLevel: sleepEnergy,
      recoveryRating: sleepEnergy >= 4 ? 'Good Recovery' : 'Fair Recovery',
    });
    handleClose();
  };

  const handleSaveMood = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Mood Logged 😊', `Feeling ${moodRating} today!`, 'success');
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm sm:max-w-md shadow-2xl p-5 sm:p-6 transition-all transform scale-100"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {activeScreen && (
              <button
                onClick={() => setActiveScreen(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              {activeScreen === 'water' && '💧 Log Hydration'}
              {activeScreen === 'workout' && '🏋️ Start Workout'}
              {activeScreen === 'activity' && '🚶 Log Movement'}
              {activeScreen === 'meal' && '🍎 Log Nourishing Meal'}
              {activeScreen === 'sleep' && '😴 Log Sleep & Rest'}
              {activeScreen === 'mood' && '😊 Log Energy & Mood'}
              {activeScreen === 'habit' && '✅ Complete Habits'}
              {!activeScreen && 'What do you want to track?'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-4">
          {/* Main Selection Grid */}
          {!activeScreen && (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setActiveScreen('water')}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-cyan-50/70 hover:bg-cyan-100/70 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/40 border border-cyan-200/60 dark:border-cyan-800/40 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                  💧
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Water</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Quick hydrate</p>
                </div>
              </button>

              <button
                onClick={() => setActiveScreen('workout')}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/70 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 border border-indigo-200/60 dark:border-indigo-800/40 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                  🏋️
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Workout</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Start session</p>
                </div>
              </button>

              <button
                onClick={() => setActiveScreen('activity')}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-800/40 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                  🚶
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Activity</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Steps & walk</p>
                </div>
              </button>

              <button
                onClick={() => setActiveScreen('meal')}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 border border-amber-200/60 dark:border-amber-800/40 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                  🍎
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Meal</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Balanced food</p>
                </div>
              </button>

              <button
                onClick={() => setActiveScreen('sleep')}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-purple-50/70 hover:bg-purple-100/70 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/40 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                  😴
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Sleep</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Rest & recovery</p>
                </div>
              </button>

              <button
                onClick={() => setActiveScreen('mood')}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 border border-rose-200/60 dark:border-rose-800/40 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                  😊
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Mood</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Energy check</p>
                </div>
              </button>

              <button
                onClick={() => setActiveScreen('habit')}
                className="col-span-2 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all"
              >
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                <span>Quick Check Today's Habits</span>
              </button>
            </div>
          )}

          {/* Subscreen: Water */}
          {activeScreen === 'water' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose a preset or add a custom amount of water:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[250, 500, 750].map((ml) => (
                  <button
                    key={ml}
                    onClick={() => {
                      addWater(ml);
                      handleClose();
                    }}
                    className="py-3 px-2 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 border border-cyan-200 dark:border-cyan-800 text-center transition-all font-semibold text-cyan-800 dark:text-cyan-200 active:scale-95"
                  >
                    +{ml} ml
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="number"
                  step="50"
                  min="50"
                  max="2000"
                  value={customWater}
                  onChange={(e) => setCustomWater(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  placeholder="Custom ml"
                />
                <button
                  onClick={() => {
                    addWater(customWater);
                    handleClose();
                  }}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold text-sm shrink-0 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Subscreen: Workout */}
          {activeScreen === 'workout' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose a training focus to launch your active session:
              </p>
              {(['Upper Body', 'Lower Body', 'Core & Cardio', 'Full Body'] as WorkoutSession['category'][]).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      startNewWorkout(cat);
                      handleClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🏋️</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{cat}</span>
                    </div>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Start →</span>
                  </button>
                )
              )}
            </div>
          )}

          {/* Subscreen: Activity */}
          {activeScreen === 'activity' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log steps or physical movement for today:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[1000, 2500, 5000].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      addSteps(s);
                      handleClose();
                    }}
                    className="py-3 px-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-center transition-all font-semibold text-emerald-800 dark:text-emerald-200 active:scale-95"
                  >
                    +{s.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="number"
                  step="100"
                  min="100"
                  max="30000"
                  value={customSteps}
                  onChange={(e) => setCustomSteps(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  placeholder="Custom steps"
                />
                <button
                  onClick={() => {
                    addSteps(customSteps);
                    handleClose();
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shrink-0 transition-colors"
                >
                  Log
                </button>
              </div>
            </div>
          )}

          {/* Subscreen: Meal */}
          {activeScreen === 'meal' && (
            <form onSubmit={handleSaveMeal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Meal Name & Items
                </label>
                <input
                  type="text"
                  required
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g. Grilled Salmon Salad with Quinoa"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Meal Time
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMealType(t)}
                      className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                        mealType === t
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Nourishing Categories Present
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'fruits', label: '🍎 Fruits' },
                    { id: 'vegetables', label: '🥦 Veggies' },
                    { id: 'protein', label: '🥩 Protein' },
                    { id: 'grains', label: '🌾 Whole Grains' },
                    { id: 'healthy_fats', label: '🥑 Healthy Fats' },
                    { id: 'fluids', label: '💧 Fluids' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCategory(c.id as FoodCategory)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        selectedCategories.includes(c.id as FoodCategory)
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm transition-colors mt-2"
              >
                Save Meal Log
              </button>
            </form>
          )}

          {/* Subscreen: Sleep */}
          {activeScreen === 'sleep' && (
            <form onSubmit={handleSaveSleep} className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  <span>Sleep Duration</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{sleepHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Morning Energy & Recovery Rating
                </label>
                <div className="grid grid-cols-5 gap-1 text-center">
                  {([1, 2, 3, 4, 5] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSleepEnergy(lvl)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        sleepEnergy === lvl
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {lvl === 1 && '😴 Low'}
                      {lvl === 2 && '🥱 Fair'}
                      {lvl === 3 && '🙂 Okay'}
                      {lvl === 4 && '⚡ Good'}
                      {lvl === 5 && '🌟 Peak'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-colors mt-2"
              >
                Log Sleep Record
              </button>
            </form>
          )}

          {/* Subscreen: Mood */}
          {activeScreen === 'mood' && (
            <form onSubmit={handleSaveMood} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  How are you feeling right now?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'energized', label: '⚡ Energized' },
                    { id: 'calm', label: '🌿 Calm' },
                    { id: 'focused', label: '🎯 Focused' },
                    { id: 'tired', label: '🥱 Tired' },
                    { id: 'stressed', label: '💨 Busy' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMoodRating(m.id as any)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-colors ${
                        moodRating === m.id
                          ? 'bg-rose-500 border-rose-500 text-white'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Optional Note
                </label>
                <input
                  type="text"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  placeholder="e.g. Great morning focus after yoga"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm transition-colors mt-2"
              >
                Save Mood Check
              </button>
            </form>
          )}

          {/* Subscreen: Habit Quick Complete */}
          {activeScreen === 'habit' && (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Tap to toggle habits completed today:
              </p>
              {habits.map((h) => {
                const today = new Date().toISOString().split('T')[0];
                const done = h.completedDates.includes(today);
                return (
                  <button
                    key={h.id}
                    onClick={() => toggleHabit(h.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      done
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{h.icon}</span>
                      <div>
                        <p className="text-sm font-semibold">{h.name}</p>
                        <p className="text-[11px] opacity-75">{h.streak} day streak</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                        done
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
