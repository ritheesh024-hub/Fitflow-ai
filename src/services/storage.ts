import {
  UserProfile,
  WorkoutSession,
  ActivityDay,
  HydrationDay,
  MealItem,
  SleepRecord,
  Habit,
  Achievement,
  AIDailyInsight,
  AICoachMessage,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: 'local-active-user',
      email: 'user@fitflow.ai',
    },
    operationType,
    path,
  };
  console.warn('Firestore Layer Context: ', JSON.stringify(errInfo));
}

// Format local date YYYY-MM-DD
export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateDaysAgoStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'user_fitflow_01',
  name: 'Alex Rivera',
  email: 'alex@fitflow.ai',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  memberSince: 'August 2026',
  interests: ['Build consistency', 'Improve fitness', 'Improve hydration', 'Build healthier routines'],
  waterGoalMl: 2500,
  dailyStepGoal: 8000,
  sleepGoalHours: 8,
  theme: 'light',
  notifications: {
    hydration: true,
    workout: true,
    habits: true,
    sleep: true,
  },
  isOnboarded: true,
};

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    name: 'Morning Hydration',
    icon: '💧',
    category: 'hydration',
    streak: 6,
    bestStreak: 14,
    active: true,
    completedDates: [
      getDateDaysAgoStr(0),
      getDateDaysAgoStr(1),
      getDateDaysAgoStr(2),
      getDateDaysAgoStr(3),
      getDateDaysAgoStr(4),
      getDateDaysAgoStr(5),
    ],
  },
  {
    id: 'habit-2',
    name: 'Daily 30-min Movement',
    icon: '🚶',
    category: 'fitness',
    streak: 4,
    bestStreak: 10,
    active: true,
    completedDates: [
      getDateDaysAgoStr(0),
      getDateDaysAgoStr(1),
      getDateDaysAgoStr(2),
      getDateDaysAgoStr(3),
    ],
  },
  {
    id: 'habit-3',
    name: 'Workout Session',
    icon: '🏋️',
    category: 'fitness',
    streak: 3,
    bestStreak: 7,
    active: true,
    completedDates: [
      getDateDaysAgoStr(0),
      getDateDaysAgoStr(2),
      getDateDaysAgoStr(4),
    ],
  },
  {
    id: 'habit-4',
    name: 'Mindful Evening Stretch',
    icon: '🧘',
    category: 'recovery',
    streak: 5,
    bestStreak: 12,
    active: true,
    completedDates: [
      getDateDaysAgoStr(0),
      getDateDaysAgoStr(1),
      getDateDaysAgoStr(2),
      getDateDaysAgoStr(3),
      getDateDaysAgoStr(4),
    ],
  },
  {
    id: 'habit-5',
    name: 'Consistent Bedtime by 11 PM',
    icon: '😴',
    category: 'recovery',
    streak: 5,
    bestStreak: 8,
    active: true,
    completedDates: [
      getDateDaysAgoStr(0),
      getDateDaysAgoStr(1),
      getDateDaysAgoStr(2),
      getDateDaysAgoStr(3),
      getDateDaysAgoStr(4),
    ],
  },
  {
    id: 'habit-6',
    name: 'Read or Journal 15 mins',
    icon: '📖',
    category: 'mindset',
    streak: 2,
    bestStreak: 6,
    active: true,
    completedDates: [
      getDateDaysAgoStr(1),
      getDateDaysAgoStr(2),
    ],
  },
];

