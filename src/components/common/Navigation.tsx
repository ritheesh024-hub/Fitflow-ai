import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import {
  Home,
  Dumbbell,
  Footprints,
  Droplets,
  Apple,
  Moon,
  CheckSquare,
  BarChart3,
  Bot,
  Trophy,
  User,
  Plus,
  Flame,
  Sparkles,
} from 'lucide-react';

interface NavItemConfig {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const DESKTOP_NAV_ITEMS: NavItemConfig[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'workout', label: 'Workouts', icon: Dumbbell },
  { id: 'activity', label: 'Activity', icon: Footprints },
  { id: 'hydration', label: 'Hydration', icon: Droplets },
  { id: 'nutrition', label: 'Nutrition', icon: Apple },
  { id: 'sleep', label: 'Sleep & Recovery', icon: Moon },
  { id: 'habits', label: 'Habits', icon: CheckSquare },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'aicoach', label: 'AI Coach', icon: Bot, badge: 'AI' },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'profile', label: 'Profile', icon: User },
];

export const DesktopSidebar: React.FC = () => {
  const { activeTab, setActiveTab, setQuickAddOpen, wellnessScore } = useApp();

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 px-4 py-5 justify-between select-none">
      {/* Brand & Navigation */}
      <div className="flex flex-col gap-6">
        {/* Logo */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-700 via-indigo-600 to-emerald-600 dark:from-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent tracking-tight">
                FitFlow AI
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Wellness Companion
              </span>
            </div>
          </div>
        </div>

        {/* Quick Add CTA */}
        <button
          onClick={() => setQuickAddOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Quick Log Activity</span>
        </button>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-290px)] pr-1">
          {DESKTOP_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Wellness Score Mini Card in Sidebar */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-800/60 dark:to-indigo-950/30 border border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Wellness Score
          </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            <Flame className="w-3 h-3 fill-emerald-500" />
            {wellnessScore.totalScore}/100
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${wellnessScore.totalScore}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
          {wellnessScore.statusText}
        </p>
      </div>
    </aside>
  );
};

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setQuickAddOpen } = useApp();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-2 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Progress */}
        <button
          onClick={() => setActiveTab('progress')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'progress'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px]">Progress</span>
        </button>

        {/* Quick Add Floating Center */}
        <button
          onClick={() => setQuickAddOpen(true)}
          className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-90 transition-transform cursor-pointer"
          title="Quick Track"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Workout */}
        <button
          onClick={() => setActiveTab('workout')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'workout'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-[10px]">Workout</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </div>
  );
};
