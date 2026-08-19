import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily / safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

const COACH_SYSTEM_PROMPT = `You are FitFlow Coach 🤖, an encouraging, empathetic, and evidence-informed personal wellness & fitness companion.
Core Safety, Nutrition, and Coaching Principles:
1. ONLY analyze actual user data provided. Never invent, hallucinate, or fabricate missing stats or numbers.
2. If data is sparse or missing, explicitly say "Not enough data yet." or "I don't have enough tracked data to answer that yet."
3. If the user reports feeling tired, exhausted, or low energy, ALWAYS respond supportively (e.g. recommend keeping movement lighter, prioritizing recovery, and resting).
4. NEVER diagnose medical conditions, prescribe medication, or give clinical medical advice.
5. NEVER tell the user to push through physical pain, injury, illness, or severe exhaustion.
6. NEVER shame users for missed workouts, meals, or habits. NEVER use negative words like "You failed". Instead say: "That's okay. Let's continue today."
7. NUTRITION SAFETY DIRECTIVES:
   - Base nutrition feedback strictly on meal consistency, variety of food groups (vegetables, fruits, proteins, whole grains, healthy fats, dairy, fluids), and mindful nourishment.
   - ABSOLUTELY NEVER provide calorie restriction targets, starvation advice, meal skipping instructions, aggressive weight-loss plans, or body-fat targets.
   - For all users and teens, keep nutrition guidance general, balanced, positive, and supportive. Focus on energy, fuel, and variety.
8. NEVER base scores or feedback on body weight, body fat %, appearance, or calorie restriction. Base consistency purely on workouts, movement, hydration, habits, meals, and recovery.
9. When adapting plans after a missed task, suggest balanced adjustments without doubling workouts or stacking excessive loads.
10. Keep responses structured, concise, friendly, and actionable.`;

function generateSmartCoachReply(userMessage: string, userContext: any): string {
  const msgLower = (userMessage || "").toLowerCase();
  const name = userContext?.name || "Friend";
  const steps = userContext?.todaySteps ?? 0;
  const water = userContext?.todayWater ?? "0L";
  const waterGoal = userContext?.waterGoal ?? "2.5L";
  const workouts = userContext?.workoutCount ?? 0;
  const sleep = userContext?.sleepHours ?? 0;
  const habitsDone = userContext?.habitsCompleted ?? 0;
  const habitsTotal = userContext?.habitsTotal ?? 0;
  const score = userContext?.wellnessScore ?? 75;
  const feeling = userContext?.checkinFeeling || userContext?.mood;

  const todayMeals = Array.isArray(userContext?.todayMeals) ? userContext.todayMeals : [];
  const weeklyMeals = Array.isArray(userContext?.weeklyMeals) ? userContext.weeklyMeals : [];
  const foodGroups = Array.isArray(userContext?.foodGroups) ? userContext.foodGroups : [];

  // 1. If user asks about meals logged this week
  if (
    msgLower.includes("what meals have i logged") ||
    msgLower.includes("meals this week") ||
    msgLower.includes("my meals") ||
    msgLower.includes("what did i eat")
  ) {
    const mealList = weeklyMeals.length > 0 ? weeklyMeals : todayMeals;
    if (mealList.length === 0) {
      return `I don't have enough tracked meal data to answer that yet, ${name}. Once you log a meal in the **Today's Nutrition** tab, I'll keep an accurate summary for you! 🍎`;
    }
    const recentSummary = mealList
      .slice(0, 6)
      .map((m: any) => `• **${m.mealType ? m.mealType.toUpperCase() : 'MEAL'}:** ${m.name || m.description || 'Meal'} (${m.time || m.date || 'logged'})`)
      .join("\n");
    return `Here are the meals you have logged recently, ${name}: 🥗\n\n${recentSummary}\n\n*Total logged:* ${mealList.length} meal(s). Keep up the mindful nourishment! ✨`;
  }

  // 2. If user asks about meal tracking consistency
  if (
    msgLower.includes("consistent have i been with meal") ||
    msgLower.includes("meal consistency") ||
    msgLower.includes("meal tracking consistency") ||
    msgLower.includes("food tracking consistency")
  ) {
    if (weeklyMeals.length === 0 && todayMeals.length === 0) {
      return `You haven't logged any meals yet this week, ${name}. You can start by logging your breakfast or lunch in the Nutrition tracker! 🍳`;
    }
    const daysWithMeals = new Set(weeklyMeals.map((m: any) => m.date)).size;
    return `Here is your meal consistency breakdown, ${name}: 📊\n- **Today's Logged Meals:** ${todayMeals.length} meal(s) logged\n- **Weekly Active Days:** Logged meals on ${daysWithMeals || 1} day(s) this week\n- **Total Meals Logged:** ${weeklyMeals.length || todayMeals.length}\n\nYou're building a consistent, mindful meal-tracking habit without any calorie restriction or pressure! 🌟`;
  }

  // 3. If user asks what food groups / categories have been logged
  if (
    msgLower.includes("what food groups") ||
    msgLower.includes("categories have i been logging") ||
    msgLower.includes("food categories") ||
    msgLower.includes("variety of food")
  ) {
    const allCategories = new Set<string>();
    (weeklyMeals.length > 0 ? weeklyMeals : todayMeals).forEach((m: any) => {
      if (Array.isArray(m.categories)) {
        m.categories.forEach((c: string) => allCategories.add(c));
      }
    });
    if (allCategories.size === 0) {
      return `I don't have enough food group tags logged yet, ${name}. When adding meals, tag groups like 🥦 Vegetables, 🍎 Fruits, 🍗 Protein, or 🌾 Whole Grains to see your variety breakdown!`;
    }
    const formatted = Array.from(allCategories)
      .map((c) => `• ${c.replace("_", " ")}`)
      .join("\n");
    return `Here are the food groups you've included in your logged meals, ${name}: 🥦\n\n${formatted}\n\nAiming for colorful variety across the week gives your body diverse micronutrients and steady vitality! 🌈`;
  }

  // 4. If user asks what to focus on for balanced meals
  if (
    msgLower.includes("focus on for balanced meals") ||
    msgLower.includes("balanced meals") ||
    msgLower.includes("healthy meal advice") ||
    msgLower.includes("nutrition advice")
  ) {
    return `For balanced, energizing meals, ${name}, aim for simple and sustainable anchors: 🍽️\n1. 🥦 **Color & Fiber:** Add a serving of vegetables or fruits to your plate.\n2. 🍗 **Protein Anchor:** Include protein-rich sources (like eggs, legumes, tofu, fish, or chicken) to support muscle recovery.\n3. 🌾 **Sustained Energy:** Choose whole grains (like oats, brown rice, or quinoa) to fuel your day.\n4. 💧 **Hydration:** Pair your meal with a refreshing glass of water.\n\n*Note:* FitFlow AI avoids restrictive diets or calorie targets, focusing purely on nourishment and consistent energy! ✨`;
  }

  // 5. If user asks how did I do today
  if (msgLower.includes("how did i do today") || msgLower.includes("today's progress") || msgLower.includes("today summary")) {
    if (steps === 0 && workouts === 0 && (!water || water === "0L") && todayMeals.length === 0) {
      return `I don't have enough tracked data to answer that yet for today, ${name}. Log your activity, water, meals, or workout and I'll give you a detailed breakdown! ✨`;
    }
    return `Here is your summary for today, ${name}! 🌟
- **Movement:** ${typeof steps === "number" ? steps.toLocaleString() : steps} steps
- **Hydration:** ${water} (Goal: ${waterGoal})
- **Meals Logged:** ${todayMeals.length} meal(s) logged
- **Habits:** ${habitsDone}/${habitsTotal} completed
- **Workout:** ${workouts > 0 ? `${workouts} session completed ✓` : "Rest / Active recovery day"}
${feeling ? `- **How you're feeling:** ${feeling}` : ""}

${feeling === "low" || feeling === "tired" ? "Since you're feeling a bit low on energy today, prioritize good sleep and hydration tonight!" : "Great job showing up today—every small step compounds!"} 💪`;
  }

  // 6. If user asks how consistent have I been or weekly progress
  if (msgLower.includes("consistent") || msgLower.includes("weekly score") || msgLower.includes("what did i complete this week") || msgLower.includes("workout progress")) {
    return `Here is your current consistency breakdown, ${name}: 📊
- **Consistency Score:** **${score}/100**
- **Workouts Logged:** ${workouts} session(s) this week
- **Daily Step Average:** ~${typeof steps === "number" ? steps.toLocaleString() : steps} steps
- **Meals Logged:** ${weeklyMeals.length || todayMeals.length} meal entries this week
- **Daily Habits:** ${habitsDone}/${habitsTotal || 3} active today

*Why your score reflects this:* Your consistency score measures how regularly you log workouts, steps, water, meals, and rest—never weight or appearance. Keep taking small positive steps each day! 🎯`;
  }

  // 7. If user asks what to focus on tomorrow
  if (msgLower.includes("focus on tomorrow") || msgLower.includes("tomorrow's plan") || msgLower.includes("what should i do tomorrow")) {
    return `Here are your core anchors to focus on tomorrow, ${name}: 🎯
1. 💧 **Hydration:** Start the morning with a full 350ml glass of water.
2. 🥗 **Balanced Breakfast:** Fuel up with grains, fruit, and protein.
3. 🚶 **Movement:** Hit a steady walking or mobility target.
4. 🧘 **Rest & Routine:** Set a wind-down alarm 30 minutes before sleep.

Take it one habit at a time! 🚀`;
  }

  if (feeling === "tired" || feeling === "low") {
    return `I hear you, ${name}. Since you're feeling ${feeling} today, remember that rest is just as important as training. Keep your activity gentle, stay well hydrated, enjoy a nourishing meal, and give yourself grace today. 🌿`;
  }

  // General supportive response
  return `Hey ${name}! 🌟 I'm keeping track of your progress:
- **Steps:** ${typeof steps === "number" ? steps.toLocaleString() : steps}
- **Hydration:** ${water} / ${waterGoal}
- **Meals Logged:** ${todayMeals.length} today (${weeklyMeals.length || todayMeals.length} this week)
- **Consistency Score:** ${score}/100

Feel free to ask me anything about your workout progress, meals, consistency, or tomorrow's routine! 💪✨`;
}