export const INITIAL_WORKOUTS: WorkoutSession[] = [
  {
    id: 'w-today',
    title: 'Upper Body & Core Strength',
    category: 'Upper Body',
    date: getTodayDateStr(),
    durationMinutes: 42,
    completed: true,
    completedAt: '10:45 AM',
    notes: 'Felt energized throughout the dumbbell press. Lat pulldown form was crisp.',
    exercises: [
      {
        id: 'ex-1',
        name: 'Dumbbell Bench Press',
        category: 'strength',
        targetMuscle: 'Chest & Triceps',
        sets: [
          { setNumber: 1, reps: 10, weightKg: 20, completed: true },
          { setNumber: 2, reps: 10, weightKg: 22, completed: true },
          { setNumber: 3, reps: 8, weightKg: 24, completed: true },
        ],
      },
      {
        id: 'ex-2',
        name: 'Lat Pulldown',
        category: 'strength',
        targetMuscle: 'Back & Biceps',
        sets: [
          { setNumber: 1, reps: 12, weightKg: 45, completed: true },
          { setNumber: 2, reps: 12, weightKg: 50, completed: true },
          { setNumber: 3, reps: 10, weightKg: 50, completed: true },
        ],
      },
      {
        id: 'ex-3',
        name: 'Standing Shoulder Press',
        category: 'strength',
        targetMuscle: 'Shoulders',
        sets: [
          { setNumber: 1, reps: 10, weightKg: 14, completed: true },
          { setNumber: 2, reps: 10, weightKg: 14, completed: true },
          { setNumber: 3, reps: 8, weightKg: 16, completed: true },
        ],
      },
      {
        id: 'ex-4',
        name: 'Incline Bicep Curls',
        category: 'strength',
        targetMuscle: 'Biceps',
        sets: [
          { setNumber: 1, reps: 12, weightKg: 10, completed: true },
          { setNumber: 2, reps: 12, weightKg: 10, completed: true },
        ],
      },
    ],
  },
  {
    id: 'w-prev-1',
    title: 'Lower Body & Mobility Flow',
    category: 'Lower Body',
    date: getDateDaysAgoStr(2),
    durationMinutes: 48,
    completed: true,
    completedAt: '09:30 AM',
    notes: 'Goblet squats with deep range of motion. Romanian deadlifts felt great.',
    exercises: [
      {
        id: 'ex-5',
        name: 'Goblet Squats',
        category: 'strength',
        targetMuscle: 'Quads & Glutes',
        sets: [
          { setNumber: 1, reps: 12, weightKg: 24, completed: true },
          { setNumber: 2, reps: 12, weightKg: 28, completed: true },
          { setNumber: 3, reps: 10, weightKg: 28, completed: true },
        ],
      },
      {
        id: 'ex-6',
        name: 'Dumbbell Romanian Deadlift',
        category: 'strength',
        targetMuscle: 'Hamstrings & Glutes',
        sets: [
          { setNumber: 1, reps: 10, weightKg: 22, completed: true },
          { setNumber: 2, reps: 10, weightKg: 24, completed: true },
          { setNumber: 3, reps: 10, weightKg: 24, completed: true },
        ],
      },
      {
        id: 'ex-7',
        name: 'Bulgarian Split Squats',
        category: 'strength',
        targetMuscle: 'Legs',
        sets: [
          { setNumber: 1, reps: 8, weightKg: 12, completed: true },
          { setNumber: 2, reps: 8, weightKg: 12, completed: true },
        ],
      },
    ],
  },
  {
    id: 'w-prev-2',
    title: 'Core Stability & Cardio Conditioning',
    category: 'Core & Cardio',
    date: getDateDaysAgoStr(4),
    durationMinutes: 35,
    completed: true,
    completedAt: '05:15 PM',
    notes: 'Controlled hollow body holds and brisk interval sprints on the rowing machine.',
    exercises: [
      {
        id: 'ex-8',
        name: 'Plank to Pike',
        category: 'core',
        targetMuscle: 'Abdominals',
        sets: [
          { setNumber: 1, reps: 15, completed: true },
          { setNumber: 2, reps: 15, completed: true },
        ],
      },
      {
        id: 'ex-9',
        name: 'Hanging Knee Raises',
        category: 'core',
        targetMuscle: 'Lower Abs',
        sets: [
          { setNumber: 1, reps: 12, completed: true },
          { setNumber: 2, reps: 12, completed: true },
        ],
      },
    ],
  },
  {
    id: 'w-prev-3',
    title: 'Full Body Functional Strength',
    category: 'Full Body',
    date: getDateDaysAgoStr(6),
    durationMinutes: 50,
    completed: true,
    completedAt: '08:00 AM',
    notes: 'Solid compound movements and dynamic warmup.',
    exercises: [
      {
        id: 'ex-10',
        name: 'Push-Ups to Renegade Row',
        category: 'strength',
        sets: [
          { setNumber: 1, reps: 10, weightKg: 10, completed: true },
          { setNumber: 2, reps: 10, weightKg: 10, completed: true },
        ],
      },
    ],
  },
];

