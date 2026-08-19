import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  UserProfile,
  UserPersonalPlan,
  PlanPreferences,
  DailyCheckin,
  WeeklyReview,
  AIDailySummaryData,
  AIDailyInsight,
  MoodFeeling,
  EnergyLevel,
  MealItem,
  AINutritionInsightData,
} from '../types';

export interface NutritionAnalysisContext {
  profile: UserProfile;
  todayDate: string;
  todayMeals: MealItem[];
  weeklyMeals: MealItem[];
  categoriesFrequency: Record<string, number>;
  mealConsistency: {
    loggedDays: number;
    totalDays: number;
    breakfastCount: number;
    lunchCount: number;
    dinnerCount: number;
    snackCount: number;
  };
}

export interface DailyAnalysisContext {
  profile: UserProfile;
  todayDate: string;
  todayWorkout?: any | null;
  recentWorkouts?: any[];
  todayActivity?: any;
  activityHistory?: any[];
  todayHydration?: any;
  hydrationHistory?: any[];
  habits?: any[];
  todaySleep?: any;
  sleepHistory?: any[];
  todayMeals?: any[];
  todayCheckin?: DailyCheckin | null;
  yesterdayStats?: any;
  activePlan?: UserPersonalPlan | null;
  todayPlanDayTasks?: any[];
}

export interface WeeklyAnalysisContext {
  profile: UserProfile;
  weekStartDate: string;
  weekEndDate: string;
  workoutsThisWeek: any[];
  activityThisWeek: any[];
  hydrationThisWeek: any[];
  habits: any[];
  sleepThisWeek: any[];
  checkinsThisWeek: DailyCheckin[];
  activePlan?: UserPersonalPlan | null;
}

// ----------------------------------------------------
// 1. FIRESTORE OPERATIONS FOR CHECKINS & REVIEWS
// ----------------------------------------------------

export async function saveDailyCheckin(
  userId: string,
  date: string,
  checkinData: {
    mood: MoodFeeling;
    energy?: EnergyLevel;
    note?: string;
  }
): Promise<DailyCheckin> {
  const docRef = doc(db, 'users', userId, 'dailyCheckins', date);
  const record: DailyCheckin = {
    id: date,
    userId,
    date,
    mood: checkinData.mood,
    energy: checkinData.energy || (checkinData.mood === 'tired' ? 'exhausted' : checkinData.mood === 'low' ? 'low' : 'medium'),
    note: checkinData.note || '',
    createdAt: new Date().toISOString(),
  };

  await setDoc(docRef, record, { merge: true });
  return record;
}

export async function getDailyCheckin(
  userId: string,
  date: string
): Promise<DailyCheckin | null> {
  try {
    const docRef = doc(db, 'users', userId, 'dailyCheckins', date);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as DailyCheckin;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching daily check-in:', err);
    return null;
  }
}

export function subscribeToDailyCheckin(
  userId: string,
  date: string,
  onData: (checkin: DailyCheckin | null) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'users', userId, 'dailyCheckins', date);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as DailyCheckin);
      } else {
        onData(null);
      }
    },
    (err) => {
      console.warn('Checkin subscription warning:', err);
      onError?.(err);
    }
  );
}

export async function saveWeeklyReview(
  userId: string,
  review: WeeklyReview
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'weeklyReviews', review.id);
  await setDoc(docRef, review, { merge: true });
}

export function subscribeToWeeklyReviews(
  userId: string,
  onData: (reviews: WeeklyReview[]) => void,
  onError?: (err: Error) => void
) {
  const collRef = collection(db, 'users', userId, 'weeklyReviews');
  const q = query(collRef, orderBy('weekStartDate', 'desc'), limit(12));

  return onSnapshot(
    q,
    (snap) => {
      const list: WeeklyReview[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as WeeklyReview);
      });
      onData(list);
    },
    (err) => {
      console.warn('Weekly reviews subscription warning:', err);
      onError?.(err);
    }
  );
}

// ----------------------------------------------------
// 2. AI INTELLIGENCE SERVICE CLIENT METHODS
// ----------------------------------------------------

/**
 * Generate a short, context-aware Daily AI Insight for Home dashboard
 */