// AI Daily Insights Endpoint (Home Dashboard Card)
app.post("/api/gemini/daily-insight", async (req, res) => {
  const data = req.body;
  const name = data.name || "Friend";
  const steps = data.steps || 0;
  const waterMl = data.waterMl || 0;
  const waterGoal = data.waterGoal || 2500;
  const workoutDone = data.workoutDone;
  const workoutTitle = data.workoutTitle;
  const habitsDone = data.habitsDone || 0;
  const habitsTotal = data.habitsTotal || 0;
  const planCompleted = data.planCompleted || 0;
  const planTotal = data.planTotal || 0;
  const feeling = data.checkin?.mood;

  // Check if there is enough data
  const hasData = steps > 0 || waterMl > 0 || workoutDone || habitsDone > 0;

  if (!hasData) {
    return res.json({
      headline: "Today's Insight",
      message: "Not enough data yet for today. Start by logging your morning water, steps, or daily habit to unlock personalized insights.",
      suggestion: "Drink a tall 350ml glass of water to kick off your day.",
      confidence: "low",
      isEnoughData: false,
    });
  }

  try {
    const client = getGeminiClient();
    if (!client) {
      if (feeling === "low" || feeling === "tired") {
        return res.json({
          headline: "Today's Insight",
          message: "You reported feeling low energy today. Keep your activity light and prioritize recovery and restful sleep tonight.",
          suggestion: "Take a relaxed 10-minute walk and hydrate well.",
          confidence: "high",
          isEnoughData: true,
        });
      }
      return res.json({
        headline: "Today's Insight",
        message: workoutDone
          ? `Nice consistency today! You completed ${workoutTitle || "your workout"} and stayed active. Keep up the positive momentum.`
          : `You've logged ${steps.toLocaleString()} steps and ${(waterMl / 1000).toFixed(1)}L of water today. Solid progress towards your goals.`,
        suggestion: "Keep a water bottle nearby and finish your remaining daily habits.",
        confidence: "medium",
        isEnoughData: true,
      });
    }

    const prompt = `Generate a concise 2-sentence AI Insight card for a user's fitness home screen.
User Data:
- Name: ${name}
- Steps today: ${steps}
- Water: ${(waterMl / 1000).toFixed(1)}L / ${(waterGoal / 1000).toFixed(1)}L
- Workout completed today: ${workoutDone ? `Yes (${workoutTitle || "Workout"})` : "No / Rest day"}
- Habits completed: ${habitsDone}/${habitsTotal}
- Plan tasks completed: ${planCompleted}/${planTotal}
- Reported feeling / mood: ${feeling || "Not checked in"}

Requirements:
- Short (maximum 2 sentences).
- If feeling is 'low' or 'tired', be supportive and recommend gentle pacing/recovery.
- If user missed a planned task, do NOT say "You failed". Use positive reinforcement.
- Respond with a JSON object:
{
  "headline": "Today's Insight",
  "message": "...",
  "suggestion": "1 short action item"
}`;

    const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    for (const modelName of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: COACH_SYSTEM_PROMPT,
            responseMimeType: "application/json",
          },
        });
        if (response?.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed && parsed.message) {
            return res.json({
              headline: parsed.headline || "Today's Insight",
              message: parsed.message,
              suggestion: parsed.suggestion || "Stay hydrated and keep moving.",
              confidence: "high",
              isEnoughData: true,
            });
          }
        }
      } catch (err) {
        continue;
      }
    }
  } catch (error) {
    // fallback
  }

  res.json({
    headline: "Today's Insight",
    message: workoutDone
      ? `Nice consistency today. You completed your planned workout and stayed active. Your hydration is still being tracked, so keep building that habit.`
      : `Solid daily progress! You've logged ${steps.toLocaleString()} steps today. Keep checking off your habits.`,
    suggestion: "Drink a glass of water and enjoy your evening routine.",
    confidence: "medium",
    isEnoughData: true,
  });
});