export const INITIAL_ACTIVITIES: ActivityDay[] = [
  {
    id: 'act-0',
    date: getTodayDateStr(),
    steps: 6842,
    distanceKm: 4.8,
    activeMinutes: 52,
    approxCalories: 310,
    logs: [
      { id: 'l1', timestamp: '08:15 AM', activityType: 'walking', steps: 2400, distance: 1.7, distanceUnit: 'km', activeMinutes: 22, date: getTodayDateStr() },
      { id: 'l2', timestamp: '12:30 PM', activityType: 'walking', steps: 1850, distance: 1.3, distanceUnit: 'km', activeMinutes: 16, date: getTodayDateStr() },
      { id: 'l3', timestamp: '04:00 PM', activityType: 'other', steps: 2592, distance: 1.8, distanceUnit: 'km', activeMinutes: 14, date: getTodayDateStr() },
    ],
  },
  {
    id: 'act-1',
    date: getDateDaysAgoStr(1),
    steps: 8420,
    distanceKm: 5.9,
    activeMinutes: 65,
    approxCalories: 380,
    logs: [],
  },
  {
    id: 'act-2',
    date: getDateDaysAgoStr(2),
    steps: 7650,
    distanceKm: 5.3,
    activeMinutes: 58,
    approxCalories: 340,
    logs: [],
  },
  {
    id: 'act-3',
    date: getDateDaysAgoStr(3),
    steps: 9150,
    distanceKm: 6.4,
    activeMinutes: 72,
    approxCalories: 410,
    logs: [],
  },
  {
    id: 'act-4',
    date: getDateDaysAgoStr(4),
    steps: 6200,
    distanceKm: 4.3,
    activeMinutes: 45,
    approxCalories: 280,
    logs: [],
  },
  {
    id: 'act-5',
    date: getDateDaysAgoStr(5),
    steps: 8900,
    distanceKm: 6.2,
    activeMinutes: 68,
    approxCalories: 395,
    logs: [],
  },
  {
    id: 'act-6',
    date: getDateDaysAgoStr(6),
    steps: 7100,
    distanceKm: 4.9,
    activeMinutes: 50,
    approxCalories: 320,
    logs: [],
  },
];

export const INITIAL_HYDRATIONS: HydrationDay[] = [
  {
    id: 'hyd-0',
    date: getTodayDateStr(),
    waterMl: 1800,
    goalMl: 2500,
    entries: [
      { id: 'h1', timestamp: '07:30 AM', amountMl: 500 },
      { id: 'h2', timestamp: '10:15 AM', amountMl: 300 },
      { id: 'h3', timestamp: '01:00 PM', amountMl: 500 },
      { id: 'h4', timestamp: '03:45 PM', amountMl: 500 },
    ],
  },
  {
    id: 'hyd-1',
    date: getDateDaysAgoStr(1),
    waterMl: 2500,
    goalMl: 2500,
    entries: [{ id: 'h5', timestamp: '08:00 PM', amountMl: 2500 }],
  },
  {
    id: 'hyd-2',
    date: getDateDaysAgoStr(2),
    waterMl: 2300,
    goalMl: 2500,
    entries: [{ id: 'h6', timestamp: '08:00 PM', amountMl: 2300 }],
  },
  {
    id: 'hyd-3',
    date: getDateDaysAgoStr(3),
    waterMl: 2750,
    goalMl: 2500,
    entries: [{ id: 'h7', timestamp: '08:00 PM', amountMl: 2750 }],
  },
  {
    id: 'hyd-4',
    date: getDateDaysAgoStr(4),
    waterMl: 2100,
    goalMl: 2500,
    entries: [{ id: 'h8', timestamp: '08:00 PM', amountMl: 2100 }],
  },
  {
    id: 'hyd-5',
    date: getDateDaysAgoStr(5),
    waterMl: 2600,
    goalMl: 2500,
    entries: [{ id: 'h9', timestamp: '08:00 PM', amountMl: 2600 }],
  },
  {
    id: 'hyd-6',
    date: getDateDaysAgoStr(6),
    waterMl: 2400,
    goalMl: 2500,
    entries: [{ id: 'h10', timestamp: '08:00 PM', amountMl: 2400 }],
  },
];

