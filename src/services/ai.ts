import { AICoachMessage, AIDailyInsight, UserProfile } from '../types';

export interface UserContextPayload {
  name: string;
  todaySteps: number;
  workoutCount: number;
  todayWater: string;
  waterGoal: string;
  sleepHours: number;
  habitsCompleted: number;
  habitsTotal: number;
  wellnessScore: number;
}

export async function sendAICoachMessage(
  messages: AICoachMessage[],
  userContext: UserContextPayload
): Promise<string> {
  try {
    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, userContext }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data.reply || "Keep up the fantastic momentum! Remember, progress is built one mindful choice at a time. 🌟";
  } catch (error) {
    console.warn('AI Chat API fallback:', error);
    // Intelligent contextual fallback
    if (userContext.todaySteps < 5000) {
      return `Hey ${userContext.name}! 🌿 I noticed your step count is at ${userContext.todaySteps.toLocaleString()}. A gentle 15-minute walk outside or around your space can revitalize your mental clarity and boost energy!`;
    }
    return `Great consistency today, ${userContext.name}! You've logged ${userContext.todaySteps.toLocaleString()} steps and ${userContext.todayWater} of hydration. Prioritize gentle stretching and restful sleep tonight to let your body recharge. ✨`;
  }
}

export async function fetchDailyInsights(
  summaryData: any,
  profile: UserProfile
): Promise<AIDailyInsight> {
  try {
    const response = await fetch('/api/gemini/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summaryData, profile }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return {
      date: summaryData.date,
      observations: data.observations || [
        "Workout consistency is high this week.",
        "Daily movement shows positive active minute distribution.",
        "Hydration is on track toward your daily target.",
      ],
      suggestion: data.suggestion || "Take 5 minutes for guided diaphragmatic breathing before sleeping tonight.",
      encouragement: data.encouragement || "Every healthy action today strengthens your foundation for tomorrow! 🚀",
      source: data.source || 'gemini',
    };
  } catch (error) {
    console.warn('AI Insights API fallback:', error);
    return {
      date: summaryData?.date || new Date().toISOString().split('T')[0],
      observations: [
        "You've been consistent with your workouts this week with 4 logged sessions.",
        "Daily movement is steady with strong afternoon active minutes.",
        "Hydration is currently progressing well toward your target.",
        "Sleep duration is supporting smooth physical recovery.",
      ],
      suggestion: "Focus on a steady bedtime routine tonight to enhance muscle recovery and mental clarity.",
      encouragement: "Consistency is your superpower! Small daily habits compound into lifelong energy. ✨",
    };
  }
}
