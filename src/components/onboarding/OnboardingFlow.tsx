import React from 'react';
import { PlanOnboardingFlow } from './PlanOnboardingFlow';

export const OnboardingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return <PlanOnboardingFlow onComplete={onComplete} />;
};