export async function generateDailyInsight(
  context: DailyAnalysisContext
): Promise<AIDailyInsight> {
  try {
    const payload = sanitizeDailyContext(context);
    const response = await fetch('/api/gemini/daily-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Daily insight failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      headline: data.headline || "Today's Insight",
      message: data.message || "Stay consistent with your daily routine and keep listening to your body.",
      suggestion: data.suggestion || "Take a brisk 10-minute walk or hydrate with fresh water.",
      confidence: data.confidence || 'medium',
      isEnoughData: data.isEnoughData ?? true,
    };
  } catch (error) {
    console.warn('Error generating daily insight, using deterministic fallback:', error);
    return createFallbackInsight(context);
  }
}

/**
 * Generate comprehensive AI Daily Summary
 */
export async function generateDailySummary(
  context: DailyAnalysisContext
): Promise<AIDailySummaryData> {
  try {
    const payload = sanitizeDailyContext(context);
    const response = await fetch('/api/gemini/daily-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Daily summary failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      summary: data.summary || 'Nice daily progress logged across your wellness pillars.',
      positiveObservations: Array.isArray(data.positiveObservations)
        ? data.positiveObservations
        : ['Consistent tracking builds long-term success.'],
      areasToImprove: Array.isArray(data.areasToImprove) ? data.areasToImprove : [],
      suggestions: Array.isArray(data.suggestions)
        ? data.suggestions
        : ['Keep an eye on your water intake as the day winds down.'],
      confidence: data.confidence || 'medium',
      isEnoughData: data.isEnoughData ?? true,
      score: data.score ?? 80,
      dataCompleteness: data.dataCompleteness ?? 70,
    };
  } catch (error) {
    console.warn('Error generating daily summary, using deterministic fallback:', error);
    return createFallbackSummary(context);
  }
}

/**
 * Generate weekly review reflection and consistency score
 */
export async function generateWeeklyReview(
  context: WeeklyAnalysisContext
): Promise<WeeklyReview> {
  try {
    const payload = sanitizeWeeklyContext(context);
    const response = await fetch('/api/gemini/weekly-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Weekly review failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      id: `review-${context.weekStartDate}`,
      userId: context.profile.id,
      weekStartDate: context.weekStartDate,
      weekEndDate: context.weekEndDate,
      summary: data.summary || 'You maintained positive habits and workouts across the week.',
      strongestHabit: data.strongestHabit || 'Workout Consistency',
      areaToImprove: data.areaToImprove || 'Hydration Frequency',
      whatWentWell: Array.isArray(data.whatWentWell)
        ? data.whatWentWell
        : [
            { title: 'Workout Consistency', icon: '🏋️', description: 'Showed up for planned sessions.' },
            { title: 'Activity', icon: '🚶', description: 'Stayed active and moved daily.' },
            { title: 'Hydration', icon: '💧', description: 'Tracked daily fluids.' },
            { title: 'Habits', icon: '✅', description: 'Maintained core wellness anchors.' },
          ],
      consistencyScore: Number(data.consistencyScore) || 82,
      dataCompleteness: Number(data.dataCompleteness) || 75,
      metricBreakdown: data.metricBreakdown,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Error generating weekly review, using deterministic calculation:', error);
    return createFallbackWeeklyReview(context);
  }
}

/**
 * Adapt user's active plan based on missed task or fatigue
 */
export async function adaptPlan(
  currentPlan: UserPersonalPlan,
  missedDay: string,
  missedType: string,
  userNote?: string,
  recentStats?: any
): Promise<{ adjustmentMessage: string; tip: string; adaptedPlan: UserPersonalPlan }> {
  try {
    const response = await fetch('/api/gemini/adapt-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPlan, missedDay, missedType, userNote, recentStats }),
    });

    if (!response.ok) {
      throw new Error('Failed to adapt plan');
    }

    return await response.json();
  } catch (error) {
    console.warn('Error adapting plan with Gemini, using safe local adaptation:', error);
    return {
      adjustmentMessage: `That's okay. Missing a ${missedType || 'session'} is completely normal. Let's continue today with a balanced rhythm rather than doubling workouts.`,
      tip: 'Focus on your hydration target and a light 15-minute walk to reset.',
      adaptedPlan: currentPlan,
    };
  }
}

/**
 * Generate brand new personal plan
 */
