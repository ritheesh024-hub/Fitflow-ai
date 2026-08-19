import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Dumbbell,
  Droplets,
  Moon,
  Footprints,
  Clock,
  Calendar,
  Layers,
  Heart,
  Shield,
  Zap,
  Flame,
  CheckCircle2,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { PlanPreferences, UserPersonalPlan } from '../../types';
import { requestAIPersonalPlan } from '../../services/planService';

interface PlanOnboardingFlowProps {
  onComplete?: () => void;
  isStandaloneModal?: boolean;
  onClose?: () => void;
}

export const PlanOnboardingFlow: React.FC<PlanOnboardingFlowProps> = ({
  onComplete,
  isStandaloneModal = false,
  onClose,
}) => {
  const { user, updateUser, savePlan, triggerConfetti, showToast } = useApp();

  // Wizard Steps:
  // 1: Welcome & Profile basics
  // 2: Goals ("What would you like to improve?")
  // 3: Routine: Workout Days
  // 4: Routine: Preferred Time & Duration & Activity Level
  // 5: Experience Level & Equipment
  // 6: Daily Schedule & Recovery (Optional / Skippable)
  // 7: AI Generation Loading Screen
  // 8: Plan Review & Confirmation
  const [step, setStep] = useState(1);

  // Profile Basics
  const [name, setName] = useState(user.name || 'Alex');

  // Goals
  const GOAL_OPTIONS = [
    { id: 'Improve fitness', label: 'Improve fitness', icon: '🏋️', desc: 'Overall strength & conditioning' },
    { id: 'Get stronger', label: 'Get stronger', icon: '💪', desc: 'Build lean muscle & power' },
    { id: 'Become more active', label: 'Become more active', icon: '🚶', desc: 'Increase daily steps & movement' },
    { id: 'Improve flexibility/mobility', label: 'Improve flexibility/mobility', icon: '🧘', desc: 'Joint health & gentle stretching' },
    { id: 'Improve hydration', label: 'Improve hydration', icon: '💧', desc: 'Consistent 2.5L+ daily water' },
    { id: 'Improve sleep routine', label: 'Improve sleep routine', icon: '😴', desc: 'Restful 8h restorative sleep' },
    { id: 'Build better habits', label: 'Build better habits', icon: '📅', desc: 'Positive long-term consistency' },
    { id: 'Improve daily energy', label: 'Improve daily energy', icon: '⚡', desc: 'Sustained vitality & vitality' },
    { id: 'Improve endurance', label: 'Improve endurance', icon: '🏃', desc: 'Cardiovascular stamina' },
    { id: 'Stay consistent', label: 'Stay consistent', icon: '🎯', desc: 'Guilt-free sustainable momentum' },
  ];

  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'Improve fitness',
    'Stay consistent',
    'Improve hydration',
  ]);
  const [customGoal, setCustomGoal] = useState('');

  // Routine details
  const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const [availableDays, setAvailableDays] = useState<string[]>([
    'Monday',
    'Wednesday',
    'Friday',
  ]);

  const [preferredTime, setPreferredTime] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Flexible'>('Morning');
  const [workoutDuration, setWorkoutDuration] = useState<'15 min' | '30 min' | '45 min' | '60 min' | 'Flexible'>('30 min');
  const [activityLevel, setActivityLevel] = useState<'Mostly sedentary' | 'Lightly active' | 'Moderately active' | 'Very active'>('Moderately active');

  // Experience & Equipment
  const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [enjoyedActivities, setEnjoyedActivities] = useState('');
  
  const EQUIPMENT_OPTIONS = [
    { id: 'No equipment', label: 'No equipment (Bodyweight only)', icon: '🤸' },
    { id: 'Dumbbells', label: 'Dumbbells', icon: '🏋️' },
    { id: 'Resistance bands', label: 'Resistance bands', icon: '🎗️' },
    { id: 'Home equipment', label: 'Home gym setup', icon: '🏠' },
    { id: 'Full gym', label: 'Full commercial gym', icon: '🏢' },
  ];
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['No equipment']);

  // Schedule & Recovery (Optional)
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [sleepTarget, setSleepTarget] = useState('8 hours');
  const [workStudyHours, setWorkStudyHours] = useState('09:00 - 17:00');
  const [freeTime, setFreeTime] = useState('Evenings');

  // Generation & Generated Plan State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<UserPersonalPlan | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Toggle Helpers
  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    );
  };

  const toggleDay = (day: string) => {
    setAvailableDays((prev) => {
      if (prev.includes(day)) {
        if (prev.length <= 1) return prev; // Keep at least 1 day
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const toggleEquipment = (eqId: string) => {
    setSelectedEquipment((prev) => {
      if (prev.includes(eqId)) {
        if (prev.length <= 1) return prev;
        return prev.filter((e) => e !== eqId);
      } else {
        return [...prev, eqId];
      }
    });
  };

  // Trigger Plan Generation
  const handleGeneratePlan = async () => {
    setStep(7);
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationPhase(0);

    const phases = [
      'Analyzing your fitness goals & routine preferences...',
      'Structuring balanced strength and active recovery sessions...',
      'Tailoring hydration targets and daily micro-habits...',
      'Assembling your personalized 7-day routine...',
    ];

    let currentPhase = 0;
    const interval = setInterval(() => {
      currentPhase++;
      if (currentPhase < phases.length) {
        setGenerationPhase(currentPhase);
      }
    }, 700);

    try {
      const preferences: PlanPreferences = {
        goals: selectedGoals,
        customGoal: customGoal.trim() || undefined,
        availableDays,
        preferredWorkoutTime: preferredTime,
        workoutDuration,
        activityLevel,
        experienceLevel,
        enjoyedActivities: enjoyedActivities.trim() || undefined,
        equipment: selectedEquipment,
        scheduleDetails: {
          wakeUpTime,
          schoolWorkHours: workStudyHours,
          sleepTarget,
          freeTime,
        },
      };

      const plan = await requestAIPersonalPlan(preferences, {
        ...user,
        name: name.trim() || user.name || 'Friend',
      });

      clearInterval(interval);
      setGeneratedPlan(plan);
      setStep(8);
    } catch (err: any) {
      clearInterval(interval);
      console.error('Plan generation error:', err);
      setGenerationError(err.message || 'Unable to build plan at this time.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Final confirmation: Save plan to Firestore and update user profile
  const handleSaveAndConfirm = async () => {
    if (!generatedPlan) return;

    try {
      await updateUser({
        name: name.trim() || user.name || 'Friend',
        isOnboarded: true,
      });

      await savePlan(generatedPlan);
      triggerConfetti();
      onComplete?.();
      onClose?.();
    } catch (err) {
      console.error('Failed to save plan:', err);
      showToast('Error saving plan', 'Please try again', 'info');
    }
  };

  const totalSteps = 8;
  const progressPercent = Math.min(100, Math.round((step / totalSteps) * 100));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-3 sm:p-6 transition-colors">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl shadow-slate-900/5 dark:shadow-black/50 p-5 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[580px]">
        
        {/* Top Header & Step Indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase block">
                FitFlow AI Planner
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Step {step} of {totalSteps}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-6 bg-indigo-600'
                    : s < step
                    ? 'w-2 bg-emerald-500'
                    : 'w-2 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* STEP 1: Welcome & Profile basics */}
        {/* ---------------------------------------------------- */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300 my-auto">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-3xl shadow-xs">
                ✨
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Let's build your plan ✨
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium max-w-md mx-auto">
                Tell me what you want to improve, and I'll organize your daily routine.
              </p>
            </div>

            <div className="max-w-sm mx-auto space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your preferred name (e.g. Alex)"
                  className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 max-w-md mx-auto text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <Dumbbell className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Workouts</p>
                <p className="text-[10px] text-slate-400">Structured days</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <Droplets className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Hydration</p>
                <p className="text-[10px] text-slate-400">Daily targets</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Recovery</p>
                <p className="text-[10px] text-slate-400">Rest & Sleep</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <span>Let's Begin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 2: What would you like to improve? */}
        {/* ---------------------------------------------------- */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="text-left space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                What would you like to improve?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Select all that apply. I'll balance your schedule accordingly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {GOAL_OPTIONS.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{goal.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold truncate">{goal.label}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate">{goal.desc}</p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Something else? Custom Goal Input */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Something else?
              </label>
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="Describe any other personal goal in your own words..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-indigo-600"
              />
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedGoals.length === 0 && !customGoal.trim()}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <span>Continue to Routine</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 3: Tell me about your routine - Workout Days */}
        {/* ---------------------------------------------------- */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-left space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Tell me about your routine
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Which days are you available to work out? (Other days will be active recovery & rest)
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Available Workout Days ({availableDays.length} selected)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = availableDays.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-bold">{day}</span>
                      <span className="text-[10px] opacity-80">
                        {isSelected ? 'Workout' : 'Rest/Mobility'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                💡
              </div>
              <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
                FitFlow AI will schedule workouts exclusively on your selected days and assign gentle recovery habits on your off days.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 4: Preferred Time, Duration & Activity Level */}
        {/* ---------------------------------------------------- */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="text-left space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Workout Preferences
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Set your preferred session length, time of day, and current activity baseline.
              </p>
            </div>

            {/* Preferred Time */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Preferred Workout Time
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Morning', 'Afternoon', 'Evening', 'Flexible'] as const).map((time) => (
                  <button
                    key={time}
                    onClick={() => setPreferredTime(time)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      preferredTime === time
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-300'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {time === 'Morning' && '🌅 '}
                    {time === 'Afternoon' && '☀️ '}
                    {time === 'Evening' && '🌙 '}
                    {time === 'Flexible' && '✨ '}
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Workout Duration */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Workout Duration
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['15 min', '30 min', '45 min', '60 min', 'Flexible'] as const).map((dur) => (
                  <button
                    key={dur}
                    onClick={() => setWorkoutDuration(dur)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      workoutDuration === dur
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-300'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    ⏱️ {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Activity Level */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Current Activity Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'Mostly sedentary', label: 'Mostly sedentary', desc: 'Desk job, little daily walking' },
                  { id: 'Lightly active', label: 'Lightly active', desc: 'Occasional walks (3k-5k steps)' },
                  { id: 'Moderately active', label: 'Moderately active', desc: 'Regular movement (6k-8k steps)' },
                  { id: 'Very active', label: 'Very active', desc: 'On your feet often (10k+ steps)' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setActivityLevel(lvl.id as any)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      activityLevel === lvl.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-slate-900 dark:text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <p className="text-xs font-bold">{lvl.label}</p>
                    <p className="text-[10px] text-slate-400">{lvl.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setStep(3)}
                className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 5: Experience & Equipment */}
        {/* ---------------------------------------------------- */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="text-left space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Experience & Equipment
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Help me select the right exercise variations for your space.
              </p>
            </div>

            {/* Fitness Experience Level */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Fitness Experience Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Beginner', label: 'Beginner', desc: 'New or returning' },
                  { id: 'Intermediate', label: 'Intermediate', desc: 'Regular lifter' },
                  { id: 'Advanced', label: 'Advanced', desc: 'Experienced athlete' },
                ].map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => setExperienceLevel(exp.id as any)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      experienceLevel === exp.id
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <p className="text-xs font-bold">{exp.label}</p>
                    <p className="text-[10px] opacity-80">{exp.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Available Equipment */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Available Equipment
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EQUIPMENT_OPTIONS.map((eq) => {
                  const isSelected = selectedEquipment.includes(eq.id);
                  return (
                    <button
                      key={eq.id}
                      onClick={() => toggleEquipment(eq.id)}
                      className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-slate-900 dark:text-white'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{eq.icon}</span>
                        <span className="text-xs font-semibold">{eq.label}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* What do you currently enjoy doing? */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                What activities do you enjoy? (Optional)
              </label>
              <input
                type="text"
                value={enjoyedActivities}
                onChange={(e) => setEnjoyedActivities(e.target.value)}
                placeholder="e.g. Walking, yoga, bodyweight calisthenics, swimming..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-indigo-600"
              />
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setStep(4)}
                className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={() => setStep(6)}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 6: Daily Schedule & Recovery (Optional / Skippable) */}
        {/* ---------------------------------------------------- */}
        {step === 6 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="text-left space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Daily Schedule & Rest (Optional)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Provide your daily timing or skip to build your plan right away.
                </p>
              </div>
              <button
                onClick={handleGeneratePlan}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Skip ⏭️
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Typical Wake-up Time
                </label>
                <input
                  type="time"
                  value={wakeUpTime}
                  onChange={(e) => setWakeUpTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sleep Target
                </label>
                <select
                  value={sleepTarget}
                  onChange={(e) => setSleepTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-indigo-600"
                >
                  <option value="7 hours">7 hours</option>
                  <option value="7.5 hours">7.5 hours</option>
                  <option value="8 hours">8 hours (Recommended)</option>
                  <option value="8.5 hours">8.5 hours</option>
                  <option value="9 hours">9 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work / School Hours
                </label>
                <input
                  type="text"
                  value={workStudyHours}
                  onChange={(e) => setWorkStudyHours(e.target.value)}
                  placeholder="e.g. 9:00 AM - 5:00 PM"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Free Time
                </label>
                <select
                  value={freeTime}
                  onChange={(e) => setFreeTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-indigo-600"
                >
                  <option value="Early Mornings">Early Mornings</option>
                  <option value="Lunch Breaks">Lunch Breaks</option>
                  <option value="Afternoons">Afternoons</option>
                  <option value="Evenings">Evenings</option>
                  <option value="Weekends">Weekends</option>
                </select>
              </div>
            </div>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500" />
                No restrictive diets • Positive supportive habit building
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setStep(5)}
                className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={handleGeneratePlan}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create My AI Plan 🤖✨</span>
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 7: AI Plan Generation Screen (Animated) */}
        {/* ---------------------------------------------------- */}
        {step === 7 && (
          <div className="text-center space-y-6 py-8 animate-in fade-in duration-300 my-auto">
            {generationError ? (
              <div className="space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-2xl">
                  ⚠️
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Let's Try That Again
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {generationError}
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(5)}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Adjust Inputs
                  </button>
                  <button
                    onClick={handleGeneratePlan}
                    className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-md mx-auto">
                <div className="relative mx-auto w-20 h-20">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-500 flex items-center justify-center text-white text-3xl shadow-xl shadow-indigo-500/30 animate-pulse">
                    🤖
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs">
                    ✨
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Creating your personalized plan 🤖✨
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Structuring workouts, step targets, hydration, and sleep routines tailored specifically for you.
                  </p>
                </div>

                {/* Animated micro-steps */}
                <div className="space-y-2 text-left bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {[
                    'Analyzing your goals & available days...',
                    'Designing your workout structure & equipment fit...',
                    'Balancing hydration and restorative sleep targets...',
                    'Finalizing your weekly schedule...',
                  ].map((phaseText, idx) => {
                    const isPassed = generationPhase > idx;
                    const isCurrent = generationPhase === idx;
                    return (
                      <div key={idx} className="flex items-center gap-2.5 text-xs">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                            isPassed
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                              ? 'bg-indigo-600 text-white animate-spin'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          {isPassed ? '✓' : '•'}
                        </div>
                        <span
                          className={`font-medium ${
                            isCurrent
                              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                              : isPassed
                              ? 'text-slate-700 dark:text-slate-300'
                              : 'text-slate-400 dark:text-slate-600'
                          }`}
                        >
                          {phaseText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 8: Plan Review & Confirmation */}
        {/* ---------------------------------------------------- */}
        {step === 8 && generatedPlan && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="text-left space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <Sparkles className="w-3 h-3" />
                <span>Ready for Review</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {generatedPlan.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {generatedPlan.summary}
              </p>
            </div>

            {/* Weekly Schedule Cards (Monday - Sunday) */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {generatedPlan.days.map((day) => {
                const isWorkout = !!day.workout;
                return (
                  <div
                    key={day.dayOfWeek}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isWorkout
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200/80 dark:border-indigo-800/60'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold ${
                            isWorkout
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {day.dayName}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {day.focusTheme}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {isWorkout ? '🏋️ Workout Day' : '🌿 Rest & Recovery'}
                      </span>
                    </div>

                    {/* Day Highlights */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      {isWorkout && day.workout ? (
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase">Workout</p>
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {day.workout.title}
                          </p>
                          <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
                            {day.workout.durationMinutes}m • {day.workout.exercises?.length || 0} exercises
                          </p>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase">Recovery</p>
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            Rest & Repair
                          </p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                            Gentle recovery
                          </p>
                        </div>
                      )}

                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Movement</p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {day.activity.targetSteps.toLocaleString()} steps
                        </p>
                        <p className="text-[10px] text-slate-400">
                          ~{day.activity.distanceKm} km walk
                        </p>
                      </div>

                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Hydration</p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {(day.hydration.targetMl / 1000).toFixed(1)}L Target
                        </p>
                        <p className="text-[10px] text-cyan-600 dark:text-cyan-400">Daily water</p>
                      </div>

                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Daily Habit</p>
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {day.habit.name}
                        </p>
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 truncate">
                          {day.habit.icon} {day.habit.category}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
              <button
                onClick={() => setStep(2)}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Change Preferences</span>
              </button>

              <button
                onClick={handleSaveAndConfirm}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save My Plan & Open Dashboard 🚀</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
