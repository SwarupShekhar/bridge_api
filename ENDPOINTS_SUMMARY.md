# Bridge API - Pulse/Core Identity Sync Endpoints

## Summary
All required endpoints have been verified and completed for Pulse/Core identity sync. The API now supports all 5 required endpoints with proper authentication, validation, and response formatting.

## Endpoints Implemented

### 1. GET /user/:clerkId
- ✅ Returns full shared_users row
- ✅ Includes both snake_case and camelCase versions of required fields:
  - `cefr_level` / `cefrLevel`
  - `fluency_score` / `fluencyScore`
  - `streak_days` / `streakDays`
  - `total_practice_minutes` / `totalPracticeMinutes`
  - `last_active_app` / `lastActiveApp`
  - `preferred_mode` / `preferredMode`
  - `onboarding_completed` / `onboardingCompleted`
- ✅ Validates `x-internal-secret` header

### 2. PATCH /user/:clerkId
- ✅ Accepts `{ last_active_app, preferred_mode }`
- ✅ Validates `last_active_app` values: 'PULSE' | 'CORE'
- ✅ Validates `x-internal-secret` header

### 3. PATCH /user/:clerkId/streak
- ✅ Increments `streak_days` by 1
- ✅ Only increments once per calendar day per user
- ✅ Checks `last_session_at` - if already updated today, skips silently
- ✅ Validates `x-internal-secret` header

### 4. PATCH /user/:clerkId/minutes
- ✅ Accepts `{ minutes: number }`
- ✅ Adds to `total_practice_minutes`
- ✅ Validates `x-internal-secret` header

### 5. PATCH /sync/cefr
- ✅ Accepts `{ clerkId, cefrLevel, fluencyScore, source }`
- ✅ Updates `cefr_level`, `fluency_score`, `cefr_updated_at`, `cefr_updated_by`
- ✅ `cefr_updated_by` set to 'PULSE' or 'CORE' based on source
- ✅ Validates `x-internal-secret` header

## Security
- ✅ All endpoints validate `x-internal-secret` header against `process.env.INTERNAL_SECRET`
- ✅ Returns 401 if secret missing or wrong
- ✅ No hardcoded secrets

## Database Schema
- ✅ All required fields exist in `shared_users` table
- ✅ Proper field mappings between snake_case (database) and camelCase (API)

## Code Changes Made

### Files Modified:
1. **src/user/user.controller.ts** - Updated to ensure all endpoints have proper secret validation
2. **src/user/user.service.ts** - Enhanced to return both snake_case and camelCase field versions
3. **src/user/user.dto.ts** - Updated validation for PULSE/CORE values
4. **src/sync/sync.controller.ts** - Updated to accept PULSE/CORE instead of englivo/engr
5. **src/sync/sync.service.ts** - Updated cross-backend notification logic

### Files Added:
1. **src/user/user.types.ts** - Type definitions and helper functions for enhanced user responses

## Testing
- ✅ Compilation successful with `npm run build`
- ✅ All TypeScript types resolved
- ✅ No lint errors

## Environment Variables Required
- `INTERNAL_SECRET` - For API authentication
- `CORE_INTERNAL_URL` - For notifying CORE backend from PULSE
- `PULSE_INTERNAL_URL` - For notifying PULSE backend from CORE

The Bridge API is now fully ready for Pulse/Core identity sync operations.