export async function generatePlan(
  preferences: PlanPreferences,
  profile: UserProfile
): Promise<UserPersonalPlan> {
  const response = await fetch('/api/gemini/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferences, profile }),
  });

  if (!response.ok) {
    throw new Error(`AI Plan generation failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!data.plan || !Array.isArray(data.plan.days) || data.plan.days.length !== 7) {
    throw new Error('Received invalid plan structure from server');
  }

  return data.plan;
}

/**
 * AI Coach Interactive Chat
 */
export async function answerCoachQuestion(
  messages: Array<{ id: string; sender: 'user' | 'bot'; text: string; timestamp?: string }>,
  userContext: any
): Promise<{ reply: string; source?: string }> {
  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, userContext }),
  });

  if (!response.ok) {
    throw new Error(`Coach chat failed with status ${response.status}`);
  }

  return await response.json();
}

// ----------------------------------------------------
// 3. PRIVACY SANITIZATION & SAFE DETERMINISTIC FALLBACKS
// ----------------------------------------------------

function sanitizeDailyContext(ctx: DailyAnalysisContext) {
  // Only send minimal metrics, never private credentials
  const steps = ctx.todayActivity?.steps || 0;
  const activeMin = ctx.todayActivity?.activeMinutes || 0;
  const waterMl = ctx.todayHydration?.waterMl || 0;
  const waterGoal = ctx.todayHydration?.goalMl || ctx.profile.waterGoalMl || 2500;
  const workoutDone = ctx.todayWorkout ? true : false;
  const workoutTitle = ctx.todayWorkout?.title || null;
  const workoutDuration = ctx.todayWorkout?.durationMinutes || 0;
  const sleepHours = ctx.todaySleep?.durationMinutes ? Number((ctx.todaySleep.durationMinutes / 60).toFixed(1)) : null;
  const mealCount = Array.isArray(ctx.todayMeals) ? ctx.todayMeals.length : 0;
  
  const habitsDone = (ctx.habits || []).filter((h: any) =>
    Array.isArray(h.completedDates) && h.completedDates.includes(ctx.todayDate)
  ).length;
  const habitsTotal = (ctx.habits || []).length;

  const planTasks = ctx.todayPlanDayTasks || [];
  const planCompleted = planTasks.filter((t: any) => t.completed).length;
  const planTotal = planTasks.length;

  return {
    name: ctx.profile.name?.split(' ')[0] || 'Friend',
    todayDate: ctx.todayDate,
    steps,
    activeMin,
    waterMl,
    waterGoal,
    workoutDone,
    workoutTitle,
    workoutDuration,
    sleepHours,
    mealCount,
    habitsDone,
    habitsTotal,
    planCompleted,
    planTotal,
    checkin: ctx.todayCheckin
      ? {
          mood: ctx.todayCheckin.mood,
          energy: ctx.todayCheckin.energy,
          note: ctx.todayCheckin.note,
        }
      : null,
    recentWorkoutsCount: ctx.recentWorkouts?.length || 0,
    yesterdaySteps: ctx.yesterdayStats?.steps || null,
  };
}

function sanitizeWeeklyContext(ctx: WeeklyAnalysisContext) {
  const totalWorkouts = ctx.workoutsThisWeek?.length || 0;
  const totalSteps = ctx.activityThisWeek?.reduce((acc: number, d: any) => acc + (d.steps || 0), 0) || 0;
  const avgSteps = ctx.activityThisWeek?.length ? Math.round(totalSteps / ctx.activityThisWeek.length) : 0;
  const totalWaterMl = ctx.hydrationThisWeek?.reduce((acc: number, d: any) => acc + (d.waterMl || 0), 0) || 0;
  const avgWaterMl = ctx.hydrationThisWeek?.length ? Math.round(totalWaterMl / ctx.hydrationThisWeek.length) : 0;
  
  const totalSleepMinutes = ctx.sleepThisWeek?.reduce((acc: number, d: any) => acc + (d.durationMinutes || 0), 0) || 0;
  const avgSleepHours = ctx.sleepThisWeek?.length ? Number((totalSleepMinutes / ctx.sleepThisWeek.length / 60).toFixed(1)) : 0;

  const checkins = (ctx.checkinsThisWeek || []).map((c) => ({
    date: c.date,
    mood: c.mood,
    energy: c.energy,
  }));

  return {
    name: ctx.profile.name?.split(' ')[0] || 'Friend',
    weekStartDate: ctx.weekStartDate,
    weekEndDate: ctx.weekEndDate,
    totalWorkouts,
    avgSteps,
    avgWaterMl,
    waterGoal: ctx.profile.waterGoalMl || 2500,
    avgSleepHours,
    habitsCount: ctx.habits?.length || 0,
    checkins,
    planTitle: ctx.activePlan?.title || 'Personal Wellness Plan',
  };
}

function createFallbackInsight(ctx: DailyAnalysisContext): AIDailyInsight {
  const steps = ctx.todayActivity?.steps || 0;
  const water = ctx.todayHydration?.waterMl || 0;
  const hasWorkout = !!ctx.todayWorkout;
  const feeling = ctx.todayCheckin?.mood;

  if (feeling === 'low' || feeling === 'tired') {
    return {
      headline: "Today's Insight",
      message: "You reported feeling a bit tired today. Prioritize gentle recovery, hydrate well, and consider keeping physical exertion light.",
      suggestion: "Take a relaxed 10-minute walk or do a soothing restorative stretch before bed.",
      confidence: 'high',
      isEnoughData: true,
    };
  }

  if (steps === 0 && water === 0 && !hasWorkout) {
    return {
      headline: "Today's Insight",
      message: "Not enough data yet for today. Log your first activity, hydration, or habit to receive personalized coaching insights.",
      suggestion: "Drink a 350ml glass of water or log a quick morning walk.",
      confidence: 'low',
      isEnoughData: false,
    };
  }

  if (hasWorkout) {
    return {
      headline: "Today's Insight",
      message: `Nice consistency today! You completed your workout (${ctx.todayWorkout.title}) and kept active. Make sure to hydrate to support recovery.`,
      suggestion: "Sip an extra glass of water and enjoy a nutritious meal.",
      confidence: 'high',
      isEnoughData: true,
    };
  }

  return {
    headline: "Today's Insight",
    message: `You've logged ${steps.toLocaleString()} steps and ${(water / 1000).toFixed(1)}L of water. Steady pacing throughout the day builds lasting habits.`,
    suggestion: "Keep a water bottle nearby and check off your remaining daily habits.",
    confidence: 'medium',
    isEnoughData: true,
  };
}

