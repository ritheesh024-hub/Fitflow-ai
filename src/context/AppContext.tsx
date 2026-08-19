import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  NavigationTab,
  WorkoutSession,
  WorkoutTemplate,
  PersonalRecord,
  ActivityDay,
  ActivityType,
  DistanceUnit,
  HydrationDay,
  HydrationNotificationSettings,
  MealItem,
  SleepRecord,
  Habit,
  HabitFrequency,
  Achievement,
  AICoachMessage,
  AIDailyInsight,
  WellnessScoreBreakdown,
  DailySummary,
  UserPersonalPlan,
  PlanPreferences,
  DayOfWeekKey,
  PlanWorkoutDetail,
  DailyCheckin,
  WeeklyReview,
  AIDailySummaryData,
  MoodFeeling,
  EnergyLevel,
  AINutritionInsightData,
} from '../types';
import { useAuth } from './AuthContext';
import { getTodayDateStr } from '../utils/dateUtils';
import {
  subscribeToUserActivePlan,
  subscribeToUserPlans,
  saveUserPlan,
  togglePlanTaskInFirestore,
  requestAIPlanAdaptation,
  updatePlanStatus,
  requestAIPersonalPlan,
} from '../services/planService';
import {
  saveDailyCheckin,
  subscribeToDailyCheckin,
  saveWeeklyReview,
  subscribeToWeeklyReviews,
  generateDailyInsight,
  generateDailySummary,
  generateWeeklyReview,
  generateNutritionInsight,
} from '../services/aiCoachService';
import {
  subscribeToTodayHydration,
  subscribeToHydrationHistory,
  addHydrationEntry,
  updateHydrationEntry,
  deleteHydrationEntry,
  setHydrationTarget,
  subscribeToHydrationNotificationSettings,
  saveHydrationNotificationSettings,
  DEFAULT_HYDRATION_SETTINGS,
} from '../services/hydrationService';
import {
  subscribeToUserWorkouts,
  saveUserWorkout,
  deleteUserWorkout,
  subscribeToWorkoutTemplates,
  saveWorkoutTemplate,
  deleteWorkoutTemplate,
  saveActiveWorkoutLocally,
  loadActiveWorkoutLocally,
  clearActiveWorkoutLocally,
  calculatePersonalRecords,
  checkForNewPRs,
} from '../services/workoutService';
import {
  subscribeToTodayActivity,
  subscribeToActivityHistory,
  logActivityEntry,
} from '../services/activityService';
import {
  subscribeToMeals,
  saveMeal,
  updateUserMeal,
  deleteUserMeal,
} from '../services/mealService';
import {
  subscribeToTodaySleep,
  saveSleepRecord,
} from '../services/sleepService';
import {
  subscribeToUserHabits,
  createNewHabit,
  toggleHabitCompletion,
  deleteUserHabit,
  updateUserHabit,
} from '../services/habitService';
import {
  calculateTransparentWellnessScore,
  buildUnifiedDailyRecord,
} from '../services/dailySummaryService';
import { sendAICoachMessage, fetchDailyInsights } from '../services/ai';
import { DEFAULT_PRESET_TEMPLATES } from '../data/defaultTemplates';

interface CelebrationData {
  isOpen: boolean;
  type: 'workout' | 'achievement' | 'milestone';
  title: string;
  subtitle: string;
  badgeIcon?: string;
}

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'celebrate';
}