// AI Daily Summary Endpoint (Detailed Analysis)
app.post("/api/gemini/daily-summary", async (req, res) => {
  const data = req.body;
  const name = data.name || "Friend";
  const steps = data.steps || 0;
  const waterMl = data.waterMl || 0;
  const waterGoal = data.waterGoal || 2500;
  const workoutDone = data.workoutDone;
  const workoutTitle = data.workoutTitle;
  const sleepHours = data.sleepHours;
  const mealCount = data.mealCount || 0;
  const habitsDone = data.habitsDone || 0;
  const habitsTotal = data.habitsTotal || 0;
  const feeling = data.checkin?.mood;

  const dataPoints = (steps > 0 ? 1 : 0) + (waterMl > 0 ? 1 : 0) + (workoutDone ? 1 : 0) + (sleepHours ? 1 : 0) + (mealCount > 0 ? 1 : 0);
  const dataCompleteness = Math.min(100, Math.round((dataPoints / 5) * 100));

  if (dataPoints === 0) {
    return res.json({
      isEnoughData: false,
      summary: "Not enough data yet.",
      positiveObservations: [],
      areasToImprove: [],
      suggestions: ["Log your first workout, steps, or hydration today to unlock detailed daily intelligence."],
      confidence: "low",
      score: 50,
      dataCompleteness: 10,
    });
  }

  try {
    const client = getGeminiClient();
    if (client) {
      const prompt = `Generate a structured AI Daily Summary for user ${name}.
Actual Data:
- Today's steps: ${steps}
- Today's hydration: ${(waterMl / 1000).toFixed(1)}L / ${(waterGoal / 1000).toFixed(1)}L
- Workout: ${workoutDone ? `Completed: ${workoutTitle || "Routine"}` : "None logged / Rest day"}
- Sleep: ${sleepHours ? `${sleepHours} hrs` : "Not logged"}
- Meals: ${mealCount > 0 ? `${mealCount} logged` : "Not logged"}
- Habits completed: ${habitsDone}/${habitsTotal}
- Mood / Feeling: ${feeling || "Not checked in"}
- Data completeness: ${dataCompleteness}%

Instructions:
- Base analysis ONLY on actual data above.
- If feeling is 'low' or 'tired', provide supportive guidance focused on rest and lighter pacing.
- Never use negative words like "You failed". If tasks were missed, say: "That's okay. Let's continue today."
- Never diagnose conditions or prescribe medications.
- Respond in JSON:
{
  "summary": "2-3 supportive sentences analyzing today's actual performance.",
  "positiveObservations": ["bullet 1", "bullet 2"],
  "areasToImprove": ["gentle area 1"],
  "suggestions": ["1-2 practical tips for evening or tomorrow"],
  "confidence": "high|medium|low",
  "score": 85
}`;

      const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      for (const modelName of candidateModels) {
        try {
          const response = await client.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction: COACH_SYSTEM_PROMPT,
              responseMimeType: "application/json",
            },
          });
          if (response?.text) {
            const parsed = JSON.parse(response.text.trim());
            if (parsed && parsed.summary) {
              return res.json({
                isEnoughData: true,
                summary: parsed.summary,
                positiveObservations: Array.isArray(parsed.positiveObservations) ? parsed.positiveObservations : ["Consistent tracking."],
                areasToImprove: Array.isArray(parsed.areasToImprove) ? parsed.areasToImprove : [],
                suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : ["Stay hydrated."],
                confidence: parsed.confidence || "high",
                score: parsed.score || 85,
                dataCompleteness,
              });
            }
          }
        } catch (err) {
          continue;
        }
      }
    }
  } catch (error) {
    // fallback
  }

  // Safe fallback
  res.json({
    isEnoughData: true,
    summary: feeling === "tired" || feeling === "low"
      ? "You've had a demanding schedule recently. Today's focus was on listening to your body and pacing yourself."
      : "You stayed consistent with your daily routine and made measurable progress across your wellness pillars.",
    positiveObservations: [
      workoutDone ? `Completed workout session: ${workoutTitle || "Scheduled Routine"}.` : `Logged active movement with ${steps.toLocaleString()} steps.`,
      `Hydration tracking active at ${(waterMl / 1000).toFixed(1)}L.`,
    ],
    areasToImprove: waterMl < waterGoal ? ["Hydration consistency throughout the afternoon."] : [],
    suggestions: ["Keep a steady evening wind-down routine to support natural recovery."],
    confidence: "medium",
    score: Math.min(95, 60 + dataPoints * 7),
    dataCompleteness,
  });
});

