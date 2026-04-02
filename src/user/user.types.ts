import { SharedUser } from '@prisma/client';

export type EnhancedSharedUser = SharedUser & {
  cefr_level: string;
  fluency_score: number;
  streak_days: number;
  total_practice_minutes: number;
  last_active_app?: string;
  preferred_mode?: string;
  onboarding_completed: boolean;
};

export function enhanceUser(user: SharedUser): EnhancedSharedUser {
  return {
    ...user,
    cefr_level: user.cefrLevel,
    fluency_score: user.fluencyScore,
    streak_days: user.streakDays,
    total_practice_minutes: user.totalPracticeMinutes,
    last_active_app: user.lastActiveApp,
    preferred_mode: user.preferredMode,
    onboarding_completed: user.onboardingCompleted,
  };
}