interface AppContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isLoadingData: boolean;

  // Quick Add Modal
  isQuickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  quickAddInitialType: string | null;
  openQuickAddWithType: (type: string) => void;

  // Workouts
  workouts: WorkoutSession[];
  templates: WorkoutTemplate[];
  personalRecords: PersonalRecord[];
  workoutStreak: number;
  activeWorkout: WorkoutSession | null;
  startNewWorkout: (templateCategory?: WorkoutSession['category'], customTitle?: string) => void;
  startWorkoutFromTemplate: (template: WorkoutTemplate) => void;
  startWorkoutSession: (session: WorkoutSession) => void;
  updateActiveWorkout: (workout: WorkoutSession) => void;
  finishActiveWorkout: (notes?: string, saveAsTemplateName?: string) => Promise<void>;
  cancelActiveWorkout: () => void;
  logWorkoutDirectly: (workout: Omit<WorkoutSession, 'id'>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  saveTemplate: (template: Omit<WorkoutTemplate, 'id'> & { id?: string }) => Promise<string>;
  deleteTemplate: (id: string) => Promise<void>;

  // Activity
  activities: ActivityDay[];
  todayActivity: ActivityDay;
  logActivity: (entry: {
    steps: number;
    distance?: number;
    distanceUnit?: DistanceUnit;
    activeMinutes?: number;
    activityType: ActivityType;
    date?: string;
    timestamp?: string;
  }) => Promise<void>;
  addSteps: (
    steps: number,
    durationMinutes?: number,
    type?: 'walk' | 'run' | 'cycling' | 'general'
  ) => Promise<void>;

  // Hydration
  hydrations: HydrationDay[];
  todayHydration: HydrationDay;
  addWater: (amountMl: number, targetDate?: string) => Promise<void>;
  editWaterEntry: (entryId: string, newAmountMl: number, targetDate?: string) => Promise<void>;
  deleteWaterEntry: (entryId: string, targetDate?: string) => Promise<void>;
  setWaterGoal: (goalMl: number, targetDate?: string) => Promise<void>;
  hydrationSettings: HydrationNotificationSettings;
  updateHydrationSettings: (settings: Partial<HydrationNotificationSettings>) => Promise<void>;

  // Meals / Nutrition
  meals: MealItem[];
  todayMeals: MealItem[];
  addMeal: (meal: Omit<MealItem, 'id' | 'date'> & { id?: string; date?: string }) => Promise<void>;
  updateMeal: (id: string, updates: Partial<MealItem>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  nutritionInsight: AINutritionInsightData | null;
  isLoadingNutritionInsight: boolean;
  fetchNutritionInsight: (forceRefresh?: boolean) => Promise<AINutritionInsightData>;

  // Sleep & Recovery
  sleeps: SleepRecord[];
  todaySleep: SleepRecord | undefined;
  logSleep: (sleep: Omit<SleepRecord, 'id' | 'date'>) => Promise<void>;

  // Habits
  habits: Habit[];
  toggleHabit: (habitId: string, date?: string) => Promise<void>;
  createHabit: (habitData: {
    name: string;
    icon: string;
    description?: string;
    category?: Habit['category'];
    frequency?: HabitFrequency;
    reminderEnabled?: boolean;
    reminderTime?: string;
  }) => Promise<string>;
  deleteHabit: (habitId: string) => Promise<void>;
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>;

  // AI Personalized Plans
  activePlan: UserPersonalPlan | null;
  allPlans: UserPersonalPlan[];
  isPlanModalOpen: boolean;
  setPlanModalOpen: (open: boolean) => void;
  isPlanAdaptModalOpen: boolean;
  setPlanAdaptModalOpen: (open: boolean) => void;
  isPlanCreateModalOpen: boolean;
  setPlanCreateModalOpen: (open: boolean) => void;
  isPlanHistoryOpen: boolean;
  setIsPlanHistoryOpen: (open: boolean) => void;
  isRegenerateModalOpen: boolean;
  setIsRegenerateModalOpen: (open: boolean) => void;
  savePlan: (plan: UserPersonalPlan) => Promise<void>;
  togglePlanTask: (dayOfWeek: DayOfWeekKey, taskId: string) => Promise<void>;
  startWorkoutFromPlan: (workout: PlanWorkoutDetail) => void;
  adaptCurrentPlan: (missedDay: string, missedType: string, userNote?: string) => Promise<{ adjustmentMessage: string; tip: string }>;
  setPlanStatus: (planId: string, status: 'active' | 'paused' | 'completed') => Promise<void>;
  regenerateMyWeek: (customGoal?: string) => Promise<void>;

  // Daily Unified Summary Record
  getDailyRecordForDate: (date: string) => DailySummary;

  // Achievements
  achievements: Achievement[];
  unlockAchievement: (badgeKey: string) => void;

  // AI Coach & Daily Intelligence
  aiMessages: AICoachMessage[];
  isAIThinking: boolean;
  sendChatMessage: (text: string) => Promise<void>;
  dailyInsight: AIDailyInsight;
  refreshDailyInsights: () => Promise<void>;
  dailySummary: AIDailySummaryData | null;
  isLoadingDailySummary: boolean;
  isDailySummaryOpen: boolean;
  setIsDailySummaryOpen: (open: boolean) => void;
  fetchDailySummary: (forceRefresh?: boolean) => Promise<AIDailySummaryData>;

  // Daily Checkin
  todayCheckin: DailyCheckin | null;
  logDailyCheckin: (mood: MoodFeeling, energy?: EnergyLevel, note?: string) => Promise<void>;

  // Weekly Review
  weeklyReviews: WeeklyReview[];
  currentWeeklyReview: WeeklyReview | null;
  isLoadingWeeklyReview: boolean;
  isWeeklyReviewOpen: boolean;
  setIsWeeklyReviewOpen: (open: boolean) => void;
  fetchWeeklyReview: (forceRefresh?: boolean) => Promise<WeeklyReview>;

  // Wellness Score
  wellnessScore: WellnessScoreBreakdown;

  // Celebration & Toasts
  celebration: CelebrationData;
  closeCelebration: () => void;
  triggerConfetti: () => void;
  toasts: ToastMessage[];
  showToast: (title: string, description?: string, type?: 'success' | 'info' | 'celebrate') => void;
  removeToast: (id: string) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  id: '',
  name: 'Fitness Explorer',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  memberSince: 'August 2026',
  interests: ['Daily Movement', 'Strength Training', 'Recovery & Sleep', 'Mindful Eating'],
  waterGoalMl: 2500,
  dailyStepGoal: 8000,
  sleepGoalHours: 8,
  weeklyWorkoutGoal: 4,
  theme: 'light',
  notificationsEnabled: true,
  isOnboarded: true,
};

const INITIAL_INSIGHT: AIDailyInsight = {
  date: getTodayDateStr(),
  observations: [
    'Consistency over intensity: Daily habits lay the groundwork for long-term health.',
    'Hydration helps maintain cognitive focus and steady energy through the day.',
  ],
  suggestion: 'Aim for a brief post-meal walk or gentle mobility stretches before bed tonight.',
  encouragement: 'Every small positive choice builds momentum. Keep up the great flow! ✨',
};

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    badgeKey: 'first_workout',
    title: 'First Flow',
    description: 'Completed your first logged workout session with FitFlow AI.',
    icon: '🏋️',
    category: 'workout',
    unlocked: false,
    progress: 0,
    requirement: 'Complete 1 workout',
  },
  {
    id: 'ach-2',
    badgeKey: 'water_master',
    title: 'Hydration Hero',
    description: 'Met or exceeded your personalized daily water intake goal.',
    icon: '💧',
    category: 'hydration',
    unlocked: false,
    progress: 0,
    requirement: 'Reach 100% daily water goal',
  },
  {
    id: 'ach-3',
    badgeKey: 'step_star',
    title: 'Step Champion',
    description: 'Achieved your daily active movement target of 8,000+ steps.',
    icon: '🚶',
    category: 'activity',
    unlocked: false,
    progress: 0,
    requirement: 'Reach 8,000 steps in a day',
  },
  {
    id: 'ach-4',
    badgeKey: 'streak_3',
    title: 'Flow Momentum',
    description: 'Maintained a 3-day active wellness consistency streak.',
    icon: '🔥',
    category: 'consistency',
    unlocked: false,
    progress: 33,
    requirement: '3-day activity streak',
  },
  {
    id: 'ach-5',
    badgeKey: 'sleep_rest',
    title: 'Recovery Master',
    description: 'Logged a restorative sleep session with 7.5+ hours of rest.',
    icon: '😴',
    category: 'recovery',
    unlocked: false,
    progress: 0,
    requirement: 'Log 7.5+ hours of sleep',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authUser, userProfile: authProfile, updateProfile: updateAuthProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Quick Add State
  const [isQuickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddInitialType, setQuickAddInitialType] = useState<string | null>(null);

  // Firestore Real-Time Subscriptions States
  const [rawHydration, setRawHydration] = useState<HydrationDay | null>(null);
  const [hydrationHistory, setHydrationHistory] = useState<HydrationDay[]>([]);
  const [hydrationSettings, setHydrationSettings] = useState<HydrationNotificationSettings>(DEFAULT_HYDRATION_SETTINGS);

  const [rawActivity, setRawActivity] = useState<ActivityDay | null>(null);
  const [activityHistory, setActivityHistory] = useState<ActivityDay[]>([]);

  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(DEFAULT_PRESET_TEMPLATES);
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [rawSleep, setRawSleep] = useState<SleepRecord | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  // Active workout state (initialized from local storage if existing)
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(() => {
    return loadActiveWorkoutLocally();
  });

  // AI Personalized Plan State
  const [activePlan, setActivePlan] = useState<UserPersonalPlan | null>(null);
  const [allPlans, setAllPlans] = useState<UserPersonalPlan[]>([]);
  const [isPlanModalOpen, setPlanModalOpen] = useState(false);
  const [isPlanAdaptModalOpen, setPlanAdaptModalOpen] = useState(false);
  const [isPlanCreateModalOpen, setPlanCreateModalOpen] = useState(false);
  const [isPlanHistoryOpen, setIsPlanHistoryOpen] = useState(false);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);

  // Daily Checkin State
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null);

  // Daily Intelligence Summary State
  const [dailySummary, setDailySummary] = useState<AIDailySummaryData | null>(null);
  const [isLoadingDailySummary, setIsLoadingDailySummary] = useState(false);
  const [isDailySummaryOpen, setIsDailySummaryOpen] = useState(false);

  // Weekly Review State
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>([]);
  const [currentWeeklyReview, setCurrentWeeklyReview] = useState<WeeklyReview | null>(null);
  const [isLoadingWeeklyReview, setIsLoadingWeeklyReview] = useState(false);
  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = useState(false);

  // AI State
  const [aiMessages, setAiMessages] = useState<AICoachMessage[]>([
    {
      id: 'welcome-1',
      sender: 'coach',
      text: "Hello! I'm your FitFlow AI Wellness Companion. How can I support your fitness, hydration, recovery, or habits today? 🌿",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [dailyInsight, setDailyInsight] = useState<AIDailyInsight>(INITIAL_INSIGHT);
  const [nutritionInsight, setNutritionInsight] = useState<AINutritionInsightData | null>(null);
  const [isLoadingNutritionInsight, setIsLoadingNutritionInsight] = useState(false);

  // UI Toast & Celebration
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [celebration, setCelebration] = useState<CelebrationData>({
    isOpen: false,
    type: 'workout',
    title: '',
    subtitle: '',
  });

  const todayStr = getTodayDateStr();

  // Combine auth profile with default profile
  const user: UserProfile = useMemo(() => {
    if (!authProfile) return DEFAULT_PROFILE;
    return {
      ...DEFAULT_PROFILE,
      id: authProfile.userId || authUser?.uid || '',
      name: authProfile.displayName || authUser?.displayName || 'Fitness Explorer',
      email: authProfile.email || authUser?.email || '',
      waterGoalMl: authProfile.waterGoalMl || 2500,
      dailyStepGoal: authProfile.dailyStepGoal || 8000,
      sleepGoalHours: authProfile.sleepGoalHours || 8,
      weeklyWorkoutGoal: authProfile.weeklyWorkoutGoal || 4,
      theme: 'light',
      notificationsEnabled: authProfile.notificationsEnabled ?? true,
      isOnboarded: true,
    };
  }, [authProfile, authUser]);

  // Connect Real-Time Firestore Listeners when authenticated
  useEffect(() => {
    if (!authUser) {
      setIsLoadingData(false);
      return;
    }

    const uid = authUser.uid;
    setIsLoadingData(true);

    const unsubHydration = subscribeToTodayHydration(uid, todayStr, (data) => {
      setRawHydration(data);
    });

    const unsubHydrationHist = subscribeToHydrationHistory(uid, 30, (data) => {
      setHydrationHistory(data);
    });

    const unsubHydrationSettings = subscribeToHydrationNotificationSettings(uid, (settings) => {
      setHydrationSettings(settings);
    });

    const unsubActivity = subscribeToTodayActivity(uid, todayStr, (data) => {
      setRawActivity(data);
    });

    const unsubActivityHist = subscribeToActivityHistory(uid, 90, (data) => {
      setActivityHistory(data);
    });

    const unsubWorkouts = subscribeToUserWorkouts(uid, (data) => {
      setWorkouts(data);
      if (data.length > 0) {
        setAchievements((prev) =>
          prev.map((a) =>
            a.badgeKey === 'first_workout' ? { ...a, unlocked: true, progress: 100 } : a
          )
        );
      }
    });

    const unsubTemplates = subscribeToWorkoutTemplates(uid, (data) => {
      setTemplates(data);
    });

    const unsubMeals = subscribeToMeals(uid, (data) => {
      setMeals(data);
    });

    const unsubSleep = subscribeToTodaySleep(uid, todayStr, (data) => {
      setRawSleep(data);
    });

    const unsubHabits = subscribeToUserHabits(uid, (data) => {
      if (data.length === 0) {
        // Create initial preset habits
        createNewHabit(uid, { name: 'Hydrate 2.5L Water', icon: '💧', category: 'hydration', frequency: 'daily' });
        createNewHabit(uid, { name: 'Daily Movement 8k Steps', icon: '🚶', category: 'movement', frequency: 'daily' });
        createNewHabit(uid, { name: 'Night Wind-Down & Sleep', icon: '😴', category: 'sleep', frequency: 'daily' });
      } else {
        setHabits(data);
      }
      setIsLoadingData(false);
    });

    const unsubActivePlan = subscribeToUserActivePlan(uid, (plan) => {
      setActivePlan(plan);
    });

    const unsubAllPlans = subscribeToUserPlans(uid, (plansList) => {
      setAllPlans(plansList);
      if (plansList.length > 0) {
        setActivePlan((current) => {
          if (current) {
            const fresh = plansList.find((p) => p.id === current.id);
            if (fresh) return fresh;
          }
          const active = plansList.find((p) => p.status === 'active') || plansList[0];
          return active;
        });
      }
    });

    const unsubCheckin = subscribeToDailyCheckin(uid, todayStr, (checkin) => {
      setTodayCheckin(checkin);
    });

    const unsubReviews = subscribeToWeeklyReviews(uid, (reviews) => {
      setWeeklyReviews(reviews);
      if (reviews.length > 0) {
        setCurrentWeeklyReview(reviews[0]);
      }
    });

    return () => {
      unsubHydration();
      unsubHydrationHist();
      unsubHydrationSettings();
      unsubActivity();
      unsubActivityHist();
      unsubWorkouts();
      unsubTemplates();
      unsubMeals();
      unsubSleep();
      unsubHabits();
      unsubActivePlan();
      unsubAllPlans();
      unsubCheckin();
      unsubReviews();
    };
  }, [authUser, todayStr]);

  // Toast Helper
  const showToast = (
    title: string,
    description?: string,
    type: 'success' | 'info' | 'celebrate' = 'success'
  ) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
    });
  };

  const closeCelebration = () => {
    setCelebration((prev) => ({ ...prev, isOpen: false }));
  };

  const openQuickAddWithType = (type: string) => {
    setQuickAddInitialType(type);
    setQuickAddOpen(true);
  };

  // Activity: Today's object + history
  const todayActivity: ActivityDay = useMemo(() => {
    if (rawActivity) return rawActivity;
    return {
      id: todayStr,
      date: todayStr,
      steps: 0,
      distanceKm: 0,
      activeMinutes: 0,
      approxCalories: 0,
      logs: [],
    };
  }, [rawActivity, todayStr]);

  const activities: ActivityDay[] = useMemo(() => {
    if (activityHistory.length > 0) return activityHistory;
    return rawActivity ? [rawActivity] : [];
  }, [activityHistory, rawActivity]);

  const logActivity = async (entry: {
    steps: number;
    distance?: number;
    distanceUnit?: DistanceUnit;
    activeMinutes?: number;
    activityType: ActivityType;
    date?: string;
    timestamp?: string;
  }) => {
    if (!authUser) return;
    const targetDate = entry.date || todayStr;
    const currentForDate = activities.find((a) => a.date === targetDate) || null;

    try {
      await logActivityEntry(authUser.uid, { ...entry, date: targetDate }, currentForDate);
      const newSteps = (currentForDate?.steps || 0) + Number(entry.steps || 0);

      showToast('🚶 Activity saved.', `+${Number(entry.steps).toLocaleString()} steps recorded.`, 'success');

      if (newSteps >= user.dailyStepGoal) {
        unlockAchievement('step_star');
        showToast('Daily Step Target Met! 🚶‍♂️', `${newSteps.toLocaleString()} steps achieved!`, 'celebrate');
      }
    } catch (err) {
      console.error(err);
      showToast("Couldn't save activity. Please try again.", undefined, 'info');
    }
  };

  const addSteps = async (
    steps: number,
    durationMinutes: number = 15,
    type: 'walk' | 'run' | 'cycling' | 'general' = 'walk'
  ) => {
    const mappedType: ActivityType =
      type === 'run' ? 'running' : type === 'cycling' ? 'cycling' : 'walking';

    await logActivity({
      steps,
      activeMinutes: durationMinutes,
      activityType: mappedType,
      date: todayStr,
      distanceUnit: 'km',
    });
  };

  // Hydration: Today's object + history
  const todayHydration: HydrationDay = useMemo(() => {
    if (rawHydration) return rawHydration;
    return {
      id: todayStr,
      date: todayStr,
      waterMl: 0,
      goalMl: user.waterGoalMl || 2500,
      entries: [],
    };
  }, [rawHydration, todayStr, user.waterGoalMl]);

  const hydrations: HydrationDay[] = useMemo(() => {
    if (hydrationHistory.length > 0) return hydrationHistory;
    return rawHydration ? [rawHydration] : [];
  }, [hydrationHistory, rawHydration]);

  const addWater = async (amountMl: number, targetDate: string = todayStr) => {
    if (!authUser) return;
    const currentForDate = hydrations.find((h) => h.date === targetDate) || (targetDate === todayStr ? todayHydration : null);

    try {
      await addHydrationEntry(authUser.uid, targetDate, amountMl, currentForDate, user.waterGoalMl);
      const currentWater = currentForDate?.waterMl || 0;
      const newTotal = currentWater + amountMl;
      const targetGoal = currentForDate?.goalMl || user.waterGoalMl || 2500;

      showToast(`💧 +${amountMl} ml`, `Total: ${(newTotal / 1000).toFixed(1)}L today`, 'success');

      if (newTotal >= targetGoal && currentWater < targetGoal) {
        unlockAchievement('water_master');
        showToast('💧 Hydration goal reached!', `You've achieved ${(newTotal / 1000).toFixed(1)}L!`, 'celebrate');
      }
    } catch (err) {
      console.error(err);
      showToast("Couldn't save hydration right now.", undefined, 'info');
    }
  };

  const editWaterEntry = async (entryId: string, newAmountMl: number, targetDate: string = todayStr) => {
    if (!authUser) return;
    const currentForDate = hydrations.find((h) => h.date === targetDate) || todayHydration;

    try {
      await updateHydrationEntry(authUser.uid, targetDate, entryId, newAmountMl, currentForDate);
      showToast('Hydration Updated 💧', `Entry adjusted to ${newAmountMl} ml.`, 'success');
    } catch (err) {
      console.error(err);
      showToast("Couldn't update entry. Please try again.", undefined, 'info');
    }
  };

  const deleteWaterEntry = async (entryId: string, targetDate: string = todayStr) => {
    if (!authUser) return;
    const currentForDate = hydrations.find((h) => h.date === targetDate) || todayHydration;

    try {
      await deleteHydrationEntry(authUser.uid, targetDate, entryId, currentForDate);
      showToast('Entry Removed', 'Hydration record deleted.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const setWaterGoal = async (goalMl: number, targetDate: string = todayStr) => {
    if (!authUser) return;
    try {
      await setHydrationTarget(authUser.uid, targetDate, goalMl);
      await updateAuthProfile({ waterGoalMl: goalMl });
      showToast('Goal Configured', `Daily hydration tracking target set to ${(goalMl / 1000).toFixed(1)}L.`, 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const updateHydrationSettings = async (settings: Partial<HydrationNotificationSettings>) => {
    if (!authUser) return;
    try {
      await saveHydrationNotificationSettings(authUser.uid, settings);
      showToast('Reminder Preferences Saved', undefined, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  // Habits
  const toggleHabit = async (habitId: string, targetDate: string = todayStr) => {
    if (!authUser) return;
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    try {
      const isNowCompleted = await toggleHabitCompletion(authUser.uid, habit, targetDate);
      if (isNowCompleted) {
        showToast(`✓ Nice! Habit completed.`, `${habit.name} check-in recorded.`, 'success');
      } else {
        showToast('Habit unchecked', `${habit.name} set to incomplete.`, 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createHabit = async (habitData: {
    name: string;
    icon: string;
    description?: string;
    category?: Habit['category'];
    frequency?: HabitFrequency;
    reminderEnabled?: boolean;
    reminderTime?: string;
  }): Promise<string> => {
    if (!authUser) throw new Error('User not logged in');
    try {
      const id = await createNewHabit(authUser.uid, habitData);
      showToast('New Habit Created! ✨', `"${habitData.name}" added to your daily flow.`, 'success');
      return id;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Couldn't create habit.", undefined, 'info');
      throw err;
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!authUser) return;
    try {
      await deleteUserHabit(authUser.uid, habitId);
      showToast('Habit Deleted', 'Habit removed from tracking.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    if (!authUser) return;
    try {
      await updateUserHabit(authUser.uid, habitId, updates);
      showToast('Habit Updated', undefined, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  // Meals
  const todayMeals = useMemo(() => {
    return meals.filter((m) => m.date === todayStr);
  }, [meals, todayStr]);

  const addMeal = async (mealData: Omit<MealItem, 'id' | 'date'> & { id?: string; date?: string }) => {
    if (!authUser) return;
    try {
      const targetDate = mealData.date || todayStr;
      await saveMeal(authUser.uid, {
        ...mealData,
        date: targetDate,
      });
      showToast('Meal Logged 🥗', `${mealData.name} saved.`, 'success');
    } catch (err) {
      console.error(err);
      showToast("Couldn't save that right now. Please try again.", undefined, 'info');
    }
  };

  const updateMeal = async (id: string, updates: Partial<MealItem>) => {
    if (!authUser) return;
    try {
      await updateUserMeal(authUser.uid, id, updates);
      showToast('Meal Updated 🥗', `${updates.name || 'Meal'} updated successfully.`, 'success');
    } catch (err) {
      console.error(err);
      showToast("Couldn't update meal right now.", undefined, 'info');
    }
  };

  const deleteMeal = async (id: string) => {
    if (!authUser) return;
    try {
      await deleteUserMeal(authUser.uid, id);
      showToast('Meal removed', undefined, 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNutritionInsight = async (forceRefresh = false): Promise<AINutritionInsightData> => {
    setIsLoadingNutritionInsight(true);
    try {
      const categoriesFrequency: Record<string, number> = {};
      meals.forEach((m) => {
        if (Array.isArray(m.categories)) {
          m.categories.forEach((cat) => {
            categoriesFrequency[cat] = (categoriesFrequency[cat] || 0) + 1;
          });
        }
      });

      const breakfastCount = meals.filter((m) => m.mealType === 'breakfast').length;
      const lunchCount = meals.filter((m) => m.mealType === 'lunch').length;
      const dinnerCount = meals.filter((m) => m.mealType === 'dinner').length;
      const snackCount = meals.filter((m) => m.mealType === 'snack').length;
      const loggedDays = new Set(meals.map((m) => m.date)).size;

      const res = await generateNutritionInsight(
        {
          profile: user,
          todayDate: todayStr,
          todayMeals,
          weeklyMeals: meals.slice(0, 30),
          categoriesFrequency,
          mealConsistency: {
            loggedDays,
            totalDays: 7,
            breakfastCount,
            lunchCount,
            dinnerCount,
            snackCount,
          },
        },
        forceRefresh
      );
      setNutritionInsight(res);
      return res;
    } finally {
      setIsLoadingNutritionInsight(false);
    }
  };

  // Sleep
  const todaySleep = useMemo(() => {
    return rawSleep || undefined;
  }, [rawSleep]);

  const sleeps: SleepRecord[] = useMemo(() => {
    return rawSleep ? [rawSleep] : [];
  }, [rawSleep]);

  const logSleep = async (sleepData: Omit<SleepRecord, 'id' | 'date'>) => {
    if (!authUser) return;
    try {
      await saveSleepRecord(authUser.uid, todayStr, sleepData);
      showToast('Sleep Logged 😴', `${(sleepData.durationMinutes / 60).toFixed(1)}h sleep recorded.`, 'success');
    } catch (err) {
      console.error(err);
      showToast("Couldn't save that right now. Please try again.", undefined, 'info');
    }
  };

  // Workout state & actions
  const personalRecords: PersonalRecord[] = useMemo(() => {
    return calculatePersonalRecords(workouts);
  }, [workouts]);

  const workoutStreak: number = useMemo(() => {
    const completed = workouts.filter((w) => w.completed);
    if (completed.length === 0) return 0;
    const dates = Array.from(new Set(completed.map((w) => w.date))).sort();
    return dates.length;
  }, [workouts]);

  const startNewWorkout = (
    templateCategory: WorkoutSession['category'] = 'Full Body',
    customTitle?: string
  ) => {
    const template = templates.find((t) => t.category === templateCategory);
    const newSession: WorkoutSession = {
      id: 'ws-' + Date.now(),
      title: customTitle || template?.title || `${templateCategory} Routine`,
      category: templateCategory,
      date: todayStr,
      durationMinutes: 0,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      exercises: template
        ? template.exercises.map((ex, idx) => ({
            id: `ex-${idx}-${Date.now()}`,
            name: ex.name,
            category: ex.category,
            muscleGroup: ex.muscleGroup,
            equipment: ex.equipment,
            sets: Array.from({ length: ex.defaultSets }).map((_, sIdx) => ({
              setNumber: sIdx + 1,
              reps: ex.defaultReps,
              weightKg: ex.defaultWeightKg || 20,
              completed: false,
            })),
          }))
        : [
            {
              id: 'ex-default-1',
              name: 'Push-Ups',
              category: 'bodyweight',
              muscleGroup: 'Chest',
              equipment: 'Bodyweight',
              sets: [
                { setNumber: 1, reps: 10, completed: false },
                { setNumber: 2, reps: 10, completed: false },
                { setNumber: 3, reps: 10, completed: false },
              ],
            },
          ],
      completed: false,
    };

    setActiveWorkout(newSession);
    saveActiveWorkoutLocally(newSession);
    setActiveTab('workout');
    showToast('Workout Started 🏋️', `${newSession.title} is now active!`, 'info');
  };

  const startWorkoutFromTemplate = (template: WorkoutTemplate) => {
    const newSession: WorkoutSession = {
      id: 'ws-' + Date.now(),
      title: template.title,
      category: template.category,
      date: todayStr,
      durationMinutes: 0,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      exercises: template.exercises.map((ex, idx) => ({
        id: `ex-${idx}-${Date.now()}`,
        name: ex.name,
        category: ex.category,
        muscleGroup: ex.muscleGroup,
        equipment: ex.equipment,
        sets: Array.from({ length: ex.defaultSets }).map((_, sIdx) => ({
          setNumber: sIdx + 1,
          reps: ex.defaultReps,
          weightKg: ex.defaultWeightKg || 20,
          completed: false,
        })),
      })),
      completed: false,
    };

    setActiveWorkout(newSession);
    saveActiveWorkoutLocally(newSession);
    setActiveTab('workout');
    showToast('Routine Loaded 🏋️', `${template.title} started!`, 'info');
  };

  const startWorkoutSession = (session: WorkoutSession) => {
    setActiveWorkout(session);
    saveActiveWorkoutLocally(session);
    setActiveTab('workout');
  };

  const updateActiveWorkout = (workout: WorkoutSession) => {
    setActiveWorkout(workout);
    saveActiveWorkoutLocally(workout);
  };

  const finishActiveWorkout = async (notes?: string, saveAsTemplateName?: string) => {
    if (!activeWorkout || !authUser) return;

    const completedSession: WorkoutSession = {
      ...activeWorkout,
      completed: true,
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: notes || activeWorkout.notes,
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveUserWorkout(authUser.uid, completedSession);
      clearActiveWorkoutLocally();
      setActiveWorkout(null);

      // Check for new PRs
      const newPRs = checkForNewPRs(completedSession, workouts);

      if (saveAsTemplateName && saveAsTemplateName.trim()) {
        await saveTemplate({
          title: saveAsTemplateName.trim(),
          category: completedSession.category,
          exercises: completedSession.exercises.map((ex) => ({
            name: ex.name,
            category: ex.category,
            muscleGroup: ex.muscleGroup,
            equipment: ex.equipment,
            defaultSets: ex.sets.length,
            defaultReps: ex.sets[0]?.reps || 10,
            defaultWeightKg: ex.sets[0]?.weightKg || 20,
          })),
          notes: completedSession.notes,
        });
      }

      triggerConfetti();
      setCelebration({
        isOpen: true,
        type: 'workout',
        title: 'Workout Completed! 🏆',
        subtitle: `Great work finishing ${completedSession.title} (${completedSession.durationMinutes} min)!`,
        badgeIcon: '🏋️',
      });

      if (newPRs.length > 0) {
        setTimeout(() => {
          showToast(`New Personal Record! 🌟`, `${newPRs[0].exerciseName}: ${newPRs[0].value} ${newPRs[0].unit}`, 'celebrate');
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      showToast("Couldn't save workout right now.", undefined, 'info');
    }
  };

  const cancelActiveWorkout = () => {
    clearActiveWorkoutLocally();
    setActiveWorkout(null);
    showToast('Workout Cancelled', undefined, 'info');
  };

  const logWorkoutDirectly = async (workoutData: Omit<WorkoutSession, 'id'>) => {
    if (!authUser) return;
    const session: WorkoutSession = {
      ...workoutData,
      id: 'ws-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    try {
      await saveUserWorkout(authUser.uid, session);
      showToast('Workout Logged Directly 💪', `${session.title} saved to history!`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const deleteWorkout = async (id: string) => {
    if (!authUser) return;
    try {
      await deleteUserWorkout(authUser.uid, id);
      showToast('Workout removed', undefined, 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const saveTemplate = async (
    templateData: Omit<WorkoutTemplate, 'id'> & { id?: string }
  ): Promise<string> => {
    if (!authUser) throw new Error('Not logged in');
    const id = await saveWorkoutTemplate(authUser.uid, templateData);
    showToast('Template Saved 📋', `"${templateData.title}" is ready for future workouts.`, 'success');
    return id;
  };

  const deleteTemplate = async (id: string) => {
    if (!authUser) return;
    try {
      await deleteWorkoutTemplate(authUser.uid, id);
      showToast('Template removed', undefined, 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Unified Daily Record Helper
  const getDailyRecordForDate = (date: string): DailySummary => {
    const actForDate = activities.find((a) => a.date === date) || null;
    const hydForDate = hydrations.find((h) => h.date === date) || null;
    const sleepForDate = sleeps.find((s) => s.date === date) || null;

    return buildUnifiedDailyRecord(
      date,
      actForDate,
      workouts,
      hydForDate,
      habits,
      sleepForDate,
      meals,
      user
    );
  };

  // Transparent Wellness Score
  const wellnessScore: WellnessScoreBreakdown = useMemo(() => {
    return calculateTransparentWellnessScore(
      todayActivity,
      workouts,
      todayHydration,
      habits,
      todaySleep || null,
      user,
      todayStr
    );
  }, [todayActivity, workouts, todayHydration, habits, todaySleep, user, todayStr]);

  // AI Chat & Insights
  const sendChatMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: AICoachMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updatedMessages = [...aiMessages, userMsg];
    setAiMessages(updatedMessages);
    setIsAIThinking(true);

    try {
      const userContextPayload = {
        name: user.name,
        todaySteps: todayActivity.steps,
        workoutCount: workouts.filter((w) => w.completed).length,
        todayWater: `${(todayHydration.waterMl / 1000).toFixed(1)}L`,
        waterGoal: `${((user.waterGoalMl || 2500) / 1000).toFixed(1)}L`,
        sleepHours: (todaySleep?.durationMinutes || 0) / 60,
        habitsCompleted: habits.filter((h) => h.completedDates.includes(todayStr)).length,
        habitsTotal: habits.length,
        wellnessScore: wellnessScore.totalScore,
        todayMeals: todayMeals,
        weeklyMeals: meals.slice(0, 30),
        foodGroups: Array.from(new Set(meals.flatMap((m) => m.categories || []))),
        checkinFeeling: todayCheckin?.mood,
      };

      const responseText = await sendAICoachMessage(updatedMessages, userContextPayload);

      const coachMsg: AICoachMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'coach',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setAiMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: AICoachMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'coach',
        text: "I'm right here with you! Focus on small, consistent choices today—hydrating well, taking mindful walking breaks, and listening to your body's energy levels.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setAiMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsAIThinking(false);
    }
  };

  const refreshDailyInsights = async () => {
    try {
      const summaryData = {
        date: todayStr,
        steps: todayActivity.steps,
        waterMl: todayHydration.waterMl,
        sleepMinutes: todaySleep?.durationMinutes || 0,
        workoutsCount: workouts.filter((w) => w.completed).length,
      };
      const insights = await fetchDailyInsights(summaryData, user);
      setDailyInsight(insights);
    } catch (err) {
      console.error(err);
    }
  };

  const unlockAchievement = (badgeKey: string) => {
    setAchievements((prev) =>
      prev.map((a) => {
        if (a.badgeKey === badgeKey && !a.unlocked) {
          triggerConfetti();
          showToast(`Achievement Unlocked! 🏆`, a.title, 'celebrate');
          return {
            ...a,
            unlocked: true,
            progress: 100,
            unlockedAt: new Date().toISOString().split('T')[0],
          };
        }
        return a;
      })
    );
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    await updateAuthProfile(updates);
    showToast('Profile Saved', 'Your wellness preferences were updated.', 'success');
  };

  // AI Personalized Plan Action Handlers
  const savePlan = async (newPlan: UserPersonalPlan) => {
    if (!authUser) {
      setActivePlan(newPlan);
      showToast('Personalized Plan Saved! ✨', 'Your daily wellness routine is now live.', 'celebrate');
      triggerConfetti();
      return;
    }
    await saveUserPlan(authUser.uid, newPlan);
    setActivePlan(newPlan);
    showToast('Personalized Plan Saved! ✨', 'Your daily wellness routine is now live.', 'celebrate');
    triggerConfetti();
  };

  const togglePlanTask = async (dayOfWeek: DayOfWeekKey, taskId: string) => {
    if (!activePlan) return;
    const day = activePlan.days.find((d) => d.dayOfWeek === dayOfWeek);
    const task = day?.tasks.find((t) => t.id === taskId);
    const willBeCompleted = !task?.completed;

    if (!authUser) {
      const updatedDays = activePlan.days.map((d) => {
        if (d.dayOfWeek !== dayOfWeek) return d;
        return {
          ...d,
          tasks: d.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  completed: willBeCompleted,
                  completedAt: willBeCompleted ? new Date().toISOString() : undefined,
                }
              : t
          ),
        };
      });
      setActivePlan({ ...activePlan, days: updatedDays });
      if (willBeCompleted) {
        showToast('Task completed! 🎯', task?.title, 'success');
      }
      return;
    }

    try {
      const updated = await togglePlanTaskInFirestore(
        authUser.uid,
        activePlan,
        dayOfWeek,
        taskId,
        willBeCompleted
      );
      setActivePlan(updated);
      if (willBeCompleted) {
        showToast('Task completed! 🎯', task?.title, 'success');
      }
    } catch (err) {
      console.error('Failed to toggle plan task:', err);
    }
  };

  const startWorkoutFromPlan = (workout: PlanWorkoutDetail) => {
    const sessionExercises = workout.exercises.map((ex, idx) => ({
      id: `ex-plan-${Date.now()}-${idx}`,
      name: ex.name,
      category: ex.category,
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      notes: ex.notes,
      sets: Array.from({ length: ex.sets || 3 }).map((_, sIdx) => ({
        id: `set-plan-${Date.now()}-${idx}-${sIdx}`,
        setNumber: sIdx + 1,
        reps: ex.reps || 10,
        weight: ex.weightKg || 0,
        completed: false,
      })),
    }));

    const session: WorkoutSession = {
      id: `workout-${Date.now()}`,
      title: workout.title,
      category: workout.category || 'Full Body',
      durationMinutes: workout.durationMinutes || 30,
      exercises: sessionExercises,
      completed: false,
      date: todayStr,
      notes: workout.focus ? `Focus: ${workout.focus}` : '',
      createdAt: new Date().toISOString(),
    };

    setActiveWorkout(session);
    saveActiveWorkoutLocally(session);
    setActiveTab('workout');
    showToast('Starting Workout! 🏋️', workout.title, 'info');
  };

  const adaptCurrentPlan = async (
    missedDay: string,
    missedType: string,
    userNote?: string
  ): Promise<{ adjustmentMessage: string; tip: string }> => {
    if (!activePlan) {
      throw new Error('No active plan available to adapt');
    }
    const res = await requestAIPlanAdaptation(activePlan, missedDay, missedType, userNote);
    return {
      adjustmentMessage: res.adjustmentMessage,
      tip: res.tip,
    };
  };

  const setPlanStatusHandler = async (
    planId: string,
    status: 'active' | 'paused' | 'completed'
  ) => {
    if (!authUser) return;
    await updatePlanStatus(authUser.uid, planId, status);
    showToast(`Plan ${status}`, undefined, 'info');
  };

  // Daily Checkin Handler
  const logDailyCheckinHandler = async (
    mood: MoodFeeling,
    energy?: EnergyLevel,
    note?: string
  ) => {
    const record = await saveDailyCheckin(authUser?.uid || 'guest-user', todayStr, {
      mood,
      energy,
      note,
    });
    setTodayCheckin(record);
    const supportiveMsg =
      mood === 'tired' || mood === 'low'
        ? 'Rest and recovery prioritized today.'
        : 'Daily check-in logged!';
    showToast('Check-in Saved 🌿', supportiveMsg, 'success');
    refreshDailyInsights();
  };

  // Daily Intelligence Summary Generator
  const fetchDailySummaryHandler = async (forceRefresh = false): Promise<AIDailySummaryData> => {
    if (dailySummary && !forceRefresh) return dailySummary;
    setIsLoadingDailySummary(true);
    try {
      const todayWorkout = workouts.find((w) => w.date === todayStr && w.completed) || null;
      const todayPlanDayTasks = activePlan?.days.find(
        (d) => d.dayOfWeek === new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()
      )?.tasks || [];

      const analysisContext = {
        profile: user,
        todayDate: todayStr,
        todayWorkout,
        recentWorkouts: workouts.slice(0, 5),
        todayActivity,
        activityHistory: activityHistory.slice(0, 7),
        todayHydration,
        hydrationHistory: hydrationHistory.slice(0, 7),
        habits,
        todaySleep,
        todayMeals,
        todayCheckin,
        activePlan,
        todayPlanDayTasks,
      };

      const res = await generateDailySummary(analysisContext);
      setDailySummary(res);
      return res;
    } finally {
      setIsLoadingDailySummary(false);
    }
  };

  // Weekly Consistency Review Generator
  const fetchWeeklyReviewHandler = async (forceRefresh = false): Promise<WeeklyReview> => {
    if (currentWeeklyReview && !forceRefresh) return currentWeeklyReview;
    setIsLoadingWeeklyReview(true);
    try {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 6);
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const weeklyContext = {
        profile: user,
        weekStartDate: weekStartStr,
        weekEndDate: todayStr,
        workoutsThisWeek: workouts.filter((w) => w.date >= weekStartStr && w.completed),
        activityThisWeek: activityHistory.filter((a) => a.date >= weekStartStr),
        hydrationThisWeek: hydrationHistory.filter((h) => h.date >= weekStartStr),
        habits,
        sleepThisWeek: rawSleep ? [rawSleep] : [],
        checkinsThisWeek: todayCheckin ? [todayCheckin] : [],
        activePlan,
      };

      const review = await generateWeeklyReview(weeklyContext);
      if (authUser) {
        await saveWeeklyReview(authUser.uid, review);
      }
      setCurrentWeeklyReview(review);
      return review;
    } finally {
      setIsLoadingWeeklyReview(false);
    }
  };

  // Plan Regeneration (Keeps history, creates new active plan)
  const regenerateMyWeekHandler = async (customGoal?: string) => {
    const preferences: PlanPreferences = {
      goals: customGoal
        ? [customGoal, ...(user.interests || ['General Wellness'])]
        : (user.interests as string[]) || ['General Wellness', 'Daily Consistency'],
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      preferredWorkoutTime: 'Morning',
      workoutDuration: '30 min',
      activityLevel: 'Moderately active',
      experienceLevel: 'Intermediate',
      equipment: ['Home equipment', 'Dumbbells'],
      customGoal: customGoal || undefined,
    };

    const newPlan = await requestAIPersonalPlan(preferences, user);

    if (activePlan && authUser) {
      await updatePlanStatus(authUser.uid, activePlan.id, 'completed');
    }

    await savePlan(newPlan);
    showToast('New Week Created! ✨', 'Your fresh 7-day personalized plan is now active.', 'celebrate');
    triggerConfetti();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        activeTab,
        setActiveTab,
        isLoadingData,

        isQuickAddOpen,
        setQuickAddOpen,
        quickAddInitialType,
        openQuickAddWithType,

        // AI Personalized Plans
        activePlan,
        allPlans,
        isPlanModalOpen,
        setPlanModalOpen,
        isPlanAdaptModalOpen,
        setPlanAdaptModalOpen,
        isPlanCreateModalOpen,
        setPlanCreateModalOpen,
        isPlanHistoryOpen,
        setIsPlanHistoryOpen,
        isRegenerateModalOpen,
        setIsRegenerateModalOpen,
        savePlan,
        togglePlanTask,
        startWorkoutFromPlan,
        adaptCurrentPlan,
        setPlanStatus: setPlanStatusHandler,
        regenerateMyWeek: regenerateMyWeekHandler,

        // Daily Unified Summary Record
        getDailyRecordForDate,

        // Achievements
        achievements,
        unlockAchievement,

        // AI Coach & Daily Intelligence
        aiMessages,
        isAIThinking,
        sendChatMessage,
        dailyInsight,
        refreshDailyInsights,
        dailySummary,
        isLoadingDailySummary,
        isDailySummaryOpen,
        setIsDailySummaryOpen,
        fetchDailySummary: fetchDailySummaryHandler,

        // Daily Checkin
        todayCheckin,
        logDailyCheckin: logDailyCheckinHandler,

        // Weekly Review
        weeklyReviews,
        currentWeeklyReview,
        isLoadingWeeklyReview,
        isWeeklyReviewOpen,
        setIsWeeklyReviewOpen,
        fetchWeeklyReview: fetchWeeklyReviewHandler,

        // Workouts
        workouts,
        templates,
        personalRecords,
        workoutStreak,
        activeWorkout,
        startNewWorkout,
        startWorkoutFromTemplate,
        startWorkoutSession,
        updateActiveWorkout,
        finishActiveWorkout,
        cancelActiveWorkout,
        logWorkoutDirectly,
        deleteWorkout,
        saveTemplate,
        deleteTemplate,

        // Activities
        activities,
        todayActivity,
        logActivity,
        addSteps,

        // Hydration
        hydrations,
        todayHydration,
        addWater,
        editWaterEntry,
        deleteWaterEntry,
        setWaterGoal,
        hydrationSettings,
        updateHydrationSettings,

        // Nutrition & Sleep
        meals,
        todayMeals,
        addMeal,
        updateMeal,
        deleteMeal,
        nutritionInsight,
        isLoadingNutritionInsight,
        fetchNutritionInsight,

        sleeps,
        todaySleep,
        logSleep,

        // Habits
        habits,
        toggleHabit,
        createHabit,
        deleteHabit,
        updateHabit,

        // Wellness Score
        wellnessScore,

        // Celebration & Toasts
        celebration,
        closeCelebration,
        triggerConfetti,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