// AI Weekly Review Endpoint
app.post("/api/gemini/weekly-review", async (req, res) => {
  const data = req.body;
  const name = data.name || "Friend";
  const totalWorkouts = data.totalWorkouts || 0;
  const avgSteps = data.avgSteps || 0;
  const avgWaterMl = data.avgWaterMl || 0;
  const waterGoal = data.waterGoal || 2500;
  const avgSleepHours = data.avgSleepHours || 0;
  const habitsCount = data.habitsCount || 0;
  const checkins = data.checkins || [];

  const dataCompleteness = Math.min(100, Math.round(((totalWorkouts > 0 ? 1 : 0) + (avgSteps > 0 ? 1 : 0) + (avgWaterMl > 0 ? 1 : 0) + (avgSleepHours > 0 ? 1 : 0) + (checkins.length > 0 ? 1 : 0)) / 5 * 100));

  try {
    const client = getGeminiClient();
    if (client) {
      const prompt = `Generate a structured Weekly AI Review for ${name}.
Actual 7-day data:
- Workouts completed: ${totalWorkouts} sessions
- Average daily steps: ${avgSteps.toLocaleString()}
- Average daily hydration: ${(avgWaterMl / 1000).toFixed(1)}L (Goal: ${(waterGoal / 1000).toFixed(1)}L)
- Average sleep duration: ${avgSleepHours > 0 ? `${avgSleepHours} hrs` : "Not logged"}
- Active habits tracked: ${habitsCount}
- Check-ins logged: ${checkins.length} days
- Data completeness: ${dataCompleteness}%

Requirements:
- Calculate a transparent weekly consistency score (0-100) based strictly on workout consistency, activity, hydration logging, and habits.
- Do NOT base score on body weight, body fat, or calories.
- Highlight "What went well", "Strongest habit", "Area to improve", and "AI Summary".
- Respond in JSON:
{
  "summary": "Comprehensive 3-sentence summary of the week's consistency.",
  "strongestHabit": "e.g. Workout Consistency or Daily Movement",
  "areaToImprove": "e.g. Hydration logging or Sleep Routine",
  "whatWentWell": [
    { "title": "Workout consistency", "icon": "🏋️", "description": "..." },
    { "title": "Activity", "icon": "🚶", "description": "..." },
    { "title": "Hydration", "icon": "💧", "description": "..." },
    { "title": "Habits", "icon": "✅", "description": "..." }
  ],
  "consistencyScore": 84,
  "dataCompleteness": ${dataCompleteness},
  "metricBreakdown": {
    "workoutsScore": 85,
    "activityScore": 80,
    "hydrationScore": 75,
    "habitsScore": 90,
    "recoveryScore": 80
  }
}`;

      const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      for (const modelName of candidateModels) {
        try {
          const response = await client.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction: COACH_SYSTEM_PROMPT,
              responseMimeType: "application/json",
            },
          });
          if (response?.text) {
            const parsed = JSON.parse(response.text.trim());
            if (parsed && parsed.summary) {
              return res.json(parsed);
            }
          }
        } catch (err) {
          continue;
        }
      }
    }
  } catch (error) {
    // fallback
  }

  // Deterministic fallback
  const workoutsScore = Math.min(100, totalWorkouts * 33);
  const activityScore = Math.min(100, Math.round((avgSteps / 8000) * 100));
  const hydrationScore = Math.min(100, Math.round((avgWaterMl / waterGoal) * 100));
  const habitsScore = 80;
  const recoveryScore = 75;
  const consistencyScore = Math.round((workoutsScore * 0.3) + (activityScore * 0.25) + (hydrationScore * 0.2) + (habitsScore * 0.15) + (recoveryScore * 0.1));

  res.json({
    summary: `You stayed consistent with ${totalWorkouts} workout(s) this week and completed most of your planned habits. Your daily movement averaged ${avgSteps.toLocaleString()} steps.`,
    strongestHabit: totalWorkouts >= 2 ? "Workout consistency" : "Daily Movement",
    areaToImprove: avgWaterMl < 2000 ? "Hydration consistency" : "Sleep Wind-Down",
    whatWentWell: [
      { title: "Workout consistency", icon: "🏋️", description: `${totalWorkouts} session(s) completed.` },
      { title: "Activity", icon: "🚶", description: `Averaged ${avgSteps.toLocaleString()} daily steps.` },
      { title: "Hydration", icon: "💧", description: `Averaged ${(avgWaterMl / 1000).toFixed(1)}L per tracked day.` },
      { title: "Habits", icon: "✅", description: "Maintained core daily wellness anchors." },
    ],
    consistencyScore: Math.max(50, Math.min(98, consistencyScore || 78)),
    dataCompleteness,
    metricBreakdown: {
      workoutsScore,
      activityScore,
      hydrationScore,
      habitsScore,
      recoveryScore,
    },
  });
});