export const INITIAL_MEALS: MealItem[] = [
  {
    id: 'm-1',
    date: getTodayDateStr(),
    mealType: 'breakfast',
    name: 'Oatmeal with Blueberries & Chia Seeds',
    categories: ['grains', 'fruits', 'healthy_fats', 'fluids'],
    notes: 'Warm steel cut oats topped with fresh wild berries and almond milk.',
    time: '08:30 AM',
    feeling: 'energized',
  },
  {
    id: 'm-2',
    date: getTodayDateStr(),
    mealType: 'lunch',
    name: 'Grilled Salmon Bowl with Quinoa & Steamed Greens',
    categories: ['protein', 'vegetables', 'grains', 'healthy_fats'],
    notes: 'Steamed broccoli, avocado slices, and lime tahini dressing.',
    time: '01:15 PM',
    feeling: 'satisfied',
  },
  {
    id: 'm-3',
    date: getTodayDateStr(),
    mealType: 'snack',
    name: 'Crisp Apple Slices & Handful of Walnuts',
    categories: ['fruits', 'healthy_fats'],
    notes: 'Great afternoon refresher before workout.',
    time: '04:15 PM',
    feeling: 'light',
  },
];

export const INITIAL_SLEEPS: SleepRecord[] = [
  {
    id: 'sl-0',
    date: getTodayDateStr(),
    durationMinutes: 462, // 7h 42m
    bedtime: '23:10',
    wakeTime: '06:52',
    energyLevel: 4,
    recoveryRating: 'Good Recovery',
    notes: 'Woke up naturally a few minutes before alarm. Slept soundly without waking.',
  },
  {
    id: 'sl-1',
    date: getDateDaysAgoStr(1),
    durationMinutes: 480, // 8h 00m
    bedtime: '22:45',
    wakeTime: '06:45',
    energyLevel: 5,
    recoveryRating: 'Deep Recovery',
    notes: 'Felt fully recharged and clear headed.',
  },
  {
    id: 'sl-2',
    date: getDateDaysAgoStr(2),
    durationMinutes: 435, // 7h 15m
    bedtime: '23:30',
    wakeTime: '06:45',
    energyLevel: 3,
    recoveryRating: 'Fair Recovery',
    notes: 'Slightly late bedtime due to reading.',
  },
  {
    id: 'sl-3',
    date: getDateDaysAgoStr(3),
    durationMinutes: 495, // 8h 15m
    bedtime: '22:30',
    wakeTime: '06:45',
    energyLevel: 5,
    recoveryRating: 'Deep Recovery',
    notes: 'Excellent deep sleep cycle.',
  },
  {
    id: 'sl-4',
    date: getDateDaysAgoStr(4),
    durationMinutes: 450, // 7h 30m
    bedtime: '23:00',
    wakeTime: '06:30',
    energyLevel: 4,
    recoveryRating: 'Good Recovery',
  },
  {
    id: 'sl-5',
    date: getDateDaysAgoStr(5),
    durationMinutes: 470, // 7h 50m
    bedtime: '22:50',
    wakeTime: '06:40',
    energyLevel: 4,
    recoveryRating: 'Good Recovery',
  },
  {
    id: 'sl-6',
    date: getDateDaysAgoStr(6),
    durationMinutes: 440, // 7h 20m
    bedtime: '23:20',
    wakeTime: '06:40',
    energyLevel: 3,
    recoveryRating: 'Fair Recovery',
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    badgeKey: 'first_workout',
    title: 'First Workout',
    description: 'Completed your very first strength or cardio session with FitFlow.',
    icon: '🏆',
    category: 'workout',
    unlocked: true,
    unlockedAt: 'Aug 12, 2026',
    progress: 100,
    requirement: 'Log 1 workout session',
  },
  {
    id: 'ach-2',
    badgeKey: 'consistency_7',
    title: '7-Day Consistency',
    description: 'Tracked habits or movement every day for an entire full week.',
    icon: '🔥',
    category: 'consistency',
    unlocked: true,
    unlockedAt: 'Aug 17, 2026',
    progress: 100,
    requirement: 'Maintain 7-day habit streak',
  },
  {
    id: 'ach-3',
    badgeKey: 'hydration_hero',
    title: 'Hydration Hero',
    description: 'Met your daily water goal (2.5L) on 5 separate days.',
    icon: '💧',
    category: 'hydration',
    unlocked: true,
    unlockedAt: 'Aug 18, 2026',
    progress: 100,
    requirement: 'Reach hydration goal 5 times',
  },
  {
    id: 'ach-4',
    badgeKey: 'move_more',
    title: 'Move More',
    description: 'Surpassed 50,000 total steps logged this month.',
    icon: '🚶',
    category: 'activity',
    unlocked: false,
    progress: 78,
    requirement: 'Log 50,000 steps (Current: 39,200)',
  },
  {
    id: 'ach-5',
    badgeKey: 'personal_record',
    title: 'Personal Record',
    description: 'Set a new personal best on exercise weight or reps completed.',
    icon: '💪',
    category: 'workout',
    unlocked: true,
    unlockedAt: 'Aug 15, 2026',
    progress: 100,
    requirement: 'Log an exercise with increased weight/reps',
  },
  {
    id: 'ach-6',
    badgeKey: 'journey_30',
    title: '30-Day Journey',
    description: 'Stay committed to healthy wellness routines for a full 30 days.',
    icon: '🌟',
    category: 'consistency',
    unlocked: false,
    progress: 45,
    requirement: '30 active days logged (Current: 14)',
  },
  {
    id: 'ach-7',
    badgeKey: 'recovery_master',
    title: 'Recovery Champion',
    description: 'Achieved 7+ hours of quality sleep for 5 consecutive nights.',
    icon: '😴',
    category: 'recovery',
    unlocked: true,
    unlockedAt: 'Aug 16, 2026',
    progress: 100,
    requirement: 'Log 5 consecutive nights with 7h+ sleep',
  },
  {
    id: 'ach-8',
    badgeKey: 'balanced_fuel',
    title: 'Nourishing Plate',
    description: 'Logged meals rich in diverse vegetable, fruit, and protein categories.',
    icon: '🥗',
    category: 'mindfulness',
    unlocked: true,
    unlockedAt: 'Aug 18, 2026',
    progress: 100,
    requirement: 'Log 3 balanced meals in a single day',
  },
];

