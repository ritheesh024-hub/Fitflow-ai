import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Settings,
  Bell,
  Shield,
  RotateCcw,
  Sparkles,
  Download,
  Flame,
  CheckCircle2,
  LogOut,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, updateUser, showToast, setPlanModalOpen, setPlanCreateModalOpen } = useApp();
  const { logout } = useAuth();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [stepGoal, setStepGoal] = useState(user.dailyStepGoal || 8000);
  const [waterGoal, setWaterGoal] = useState(user.waterGoalMl || 2500);
  const [sleepGoal, setSleepGoal] = useState(user.sleepGoalHours || 8);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(user.weeklyWorkoutGoal || 4);
  const [notifications, setNotifications] = useState(user.notificationsEnabled ?? true);

  const AVATAR_OPTIONS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      dailyStepGoal: stepGoal,
      waterGoalMl: waterGoal,
      sleepGoalHours: sleepGoal,
      weeklyWorkoutGoal: weeklyWorkouts,
      notificationsEnabled: notifications,
    });
  };

  const handleExportData = () => {
    const backup = {
      user,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Data Exported 📥', 'Your profile and stats were saved locally.', 'success');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* 1. PROFILE HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/20"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] text-white">
            ✓
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {user.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            {user.email} • FitFlow Companion Member
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-2">
            {user.interests.map((interest, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CHOOSE AVATAR */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Choose Avatar</h3>
        <div className="flex items-center gap-3">
          {AVATAR_OPTIONS.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => updateUser({ avatar: url })}
              className={`p-1 rounded-full border-2 transition-all ${
                user.avatar === url
                  ? 'border-indigo-600 scale-105'
                  : 'border-transparent hover:border-slate-300'
              }`}
            >
              <img src={url} alt="Avatar option" className="w-12 h-12 rounded-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* 3. GOALS & PREFERENCES FORM */}
      <form
        onSubmit={handleSaveProfile}
        className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6"
      >
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Daily Targets & Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Daily Step Goal
            </label>
            <input
              type="number"
              step="500"
              min="3000"
              max="30000"
              value={stepGoal}
              onChange={(e) => setStepGoal(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Daily Water Goal (ml)
            </label>
            <input
              type="number"
              step="100"
              min="1000"
              max="5000"
              value={waterGoal}
              onChange={(e) => setWaterGoal(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Sleep Target (Hours)
            </label>
            <input
              type="number"
              step="0.5"
              min="5"
              max="12"
              value={sleepGoal}
              onChange={(e) => setSleepGoal(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Weekly Workouts Goal
            </label>
            <input
              type="number"
              min="1"
              max="7"
              value={weeklyWorkouts}
              onChange={(e) => setWeeklyWorkouts(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Notifications and Preferences */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Daily Motivation Tips
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive supportive daily habit reminders
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotifications(!notifications)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                notifications ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  notifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-500/20 active:scale-98 transition-all"
        >
          Save Changes
        </button>
      </form>

      {/* 4. AI PERSONALIZED PLAN MANAGEMENT */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-emerald-50/60 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                AI Personalized Plan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.activePlanId ? 'Your 7-day adaptive routine is active' : 'Build a custom weekly plan'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => setPlanModalOpen(true)}
            className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>View Current Plan</span>
          </button>
          <button
            type="button"
            onClick={() => setPlanCreateModalOpen(true)}
            className="flex-1 py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-build Plan</span>
          </button>
        </div>
      </div>

      {/* 5. DATA MANAGEMENT & ACCOUNT */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Account & Data</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportData}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON Backup</span>
          </button>
          <button
            onClick={async () => {
              await logout();
            }}
            className="py-2.5 px-4 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