function createFallbackSummary(ctx: DailyAnalysisContext): AIDailySummaryData {
  const steps = ctx.todayActivity?.steps || 0;
  const water = ctx.todayHydration?.waterMl || 0;
  const hasWorkout = !!ctx.todayWorkout;
  const sleepMin = ctx.todaySleep?.durationMinutes || 0;
  const mealCount = ctx.todayMeals?.length || 0;
  const feeling = ctx.todayCheckin?.mood;

  const dataPoints = (steps > 0 ? 1 : 0) + (water > 0 ? 1 : 0) + (hasWorkout ? 1 : 0) + (sleepMin > 0 ? 1 : 0) + (mealCount > 0 ? 1 : 0);
  const dataCompleteness = Math.min(100, Math.round((dataPoints / 5) * 100));

  if (dataPoints === 0) {
    return {
      summary: 'Not enough data yet.',
      positiveObservations: [],
      areasToImprove: [],
      suggestions: ['Start by logging your morning hydration, steps, or daily habit.'],
      confidence: 'low',
      isEnoughData: false,
      score: 50,
      dataCompleteness: 10,
    };
  }

  const positiveObservations: string[] = [];
  const areasToImprove: string[] = [];
  const suggestions: string[] = [];

  if (hasWorkout) {
    positiveObservations.push(`Completed workout: ${ctx.todayWorkout.title} (${ctx.todayWorkout.durationMinutes} min).`);
  }
  if (steps >= 5000) {
    positiveObservations.push(`Logged strong daily movement with ${steps.toLocaleString()} steps.`);
  } else if (steps > 0) {
    areasToImprove.push(`Movement is at ${steps.toLocaleString()} steps; a short afternoon walk could boost this.`);
  }

  if (water >= 1500) {
    positiveObservations.push(`Hydration is on track with ${(water / 1000).toFixed(1)}L logged.`);
  } else {
    areasToImprove.push(`Hydration is currently at ${(water / 1000).toFixed(1)}L; keep sipping fluids.`);
  }

  if (feeling === 'low' || feeling === 'tired') {
    positiveObservations.push('Listened to your body by logging your energy level and pacing yourself.');
    suggestions.push('Keep tonight’s routine relaxing with a warm shower and an early bedtime.');
  } else {
    suggestions.push('Keep momentum going by ticking off your remaining habit checklist.');
  }

  const summary = feeling === 'tired' || feeling === 'low'
    ? "You've had a busy routine recently. Today's balance focused on mindful movement and rest."
    : "Solid daily engagement across your tracked wellness pillars. Keep building momentum step by step.";

  return {
    summary,
    positiveObservations,
    areasToImprove,
    suggestions,
    confidence: dataCompleteness > 50 ? 'high' : 'medium',
    isEnoughData: true,
    score: Math.min(95, 60 + dataPoints * 7),
    dataCompleteness,
  };
}