export const INITIAL_AI_INSIGHT: AIDailyInsight = {
  date: getTodayDateStr(),
  observations: [
    "You've been consistent with your workouts this week with 4 logged sessions.",
    "Daily movement is steady at 6,842 steps, with strong afternoon active minutes.",
    "Hydration is currently at 1.8L / 2.5L—one more bottle will hit your target.",
    "Sleep duration (7h 42m) is supporting smooth physical recovery.",
  ],
  suggestion: "Today could be a great opportunity to focus on light evening stretching and reaching your hydration goal.",
  encouragement: "Consistency is your superpower! Small daily habits compound into lifelong energy. ✨",
};

export const INITIAL_AI_CHAT: AICoachMessage[] = [
  {
    id: 'msg-1',
    sender: 'coach',
    text: "Hey Alex! 👋 I'm your FitFlow wellness coach. I've reviewed your habits for this week—you've built amazing workout momentum and hit your sleep targets 5 out of 7 days! How are your energy levels feeling today?",
    timestamp: '09:00 AM',
  },
];

// Local Storage Helper Functions
const STORAGE_PREFIX = 'fitflow_ai_';

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (e) {
    console.warn(`Error reading localStorage for key ${key}:`, e);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing to localStorage for key ${key}:`, e);
  }
}
