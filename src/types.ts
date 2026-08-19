export type NavigationTab =
  | 'home'
  | 'workout'
  | 'activity'
  | 'hydration'
  | 'nutrition'
  | 'sleep'
  | 'habits'
  | 'progress'
  | 'aicoach'
  | 'achievements'
  | 'profile';

export type TimeRange = '7d' | '30d' | '90d';

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Arms'
  | 'Legs'
  | 'Core'
  | 'Full Body'
  | 'Cardio & Mobility';

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseEquipment =
  | 'Barbell'
  | 'Dumbbell'
  | 'Cable'
  | 'Machine'
  | 'Bodyweight'
  | 'Kettlebell'
  | 'Resistance Band'
  | 'None';

export type ExerciseCategoryType = 'strength' | 'cardio' | 'mobility' | 'bodyweight' | 'core';

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  category: ExerciseCategoryType;
  equipment: ExerciseEquipment;
  description: string;
  instructions: string[];
  difficulty: ExerciseDifficulty;
  secondaryMuscles?: string[];
}

export interface ExerciseSet {
  setNumber: number;
  reps: number;
  weightKg?: number;
  weightUnit?: 'kg' | 'lbs';
  durationSeconds?: number;
  notes?: string;
  completed: boolean;
  completedAt?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategoryType;
  muscleGroup?: MuscleGroup | string;
  equipment?: ExerciseEquipment | string;
  targetMuscle?: string;
  sets: ExerciseSet[];
  notes?: string;
  instructions?: string[];
}