function createFallbackWeeklyReview(ctx: WeeklyAnalysisContext): WeeklyReview {
  const totalWorkouts = ctx.workoutsThisWeek?.length || 0;
  const totalSteps = ctx.activityThisWeek?.reduce((acc: number, d: any) => acc + (d.steps || 0), 0) || 0;
  const avgSteps = ctx.activityThisWeek?.length ? Math.round(totalSteps / ctx.activityThisWeek.length) : 0;
  const totalWater = ctx.hydrationThisWeek?.reduce((acc: number, d: any) => acc + (d.waterMl || 0), 0) || 0;
  const avgWater = ctx.hydrationThisWeek?.length ? Math.round(totalWater / ctx.hydrationThisWeek.length) : 0;

  let loggedDaysCount = new Set([
    ...(ctx.workoutsThisWeek || []).map((w: any) => w.date),
    ...(ctx.activityThisWeek || []).map((a: any) => a.date),
    ...(ctx.hydrationThisWeek || []).map((h: any) => h.date),
  ]).size;

  const dataCompleteness = Math.min(100, Math.round((loggedDaysCount / 7) * 85) + 15);
  const consistencyScore = Math.min(96, Math.max(55, Math.round((totalWorkouts >= 2 ? 30 : 15) + (avgSteps > 4000 ? 30 : 15) + (avgWater > 1500 ? 25 : 10) + 10)));

  return {
    id: `review-${ctx.weekStartDate}`,
    userId: ctx.profile.id,
    weekStartDate: ctx.weekStartDate,
    weekEndDate: ctx.weekEndDate,
    summary: `You logged ${totalWorkouts} workout session(s) and averaged ${avgSteps.toLocaleString()} steps per active day. Your routine is developing positive consistency.`,
    strongestHabit: totalWorkouts >= 2 ? 'Workout Consistency' : 'Daily Movement',
    areaToImprove: avgWater < 2000 ? 'Hydration Consistency' : 'Sleep Wind-Down Routine',
    whatWentWell: [
      { title: 'Workout Consistency', icon: '🏋️', description: `${totalWorkouts} session(s) completed.` },
      { title: 'Activity', icon: '🚶', description: `Average ${avgSteps.toLocaleString()} daily steps.` },
      { title: 'Hydration', icon: '💧', description: `Average ${(avgWater / 1000).toFixed(1)}L per tracked day.` },
      { title: 'Habits', icon: '✅', description: 'Maintained core daily wellness anchors.' },
    ],
    consistencyScore,
    dataCompleteness,
    metricBreakdown: {
      workoutsScore: Math.min(100, totalWorkouts * 33),
      activityScore: Math.min(100, Math.round((avgSteps / 8000) * 100)),
      hydrationScore: Math.min(100, Math.round((avgWater / (ctx.profile.waterGoalMl || 2500)) * 100)),
      habitsScore: 80,
      recoveryScore: 75,
    },
    createdAt: new Date().toISOString(),
  };
}

// ----------------------------------------------------
// NUTRITION AI INSIGHT WITH CACHING
// ----------------------------------------------------
const nutritionInsightCache = new Map<string, { data: AINutritionInsightData; timestamp: number }>();