// AI Nutrition & Meal Pattern Insights Endpoint
app.post("/api/gemini/nutrition-insight", async (req, res) => {
  const data = req.body;
  const name = data.name || "Friend";
  const todayMeals = Array.isArray(data.todayMeals) ? data.todayMeals : [];
  const weeklyMeals = Array.isArray(data.weeklyMeals) ? data.weeklyMeals : [];
  const categoriesFrequency = data.categoriesFrequency || {};
  const mealConsistency = data.mealConsistency || { loggedDays: 0, breakfastCount: 0, lunchCount: 0, dinnerCount: 0, snackCount: 0 };

  const totalLogged = weeklyMeals.length > 0 ? weeklyMeals.length : todayMeals.length;

  // Check if there is enough data
  if (totalLogged === 0) {
    return res.json({
      headline: "Nutrition Insights",
      message: "Keep logging meals and I'll be able to identify patterns over time.",
      suggestions: [
        "Log your breakfast, lunch, dinner, or a snack to start tracking your food group variety.",
        "Aim for mindful meals with colorful vegetables and sustained protein.",
      ],
      categoriesLogged: [],
      consistencySummary: "0 / 4 meals logged today",
      isEnoughData: false,
      confidence: "low",
    });
  }

  // Categories present
  const loggedCats = Object.keys(categoriesFrequency).filter((k) => (categoriesFrequency[k] || 0) > 0);

  try {
    const client = getGeminiClient();
    if (client) {
      const prompt = `You are FitFlow AI Nutrition Coach. Analyze the user's logged meals and generate balanced food insights.
User: ${name}
- Today's meals logged: ${todayMeals.length} (${todayMeals.map((m: any) => `${m.mealType}: "${m.name || m.description}"`).join(", ") || "None yet"})
- Total meals this week: ${totalLogged}
- Food category breakdown: ${JSON.stringify(categoriesFrequency)}
- Meal timing/consistency breakdown: Breakfast (${mealConsistency.breakfastCount || 0}), Lunch (${mealConsistency.lunchCount || 0}), Dinner (${mealConsistency.dinnerCount || 0}), Snacks (${mealConsistency.snackCount || 0})

SAFETY & COACHING MANDATES:
1. ONLY analyze the actual meals and categories logged. Do NOT fabricate missing foods.
2. ABSOLUTELY NEVER provide calorie-deficit targets, calorie counts, starvation advice, meal skipping advice, or body-fat targets.
3. Highlight positive patterns: consistency of logging, variety of food groups (veggies, fruit, protein, whole grains, healthy fats, dairy, fluids).
4. Note gentle opportunities (e.g. "Consider adding a vegetable serving to dinner", or "You've been consistent with breakfast").
5. Return JSON:
{
  "headline": "Balanced Nutrition Insight",
  "message": "2-3 encouraging, insightful sentences discussing meal variety and consistency without calorie talk.",
  "suggestions": ["Actionable positive tip 1", "Actionable positive tip 2"],
  "categoriesLogged": ${JSON.stringify(loggedCats)},
  "consistencySummary": "${todayMeals.length} / 4 meals logged today",
  "confidence": "high"
}`;

      const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      for (const modelName of candidateModels) {
        try {
          const response = await client.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction: COACH_SYSTEM_PROMPT,
              responseMimeType: "application/json",
            },
          });
          if (response?.text) {
            const parsed = JSON.parse(response.text.trim());
            if (parsed && parsed.message) {
              return res.json({
                headline: parsed.headline || "Balanced Nutrition Insight",
                message: parsed.message,
                suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [
                  "Aim to include colorful veggies or fresh fruits with your meals.",
                  "Pair steady carbohydrates with quality protein sources for lasting energy.",
                ],
                categoriesLogged: loggedCats,
                consistencySummary: parsed.consistencySummary || `${todayMeals.length} / 4 meals logged today`,
                isEnoughData: true,
                confidence: parsed.confidence || "high",
              });
            }
          }
        } catch (err) {
          continue;
        }
      }
    }
  } catch (err) {
    // fallback
  }

  // Safe fallback
  const hasVeggies = loggedCats.includes("vegetables");
  const hasProtein = loggedCats.includes("protein");
  const hasGrains = loggedCats.includes("grains");

  res.json({
    headline: "Balanced Nutrition Insight",
    message: totalLogged >= 3
      ? `You've been logging meals consistently. Your entries reflect mindful variety with ${loggedCats.length > 0 ? loggedCats.join(", ") : "balanced food options"} supporting your daily energy.`
      : `You've logged ${totalLogged} meal(s) so far. Keep logging your daily meals to build a clear picture of your food group variety and steady nourishment.`,
    suggestions: [
      !hasVeggies ? "Try adding a colorful vegetable or leafy green to your next main meal." : "Great job including vegetables in your recent meals!",
      !hasProtein ? "Include a nourishing protein source (like legumes, eggs, or fish) to support muscle recovery." : "Consistent protein helps maintain steady satiety throughout your day.",
    ],
    categoriesLogged: loggedCats,
    consistencySummary: `${todayMeals.length} / 4 meals logged today`,
    isEnoughData: true,
    confidence: "medium",
  });
});

// AI Coach Chat Endpoint
app.post("/api/gemini/chat", async (req, res) => {
  const { messages, userContext } = req.body;
  const lastMessage = Array.isArray(messages) && messages.length > 0 ? messages[messages.length - 1].content : "";
  const name = userContext?.name || "Friend";

  try {
    const client = getGeminiClient();
    if (client && lastMessage) {
      const historySummary = Array.isArray(messages)
        ? messages
            .slice(-6)
            .map((m: any) => `${m.role === "user" ? name : "FitFlow Coach"}: ${m.content}`)
            .join("\n")
        : "";

      const prompt = `Conversation Context:
${historySummary}

User Context Data:
- Name: ${name}
- Steps today: ${userContext?.todaySteps ?? 0}
- Hydration: ${userContext?.todayWater ?? "0L"} (Goal: ${userContext?.waterGoal ?? "2.5L"})
- Workouts completed this week: ${userContext?.workoutCount ?? 0}
- Today's Logged Meals: ${JSON.stringify(userContext?.todayMeals || [])}
- Weekly Logged Meals: ${JSON.stringify(userContext?.weeklyMeals || [])}
- Food Categories: ${JSON.stringify(userContext?.foodGroups || [])}
- Daily Habits: ${userContext?.habitsCompleted ?? 0}/${userContext?.habitsTotal ?? 0}
- Consistency Score: ${userContext?.wellnessScore ?? 75}/100
- Energy / Mood: ${userContext?.checkinFeeling || userContext?.mood || "Normal"}

User's Latest Message: "${lastMessage}"

Reply as FitFlow Coach following all safety rules. If user asks about their logged meals, consistency, or food groups, answer using the exact data provided above. If they have 0 meals logged, politely let them know they haven't logged any meals yet. Keep response concise, friendly, and supportive with formatting.`;

      const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      for (const modelName of candidateModels) {
        try {
          const response = await client.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction: COACH_SYSTEM_PROMPT,
            },
          });
          if (response?.text) {
            return res.json({ reply: response.text.trim() });
          }
        } catch (err) {
          continue;
        }
      }
    }
  } catch (err) {
    // fallback
  }

  const fallbackReply = generateSmartCoachReply(lastMessage, userContext);
  res.json({ reply: fallbackReply });
});