export interface WorkoutSession {
  id: string;
  title: string;
  category:
    | 'Full Body'
    | 'Upper Body'
    | 'Lower Body'
    | 'Push'
    | 'Pull'
    | 'Legs'
    | 'Core & Cardio'
    | 'Mobility & Recovery'
    | 'Custom';
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  exercises: Exercise[];
  notes?: string;
  completed: boolean;
  completedAt?: string;
  startedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutTemplate {
  id: string;
  userId?: string;
  title: string;
  category: WorkoutSession['category'];
  exercises: {
    name: string;
    category: ExerciseCategoryType;
    muscleGroup?: MuscleGroup | string;
    equipment?: ExerciseEquipment | string;
    defaultSets: number;
    defaultReps: number;
    defaultWeightKg?: number;
  }[];
  notes?: string;
  createdAt?: string;
}

export interface PersonalRecord {
  id: string;
  exerciseName: string;
  metricType: 'heaviest_weight' | 'most_reps' | 'longest_duration';
  value: number;
  unit: string;
  date: string;
  workoutTitle?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  memberSince: string;
  interests: string[];
  waterGoalMl: number;
  dailyStepGoal: number;
  sleepGoalHours: number;
  weeklyWorkoutGoal?: number;
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled?: boolean;
  notifications?: {
    hydration: boolean;
    workout: boolean;
    habits: boolean;
    sleep: boolean;
  };
  isOnboarded: boolean;
  activePlanId?: string;
}

// ----------------------------------------------------
// ACTIVITY & MOVEMENT TYPES
// ----------------------------------------------------
export type ActivityType = 'walking' | 'running' | 'cycling' | 'sports' | 'other';
export type DistanceUnit = 'km' | 'mi';

export interface ActivityLogEntry {
  id: string;
  activityType: ActivityType;
  steps: number;
  distance: number;
  distanceUnit: DistanceUnit;
  activeMinutes: number;
  timestamp: string; // e.g. "14:30"
  date: string; // YYYY-MM-DD
  createdAt?: string;
}

export interface ActivityDay {
  id: string;
  date: string; // YYYY-MM-DD
  steps: number;
  distanceKm: number;
  activeMinutes: number;
  approxCalories: number; // Transparent approximate metric
  logs: ActivityLogEntry[];
}

export interface ActivityProviderIntegration {
  provider: 'manual' | 'healthKit' | 'healthConnect' | 'googleFit';
  name: string;
  platform: 'iOS' | 'Android' | 'Web';
  status: 'connected' | 'not_connected' | 'coming_soon';
  icon: string;
  description: string;
}

// ----------------------------------------------------
// HYDRATION TYPES
// ----------------------------------------------------
export interface HydrationEntry {
  id: string;
  timestamp: string; // e.g. "09:15"
  amountMl: number;
  createdAt?: string;
}

export interface HydrationDay {
  id: string;
  date: string; // YYYY-MM-DD
  waterMl: number;
  goalMl: number;
  entries: HydrationEntry[];
}

export interface HydrationNotificationSettings {
  enabled: boolean;
  intervalHours: number; // e.g. 1, 2, 3, 4
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string; // e.g. "07:00"
  soundEnabled: boolean;
}

// ----------------------------------------------------
// HABIT TYPES
// ----------------------------------------------------
export type HabitFrequency = 'daily' | 'weekly';
export type HabitCategory =
  | 'fitness'
  | 'mindset'
  | 'nutrition'
  | 'recovery'
  | 'lifestyle'
  | 'mindfulness'
  | 'movement'
  | 'hydration'
  | 'sleep'
  | 'general';

export interface Habit {
  id: string;
  userId?: string;
  name: string;
  icon: string;
  description?: string;
  category?: HabitCategory;
  frequency?: HabitFrequency;
  reminderEnabled?: boolean;
  reminderTime?: string;
  active: boolean;
  streak: number;
  bestStreak: number;
  weeklyConsistency?: number; // 0-100%
  monthlyConsistency?: number; // 0-100%
  completedDates: string[]; // ['2026-08-18', ...]
  targetCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HabitCompletionRecord {
  habitId: string;
  date: string;
  completed: boolean;
  completedAt: string;
}

// ----------------------------------------------------
// NUTRITION & MEALS
// ----------------------------------------------------
export type FoodCategory =
  | 'vegetables'
  | 'fruits'
  | 'protein'
  | 'grains'
  | 'healthy_fats'
  | 'dairy'
  | 'fluids'
  | 'other';

export interface MealItem {
  id: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string; // Food / meal free-text description
  description?: string; // Optional alias
  categories: FoodCategory[];
  notes?: string;
  time: string; // e.g. "08:30" or "08:30 AM"
  timestamp?: string;
  feeling?: 'energized' | 'satisfied' | 'light' | 'good';
  createdAt?: string;
  updatedAt?: string;
}

export interface AINutritionInsightData {
  headline: string;
  message: string;
  suggestions: string[];
  categoriesLogged: string[];
  consistencySummary: string;
  isEnoughData: boolean;
  confidence: 'low' | 'medium' | 'high';
  timestamp?: string;
}

// ----------------------------------------------------
// SLEEP RECORD
// ----------------------------------------------------
export interface SleepRecord {
  id: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  bedtime: string; // e.g. "23:15"
  wakeTime: string; // e.g. "07:00"
  energyLevel: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  recoveryRating: 'Deep Recovery' | 'Good Recovery' | 'Fair Recovery' | 'Needs Rest';
  notes?: string;
}

// ----------------------------------------------------
// UNIFIED DAILY SUMMARY
// ----------------------------------------------------
export interface DailySummary {
  date: string;
  activity: ActivityDay;
  workouts: WorkoutSession[];
  hydration: HydrationDay;
  habits: {
    habitId: string;
    name: string;
    icon: string;
    completed: boolean;
  }[];
  sleep: SleepRecord | null;
  meals: MealItem[];
  wellnessScore: WellnessScoreBreakdown;
}

// ----------------------------------------------------
// ACHIEVEMENTS & AI
// ----------------------------------------------------
export interface Achievement {
  id: string;
  badgeKey: string;
  title: string;
  description: string;
  icon: string;
  category: 'workout' | 'hydration' | 'consistency' | 'activity' | 'mindfulness' | 'recovery';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 to 100
  requirement: string;
}

export interface AICoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

export interface AIDailyInsight {
  date?: string;
  headline?: string;
  message?: string;
  observations?: string[];
  suggestion: string;
  encouragement?: string;
  confidence?: 'high' | 'medium' | 'low';
  isEnoughData?: boolean;
  source?: string;
}

export interface WellnessScoreBreakdown {
  totalScore: number;
  previousScore: number;
  changePercent: number;
  activityScore: number;
  workoutScore: number;
  hydrationScore: number;
  sleepScore: number;
  habitScore: number;
  statusText: string;
  isTransparent: boolean;
  missingCategories?: string[];
}

// ----------------------------------------------------
// AI PERSONALIZED PLAN TYPES
// ----------------------------------------------------
export interface PlanExerciseItem {
  name: string;
  category: ExerciseCategoryType;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: number;
  weightKg?: number;
  notes?: string;
}

export interface PlanWorkoutDetail {
  title: string;
  category: WorkoutSession['category'];
  durationMinutes: number;
  focus: string;
  exercises: PlanExerciseItem[];
}

export interface PlanActivityDetail {
  title: string;
  targetSteps: number;
  distanceKm?: number;
  description: string;
}

export interface PlanHydrationDetail {
  targetMl: number;
  tip: string;
}

export interface PlanHabitDetail {
  name: string;
  icon: string;
  category: HabitCategory;
  description: string;
}

export interface PlanRecoveryDetail {
  title: string;
  sleepTargetHours: number;
  routine: string;
  isRestDay: boolean;
}

export interface PlanDayTask {
  id: string;
  type: 'workout' | 'activity' | 'hydration' | 'habit' | 'recovery';
  title: string;
  subtitle?: string;
  icon: string;
  completed: boolean;
  completedAt?: string;
}

export type DayOfWeekKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface PlanDaySchedule {
  dayOfWeek: DayOfWeekKey;
  dayName: string; // "Monday", "Tuesday", etc.
  focusTheme: string;
  workout?: PlanWorkoutDetail | null;
  activity: PlanActivityDetail;
  hydration: PlanHydrationDetail;
  habit: PlanHabitDetail;
  recovery: PlanRecoveryDetail;
  tasks: PlanDayTask[];
}

export interface PlanPreferences {
  goals: string[];
  customGoal?: string;
  availableDays: string[]; // e.g. ['Monday', 'Wednesday', 'Friday', 'Saturday']
  preferredWorkoutTime: 'Morning' | 'Afternoon' | 'Evening' | 'Flexible';
  workoutDuration: '15 min' | '30 min' | '45 min' | '60 min' | 'Flexible';
  activityLevel: 'Mostly sedentary' | 'Lightly active' | 'Moderately active' | 'Very active';
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  enjoyedActivities?: string;
  equipment: string[]; // e.g. ['No equipment', 'Home equipment', 'Dumbbells', ...]
  scheduleDetails?: {
    wakeUpTime?: string;
    schoolWorkHours?: string;
    sleepTarget?: string;
    freeTime?: string;
  };
}

export interface UserPersonalPlan {
  id: string;
  userId: string;
  title: string;
  summary: string;
  weeklyGoalSummary: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  preferences: PlanPreferences;
  days: PlanDaySchedule[];
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// AI DAILY INTELLIGENCE & CHECK-IN TYPES
// ----------------------------------------------------
export type MoodFeeling = 'great' | 'good' | 'okay' | 'low' | 'tired';
export type EnergyLevel = 'high' | 'medium' | 'low' | 'exhausted';

export interface DailyCheckin {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mood: MoodFeeling;
  energy?: EnergyLevel;
  note?: string;
  createdAt: string;
}

export interface WeeklyReview {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  summary: string;
  strongestHabit: string;
  areaToImprove: string;
  whatWentWell: {
    title: string;
    icon: string;
    description: string;
  }[];
  consistencyScore: number;
  dataCompleteness: number; // e.g. 72%
  metricBreakdown?: {
    workoutsScore: number;
    activityScore: number;
    hydrationScore: number;
    habitsScore: number;
    recoveryScore: number;
  };
  createdAt: string;
}

export interface AIDailySummaryData {
  summary: string;
  positiveObservations: string[];
  areasToImprove: string[];
  suggestions: string[];
  confidence: 'low' | 'medium' | 'high';
  isEnoughData: boolean;
  score?: number;
  dataCompleteness?: number;
}


