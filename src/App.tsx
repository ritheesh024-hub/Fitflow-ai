import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './components/auth/AuthPage';
import { Header } from './components/common/Header';
import { DesktopSidebar, MobileBottomNav } from './components/common/Navigation';
import { QuickAddModal } from './components/common/QuickAddModal';
import { CelebrationModal } from './components/common/CelebrationModal';
import { NotificationToastContainer } from './components/common/NotificationToast';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';

import { HomeDashboard } from './components/home/HomeDashboard';
import { WorkoutTracker } from './components/trackers/WorkoutTracker';
import { ActivityTracker } from './components/trackers/ActivityTracker';
import { HydrationTracker } from './components/trackers/HydrationTracker';
import { NutritionTracker } from './components/trackers/NutritionTracker';
import { SleepTracker } from './components/trackers/SleepTracker';
import { HabitsTracker } from './components/trackers/HabitsTracker';
import { ProgressAnalytics } from './components/progress/ProgressAnalytics';
import { AICoachChat } from './components/aicoach/AICoachChat';
import { AchievementsView } from './components/achievements/AchievementsView';
import { ProfileView } from './components/profile/ProfileView';
import { WeeklyPlanModal } from './components/plan/WeeklyPlanModal';
import { PlanAdaptModal } from './components/plan/PlanAdaptModal';
import { CreatePlanModal } from './components/plan/CreatePlanModal';
import { PlanHistoryModal } from './components/plan/PlanHistoryModal';
import { RegeneratePlanModal } from './components/plan/RegeneratePlanModal';
import { DailySummaryModal } from './components/ai/DailySummaryModal';
import { WeeklyReviewModal } from './components/ai/WeeklyReviewModal';
import { Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    user,
    activeTab,
    isDailySummaryOpen,
    setIsDailySummaryOpen,
    isWeeklyReviewOpen,
    setIsWeeklyReviewOpen,
    isPlanHistoryOpen,
    setIsPlanHistoryOpen,
    isRegenerateModalOpen,
    setIsRegenerateModalOpen,
  } = useApp();

  if (!user.isOnboarded) {
    return <OnboardingFlow onComplete={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Desktop Navigation Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-8">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {activeTab === 'home' && <HomeDashboard />}
          {activeTab === 'workout' && <WorkoutTracker />}
          {activeTab === 'activity' && <ActivityTracker />}
          {activeTab === 'hydration' && <HydrationTracker />}
          {activeTab === 'nutrition' && <NutritionTracker />}
          {activeTab === 'sleep' && <SleepTracker />}
          {activeTab === 'habits' && <HabitsTracker />}
          {activeTab === 'progress' && <ProgressAnalytics />}
          {activeTab === 'aicoach' && <AICoachChat />}
          {activeTab === 'achievements' && <AchievementsView />}
          {activeTab === 'profile' && <ProfileView />}
        </main>
      </div>

      {/* Mobile Floating Bottom Bar */}
      <MobileBottomNav />

      {/* Global Overlays & Modals */}
      <QuickAddModal />
      <CelebrationModal />
      <NotificationToastContainer />
      <WeeklyPlanModal />
      <PlanAdaptModal />
      <CreatePlanModal />
      <PlanHistoryModal
        isOpen={isPlanHistoryOpen}
        onClose={() => setIsPlanHistoryOpen(false)}
      />
      <RegeneratePlanModal
        isOpen={isRegenerateModalOpen}
        onClose={() => setIsRegenerateModalOpen(false)}
      />
      <DailySummaryModal
        isOpen={isDailySummaryOpen}
        onClose={() => setIsDailySummaryOpen(false)}
      />
      <WeeklyReviewModal
        isOpen={isWeeklyReviewOpen}
        onClose={() => setIsWeeklyReviewOpen(false)}
      />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-semibold text-slate-300">Loading FitFlow AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