// Helper to generate deterministic safe fallback personalized plan
function generateFallbackPersonalPlan(preferences: any, profile: any): any {
  const name = profile?.name || "Friend";
  const selectedDays: string[] = preferences?.availableDays?.length
    ? preferences.availableDays
    : ["Monday", "Wednesday", "Friday"];
  
  const durationStr = preferences?.workoutDuration || "30 min";
  const durationNum = parseInt(durationStr.replace(/\D/g, ""), 10) || 30;
  const experience = preferences?.experienceLevel || "Beginner";
  const equipmentList = preferences?.equipment || ["No equipment"];
  const goals: string[] = preferences?.goals || ["Improve fitness", "Stay consistent"];
  
  const hasDumbbells = equipmentList.some((e: string) => /dumbbell/i.test(e) || /gym/i.test(e));
  
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  // Workout templates rotation based on available days
  const workoutTemplates = [
    {
      title: "Upper Body Strength & Posture",
      category: "Upper Body",
      focus: "Chest, Back, Shoulders & Arms",
      exercises: hasDumbbells
        ? [
            { name: "Dumbbell Floor Press", category: "strength", muscleGroup: "Chest", equipment: "Dumbbell", sets: 3, reps: experience === "Beginner" ? 8 : 10, weightKg: 10, notes: "Controlled tempo" },
            { name: "Dumbbell Bent-Over Row", category: "strength", muscleGroup: "Back", equipment: "Dumbbell", sets: 3, reps: 10, weightKg: 10, notes: "Keep spine neutral" },
            { name: "Dumbbell Shoulder Press", category: "strength", muscleGroup: "Shoulders", equipment: "Dumbbell", sets: 3, reps: 8, weightKg: 8, notes: "Engage core" },
            { name: "Dumbbell Bicep Curls", category: "strength", muscleGroup: "Arms", equipment: "Dumbbell", sets: 2, reps: 12, weightKg: 8, notes: "Full range of motion" },
          ]
        : [
            { name: "Push-Ups (or Knee Push-Ups)", category: "bodyweight", muscleGroup: "Chest", equipment: "Bodyweight", sets: 3, reps: experience === "Beginner" ? 6 : 10, notes: "Chest to floor" },
            { name: "Prone Y-T-W Shoulder Raises", category: "mobility", muscleGroup: "Back", equipment: "Bodyweight", sets: 3, reps: 10, notes: "Squeeze shoulder blades" },
            { name: "Pike Push-Ups (or Bear Hold)", category: "bodyweight", muscleGroup: "Shoulders", equipment: "Bodyweight", sets: 3, reps: 8, notes: "Target upper body" },
            { name: "Plank Hold", category: "core", muscleGroup: "Core", equipment: "Bodyweight", sets: 3, reps: 30, notes: "30-second hold" },
          ],
    },
    {
      title: "Lower Body Foundation & Core",
      category: "Lower Body",
      focus: "Quads, Glutes, Hamstrings & Core",
      exercises: hasDumbbells
        ? [
            { name: "Goblet Squats", category: "strength", muscleGroup: "Legs", equipment: "Dumbbell", sets: 3, reps: 10, weightKg: 12, notes: "Knees track over toes" },
            { name: "Dumbbell Romanian Deadlifts", category: "strength", muscleGroup: "Legs", equipment: "Dumbbell", sets: 3, reps: 10, weightKg: 12, notes: "Hinge at hips" },
            { name: "Walking Lunges", category: "strength", muscleGroup: "Legs", equipment: "Dumbbell", sets: 3, reps: 8, weightKg: 8, notes: "8 reps each leg" },
            { name: "Glute Bridges", category: "bodyweight", muscleGroup: "Legs", equipment: "Bodyweight", sets: 3, reps: 12, notes: "Squeeze at top for 2s" },
          ]
        : [
            { name: "Bodyweight Air Squats", category: "bodyweight", muscleGroup: "Legs", equipment: "Bodyweight", sets: 3, reps: 12, notes: "Smooth depth" },
            { name: "Single-Leg Glute Bridges", category: "bodyweight", muscleGroup: "Legs", equipment: "Bodyweight", sets: 3, reps: 8, notes: "8 each side" },
            { name: "Reverse Lunges", category: "bodyweight", muscleGroup: "Legs", equipment: "Bodyweight", sets: 3, reps: 10, notes: "Step back softly" },
            { name: "Dead Bug Core Holds", category: "core", muscleGroup: "Core", equipment: "Bodyweight", sets: 3, reps: 10, notes: "Opposite arm and leg" },
          ],
    },
    {
      title: "Full Body Mobility & Core Flow",
      category: "Full Body",
      focus: "Total Body Conditioning & Functional Strength",
      exercises: [
        { name: "Bodyweight Squat to Overhead Reach", category: "mobility", muscleGroup: "Full Body", equipment: "Bodyweight", sets: 3, reps: 10, notes: "Flow with breath" },
        { name: "Incline Push-Ups", category: "bodyweight", muscleGroup: "Chest", equipment: "Bodyweight", sets: 3, reps: 8, notes: "Using bench or floor" },
        { name: "Bird-Dog Extensions", category: "core", muscleGroup: "Core", equipment: "Bodyweight", sets: 3, reps: 10, notes: "Keep hips level" },
        { name: "Side Plank Hold", category: "core", muscleGroup: "Core", equipment: "Bodyweight", sets: 3, reps: 20, notes: "20 seconds each side" },
      ],
    },
    {
      title: "Active Recovery & Mobility Routine",
      category: "Mobility & Recovery",
      focus: "Joint Mobility, Hamstrings & Thoracic Opening",
      exercises: [
        { name: "Cat-Cow Spine Flow", category: "mobility", muscleGroup: "Back", equipment: "Bodyweight", sets: 2, reps: 10, notes: "Slow mindful breathing" },
        { name: "World's Greatest Stretch", category: "mobility", muscleGroup: "Full Body", equipment: "Bodyweight", sets: 2, reps: 5, notes: "5 reps per side" },
        { name: "90/90 Hip Switches", category: "mobility", muscleGroup: "Legs", equipment: "Bodyweight", sets: 2, reps: 8, notes: "Gently rotate hips" },
        { name: "Child's Pose Deep Breathing", category: "mobility", muscleGroup: "Back", equipment: "Bodyweight", sets: 2, reps: 6, notes: "Deep belly breaths" },
      ],
    },
  ];

  let workoutIndex = 0;
  const days = dayNames.map((dName, i) => {
    const isWorkoutDay = selectedDays.includes(dName);
    const dayKey = dayKeys[i];

    let workoutObj: any = null;
    let focusTheme = "Active Recovery & Daily Habits";

    if (isWorkoutDay) {
      const template = workoutTemplates[workoutIndex % workoutTemplates.length];
      workoutIndex++;
      focusTheme = `${template.title}`;
      workoutObj = {
        title: template.title,
        category: template.category,
        durationMinutes: durationNum,
        focus: template.focus,
        exercises: template.exercises,
      };
    }

    const tasks: any[] = [];

    if (isWorkoutDay && workoutObj) {
      tasks.push({
        id: `task-${dayKey}-workout`,
        type: "workout",
        title: `Workout: ${workoutObj.title}`,
        subtitle: `${workoutObj.durationMinutes} mins • ${workoutObj.exercises.length} exercises`,
        icon: "🏋️",
        completed: false,
      });
    }

    const stepTarget = preferences?.activityLevel === "Very active" ? 9000 : preferences?.activityLevel === "Moderately active" ? 8000 : 6000;
    tasks.push({
      id: `task-${dayKey}-activity`,
      type: "activity",
      title: `Daily Movement (${stepTarget.toLocaleString()} steps)`,
      subtitle: isWorkoutDay ? "Warmup walk and daily movement" : "Gentle outdoor or indoor walking",
      icon: "🚶",
      completed: false,
    });

    tasks.push({
      id: `task-${dayKey}-hydration`,
      type: "hydration",
      title: "Hydration: 2.5L Water",
      subtitle: "Consistent hydration across the day",
      icon: "💧",
      completed: false,
    });

    const habitSuggestions = [
      { name: "Post-Meal 10m Walk", icon: "🚶", cat: "movement", desc: "Aids digestion and mental clarity" },
      { name: "Morning Sunlight & Water", icon: "☀️", cat: "lifestyle", desc: "Awaken circadian rhythm" },
      { name: "5-Minute Evening Mobility", icon: "🧘", cat: "recovery", desc: "Unwind joint tension" },
      { name: "Mindful Digital Wind-Down", icon: "📱", cat: "sleep", desc: "Dim screens 30m before bed" },
      { name: "Posture Check & Stretch", icon: "✨", cat: "lifestyle", desc: "Shoulder rolls and spine reset" },
      { name: "Deep Diaphragmatic Breaths", icon: "🌿", cat: "mindset", desc: "3 minutes slow breathing" },
      { name: "Weekly Reflection & Gratitude", icon: "📝", cat: "mindset", desc: "Celebrate consistency wins" },
    ];
    const dayHabit = habitSuggestions[i % habitSuggestions.length];

    tasks.push({
      id: `task-${dayKey}-habit`,
      type: "habit",
      title: dayHabit.name,
      subtitle: dayHabit.desc,
      icon: dayHabit.icon,
      completed: false,
    });

    tasks.push({
      id: `task-${dayKey}-recovery`,
      type: "recovery",
      title: isWorkoutDay ? "Post-Workout Rest & Sleep" : "Rest & Restoration",
      subtitle: "Target 7.5–8 hours of restorative rest",
      icon: "😴",
      completed: false,
    });

    return {
      dayOfWeek: dayKey,
      dayName: dName,
      focusTheme,
      workout: workoutObj,
      activity: {
        title: isWorkoutDay ? "Daily Active Movement" : "Gentle Active Recovery Walk",
        targetSteps: stepTarget,
        distanceKm: Math.round(stepTarget * 0.00075 * 10) / 10,
        description: isWorkoutDay
          ? "Combine your workout with daily walking breaks to stay energized."
          : "Light movement promotes blood flow and accelerates muscular recovery.",
      },
      hydration: {
        targetMl: 2500,
        tip: "Drink a tall glass of water upon waking and keep a water bottle nearby.",
      },
      habit: {
        name: dayHabit.name,
        icon: dayHabit.icon,
        category: dayHabit.cat,
        description: dayHabit.desc,
      },
      recovery: {
        title: isWorkoutDay ? "Rest & Muscle Repair" : "Full Active Recovery Day",
        sleepTargetHours: 8,
        routine: "Screen wind-down 30 minutes before sleep and gentle stretching.",
        isRestDay: !isWorkoutDay,
      },
      tasks,
    };
  });

  return {
    id: "plan-" + Date.now(),
    userId: profile?.id || "user",
    title: `${goals[0] || "Everyday Wellness"} Flow Plan`,
    summary: `Personalized ${selectedDays.length}-day schedule tailored for ${experience.toLowerCase()} level with ${equipmentList.join(", ")}.`,
    weeklyGoalSummary: `Complete ${selectedDays.length} strength/movement sessions and maintain 2.5L daily hydration and steady steps.`,
    status: "active",
    preferences,
    days,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// AI Personalized Plan Generation Endpoint
app.post("/api/gemini/generate-plan", async (req, res) => {
  const { preferences, profile } = req.body;

  try {
    const client = getGeminiClient();

    if (!client) {
      const fallbackPlan = generateFallbackPersonalPlan(preferences, profile);
      return res.json({
        plan: fallbackPlan,
        source: "smart-fallback",
      });
    }

    const availableDays: string[] = preferences?.availableDays || ["Monday", "Wednesday", "Friday"];
    const duration = preferences?.workoutDuration || "30 min";
    const experience = preferences?.experienceLevel || "Beginner";
    const equipment = (preferences?.equipment || []).join(", ") || "Bodyweight";
    const goals = (preferences?.goals || []).join(", ");
    const customGoal = preferences?.customGoal ? `Custom Goal: "${preferences.customGoal}"` : "";
    const preferredTime = preferences?.preferredWorkoutTime || "Flexible";

    const prompt = `You are FitFlow AI Planner. Generate a comprehensive 7-day personalized wellness and workout routine.

User Profile & Preferences:
- User Name: ${profile?.name || "Friend"}
- Primary Goals: ${goals} ${customGoal}
- Experience Level: ${experience}
- Workout Days Selected: ${availableDays.join(", ")} (${availableDays.length} days total)
- Workout Duration: ${duration}
- Preferred Workout Time: ${preferredTime}
- Equipment Available: ${equipment}
- Activity Level: ${preferences?.activityLevel || "Moderately active"}

CRITICAL SAFETY & QUALITY INSTRUCTIONS:
1. ONLY schedule workouts on the days in: ${JSON.stringify(availableDays)}. All other days MUST have workout: null and be labeled as rest/recovery days.
2. Absolutely DO NOT provide calorie-deficit targets, extreme weight loss promises, body-fat measurements, or meal restriction plans.
3. Keep exercise selections realistic and safe for ${experience} experience with ${equipment} equipment.
4. Output STRICT JSON conforming to the exact schema:
{
  "title": "Short Inspiring Plan Title",
  "summary": "1-2 sentence plan summary",
  "weeklyGoalSummary": "1 sentence weekly milestone",
  "days": [
    {
      "dayOfWeek": "monday",
      "dayName": "Monday",
      "focusTheme": "Upper Body Strength & Hydration",
      "workout": {
        "title": "Upper Body Flow",
        "category": "Upper Body",
        "durationMinutes": 30,
        "focus": "Chest, Back and Posture",
        "exercises": [
          {
            "name": "Push-Ups",
            "category": "bodyweight",
            "muscleGroup": "Chest",
            "equipment": "Bodyweight",
            "sets": 3,
            "reps": 10,
            "weightKg": 0,
            "notes": "Keep core tight"
          }
        ]
      },
      "activity": {
        "title": "Daily Movement",
        "targetSteps": 7000,
        "distanceKm": 5.0,
        "description": "Daily walking and movement target"
      },
      "hydration": {
        "targetMl": 2500,
        "tip": "Start with a glass of water upon waking"
      },
      "habit": {
        "name": "Evening Mobility",
        "icon": "🧘",
        "category": "recovery",
        "description": "5 minutes of light mobility"
      },
      "recovery": {
        "title": "Rest & Restorative Sleep",
        "sleepTargetHours": 8,
        "routine": "Wind down screen time 30 mins before sleep",
        "isRestDay": false
      },
      "tasks": [
        {
          "id": "task-monday-workout",
          "type": "workout",
          "title": "Workout: Upper Body Flow",
          "subtitle": "30 mins • 4 exercises",
          "icon": "🏋️",
          "completed": false
        },
        {
          "id": "task-monday-activity",
          "type": "activity",
          "title": "Daily Movement (7,000 steps)",
          "subtitle": "Warmup walk and active breaks",
          "icon": "🚶",
          "completed": false
        },
        {
          "id": "task-monday-hydration",
          "type": "hydration",
          "title": "Hydration: 2.5L Water",
          "subtitle": "Stay steadily hydrated",
          "icon": "💧",
          "completed": false
        },
        {
          "id": "task-monday-habit",
          "type": "habit",
          "title": "Evening Mobility",
          "subtitle": "5 mins of light mobility",
          "icon": "🧘",
          "completed": false
        },
        {
          "id": "task-monday-recovery",
          "type": "recovery",
          "title": "Rest & Restorative Sleep",
          "subtitle": "Target 8h sleep",
          "icon": "😴",
          "completed": false
        }
      ]
    }
  ]
}

Ensure all 7 days (monday, tuesday, wednesday, thursday, friday, saturday, sunday) are included in order.`;

    const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let parsedPlan: any = null;
    let successfulModel: string | null = null;

    for (const modelName of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: COACH_SYSTEM_PROMPT,
            responseMimeType: "application/json",
            temperature: 0.4,
          },
        });

        if (response?.text) {
          const raw = JSON.parse(response.text.trim());
          if (raw && Array.isArray(raw.days) && raw.days.length === 7) {
            parsedPlan = {
              id: "plan-" + Date.now(),
              userId: profile?.id || "user",
              title: raw.title || `${experience} Flow Plan`,
              summary: raw.summary || "Your personalized 7-day routine.",
              weeklyGoalSummary: raw.weeklyGoalSummary || "Stay consistent with daily movement and hydration.",
              status: "active",
              preferences,
              days: raw.days,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            successfulModel = modelName;
            break;
          }
        }
      } catch (err: any) {
        continue;
      }
    }

    if (parsedPlan) {
      return res.json({
        plan: parsedPlan,
        source: successfulModel,
      });
    }

    // If parsing failed or invalid schema, return safe deterministic plan
    const fallbackPlan = generateFallbackPersonalPlan(preferences, profile);
    res.json({
      plan: fallbackPlan,
      source: "smart-fallback",
    });
  } catch (error: any) {
    const fallbackPlan = generateFallbackPersonalPlan(preferences, profile);
    res.json({
      plan: fallbackPlan,
      source: "smart-fallback",
    });
  }
});

