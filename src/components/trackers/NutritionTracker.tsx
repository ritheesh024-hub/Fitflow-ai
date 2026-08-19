import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Apple, Plus, Sparkles, Heart, Trash2, Shield } from 'lucide-react';
import { FoodCategory, MealItem } from '../../types';

export const NutritionTracker: React.FC = () => {
  const { todayMeals, addMeal, deleteMeal } = useApp();

  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [selectedCategories, setSelectedCategories] = useState<FoodCategory[]>(['fruits', 'grains']);

  const FOOD_CATEGORIES: { id: FoodCategory; label: string; icon: string; desc: string }[] = [
    { id: 'fruits', label: 'Fruits', icon: '🍎', desc: 'Vitamins & natural energy' },
    { id: 'vegetables', label: 'Vegetables', icon: '🥦', desc: 'Fiber & micronutrients' },
    { id: 'protein', label: 'Protein', icon: '🥩', desc: 'Muscle repair & satiety' },
    { id: 'grains', label: 'Whole Grains', icon: '🌾', desc: 'Sustained energy' },
    { id: 'healthy_fats', label: 'Healthy Fats', icon: '🥑', desc: 'Hormone balance & brain health' },
    { id: 'fluids', label: 'Fluids & Broths', icon: '🍵', desc: 'Hydration & minerals' },
  ];

  const toggleCategory = (cat: FoodCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;
    addMeal({
      name: mealName.trim(),
      mealType,
      categories: selectedCategories,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setMealName('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. PRODUCT PHILOSOPHY BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-200/60 dark:border-amber-900/40">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
            🥗
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Nourishing, Mindful Nutrition
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              FitFlow AI focuses on variety, nourishment, and steady daily energy — without calorie obsession or restrictive diets. Log what energized your body today!
            </p>
          </div>
        </div>
      </div>

      {/* 2. ADD MEAL FORM */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Log a Nourishing Meal
          </h3>
          <span className="text-xs text-slate-400 font-medium">Daily Food Group Log</span>
        </div>

        <form onSubmit={handleAddMeal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Meal Name & Details
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Oatmeal with blueberries, walnuts, and almond milk"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Meal Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMealType(t)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl capitalize transition-colors ${
                    mealType === t
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {t === 'breakfast' && '🍳 Breakfast'}
                  {t === 'lunch' && '🥗 Lunch'}
                  {t === 'dinner' && '🍲 Dinner'}
                  {t === 'snack' && '🍎 Snack'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Food Groups Present
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FOOD_CATEGORIES.map((cat) => {
                const selected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selected
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-100 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-xs">{cat.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold text-sm shadow-md shadow-amber-500/20 active:scale-98 transition-all"
          >
            + Save Meal
          </button>
        </form>
      </div>

      {/* 3. TODAY'S MEAL LIST */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Today's Nourishment Log
        </h3>

        {todayMeals.length > 0 ? (
          <div className="space-y-3">
            {todayMeals.map((meal) => (
              <div
                key={meal.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">
                    {meal.mealType === 'breakfast'
                      ? '🍳'
                      : meal.mealType === 'lunch'
                      ? '🥗'
                      : meal.mealType === 'dinner'
                      ? '🍲'
                      : '🍎'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {meal.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {meal.mealType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Logged at {meal.time}</p>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {meal.categories.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 capitalize"
                        >
                          {c.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteMeal(meal.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                  title="Remove meal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            No meals logged yet today. Add your breakfast, lunch, or snack above!
          </p>
        )}
      </div>
    </div>
  );
};
