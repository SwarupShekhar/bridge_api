"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhanceUser = enhanceUser;
function enhanceUser(user) {
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