// AI Plan Adaptation Endpoint (Missed tasks / Schedule adjustments)
app.post("/api/gemini/adapt-plan", async (req, res) => {
  const { currentPlan, missedDay, missedType, userNote } = req.body;

  try {
    const client = getGeminiClient();

    const adaptationExplanation = `Life happens, and consistency is about momentum rather than perfection! Rather than doubling up workouts or putting extra stress on your schedule, let's keep your remaining week balanced with restorative movement and steady hydration.`;

    if (!client) {
      return res.json({
        adjustmentMessage: adaptationExplanation,
        tip: "Focus on today's target hydration and a gentle 15-minute walk.",
        adaptedPlan: currentPlan,
        source: "smart-fallback",
      });
    }

    const prompt = `A user missed or wants to adjust their scheduled plan for ${missedDay || "today"} (Missed item: ${missedType || "workout"}).
User note: "${userNote || "Busy schedule / missed session"}".
Plan Title: ${currentPlan?.title || "Weekly Plan"}

Provide a brief, uplifting, guilt-free adaptation recommendation in JSON:
{
  "adjustmentMessage": "Empathetic, constructive guidance (2-3 sentences). Remind them that missing a session is normal and they should not double up dangerously.",
  "tip": "1 actionable gentle suggestion for today or tomorrow."
}`;

    const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let parsedAdaptation: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: COACH_SYSTEM_PROMPT,
            responseMimeType: "application/json",
          },
        });

        if (response?.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed && parsed.adjustmentMessage) {
            parsedAdaptation = parsed;
            break;
          }
        }
      } catch (err) {
        continue;
      }
    }

    if (parsedAdaptation) {
      return res.json({
        adjustmentMessage: parsedAdaptation.adjustmentMessage,
        tip: parsedAdaptation.tip || "Prioritize gentle mobility and restful recovery tonight.",
        adaptedPlan: currentPlan,
        source: "gemini",
      });
    }

    res.json({
      adjustmentMessage: adaptationExplanation,
      tip: "Focus on today's target hydration and a gentle 15-minute walk.",
      adaptedPlan: currentPlan,
      source: "smart-fallback",
    });
  } catch (err) {
    res.json({
      adjustmentMessage: "Missing a workout is part of a real journey. Keep moving forward with your next scheduled session smoothly.",
      tip: "Drink a tall glass of water and take a mindful breath.",
      adaptedPlan: currentPlan,
      source: "smart-fallback",
    });
  }
});

// Start Server with Vite Middleware
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FitFlow AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