export async function generateNutritionInsight(
  ctx: NutritionAnalysisContext,
  forceRefresh = false
): Promise<AINutritionInsightData> {
  const cacheKey = `${ctx.profile.id}-${ctx.todayDate}-${ctx.todayMeals.length}-${ctx.weeklyMeals.length}`;
  const now = Date.now();
  const cached = nutritionInsightCache.get(cacheKey);

  if (!forceRefresh && cached && now - cached.timestamp < 5 * 60 * 1000) {
    return cached.data;
  }

  const totalMeals = ctx.weeklyMeals.length > 0 ? ctx.weeklyMeals.length : ctx.todayMeals.length;

  if (totalMeals === 0) {
    const emptyResult: AINutritionInsightData = {
      headline: 'Nutrition Insights',
      message: "Keep logging meals and I'll be able to identify patterns over time.",
      suggestions: [
        'Log your breakfast, lunch, or snack to start tracking your food variety.',
        'Focus on mindful nourishment with steady energy throughout the day.',
      ],
      categoriesLogged: [],
      consistencySummary: `${ctx.todayMeals.length} / 4 meals logged today`,
      isEnoughData: false,
      confidence: 'low',
      timestamp: new Date().toISOString(),
    };
    nutritionInsightCache.set(cacheKey, { data: emptyResult, timestamp: now });
    return emptyResult;
  }

  try {
    const response = await fetch('/api/gemini/nutrition-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: ctx.profile.name || 'Friend',
        todayMeals: ctx.todayMeals,
        weeklyMeals: ctx.weeklyMeals,
        categoriesFrequency: ctx.categoriesFrequency,
        mealConsistency: ctx.mealConsistency,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const result: AINutritionInsightData = {
        headline: data.headline || 'Balanced Nutrition Insight',
        message: data.message,
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : ['Aim for colorful food variety across your day.'],
        categoriesLogged: Array.isArray(data.categoriesLogged) ? data.categoriesLogged : Object.keys(ctx.categoriesFrequency),
        consistencySummary: data.consistencySummary || `${ctx.todayMeals.length} / 4 meals logged today`,
        isEnoughData: data.isEnoughData ?? true,
        confidence: data.confidence || 'high',
        timestamp: new Date().toISOString(),
      };
      nutritionInsightCache.set(cacheKey, { data: result, timestamp: now });
      return result;
    }
  } catch (err) {
    console.warn('Nutrition insight API error, using fallback:', err);
  }

  const fallback = createFallbackNutritionInsight(ctx);
  nutritionInsightCache.set(cacheKey, { data: fallback, timestamp: now });
  return fallback;
}

function createFallbackNutritionInsight(ctx: NutritionAnalysisContext): AINutritionInsightData {
  const loggedCats = Object.keys(ctx.categoriesFrequency).filter(
    (k) => (ctx.categoriesFrequency[k] || 0) > 0
  );
  const total = ctx.weeklyMeals.length > 0 ? ctx.weeklyMeals.length : ctx.todayMeals.length;

  const hasVeggies = loggedCats.includes('vegetables');
  const hasProtein = loggedCats.includes('protein');

  const suggestions: string[] = [];
  if (!hasVeggies) {
    suggestions.push('Add a serving of vegetables or leafy greens to your next meal.');
  } else {
    suggestions.push('Great job including nutrient-rich vegetables in your recent meals!');
  }
  if (!hasProtein) {
    suggestions.push('Include a protein source (such as eggs, tofu, fish, or legumes) to support steady muscle recovery.');
  } else {
    suggestions.push('Consistent protein intake supports steady satiety and muscle recovery.');
  }

  return {
    headline: 'Balanced Nutrition Insight',
    message:
      total >= 3
        ? `You've been logging meals consistently. Your entries reflect positive food variety with ${
            loggedCats.length > 0 ? loggedCats.join(', ') : 'balanced meals'
          } supporting your daily energy.`
        : `You've logged ${total} meal(s) so far. Keep logging your daily meals to build a clear picture of your food group variety and steady nourishment.`,
    suggestions,
    categoriesLogged: loggedCats,
    consistencySummary: `${ctx.todayMeals.length} / 4 meals logged today`,
    isEnoughData: total > 0,
    confidence: 'medium',
    timestamp: new Date().toISOString(),
  };
}
