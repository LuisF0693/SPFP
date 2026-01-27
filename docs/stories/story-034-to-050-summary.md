# Stories 034-050: Final Technical Debt Resolution Stories

## Story 034: Extract Insights Component Logic
**Sprint:** 3 | **Effort:** 9h | **Priority:** P2
- Split 494 LOC Insights into: InsightsChat.tsx + InsightsHistory.tsx + InsightsDisplay.tsx
- Extract AI prompt logic to service
- Optimize memoization

## Story 035: Implement Supabase Sync Error Recovery
**Sprint:** 2 | **Effort:** 6h | **Priority:** P1
- Add exponential backoff retry logic
- Implement offline queue
- Add user feedback for sync status

## Story 036: Create User Profiles Table
**Sprint:** 1 | **Effort:** 3h | **Priority:** P1
- New user_profiles table (preferences, name, avatar)
- Migrate existing data
- Update queries

## Story 037: Create User Settings Table
**Sprint:** 1 | **Effort:** 3h | **Priority:** P1
- New user_settings table (currencies, language, notifications)
- Default settings for new users
- Settings UI (prepared, not implemented)

## Story 038: Add Transaction Group Validation
**Sprint:** 1 | **Effort:** 2h | **Priority:** P1
- FK constraints on groupId
- Orphan detection
- Validation in service

## Story 039: Create CategoryIcon Service
**Sprint:** 1-2 | **Effort:** 2h | **Priority:** P3
- Complete icon mapping
- Fallback for missing categories
- Improve icon selection

## Story 040: Implement PDF Export Memory Optimization
**Sprint:** 3 | **Effort:** 3h | **Priority:** P2
- Stream large exports
- Reduce memory footprint for 500+ items
- Add progress indicator

## Story 041: Setup Performance Monitoring
**Sprint:** 4 | **Effort:** 4h | **Priority:** P2
- Integrate Sentry (prepared)
- Track performance metrics
- Dashboard for monitoring

## Story 042: Add AI Service Response Validation
**Sprint:** 1 | **Effort:** 2h | **Priority:** P1
- Fix ChatMessage.role type (remove 'system' for Gemini)
- Validate API responses
- Better error handling

## Story 043: Implement useCallback Dependencies Audit
**Sprint:** 1 | **Effort:** 2h | **Priority:** P3
- Fix missing dependencies in AdminCRM
- Fix missing dependencies in Dashboard
- Prevent stale closures

## Story 044: Setup Lazy Loading for Routes
**Sprint:** 5 | **Effort:** 3h | **Priority:** P2
- Dynamic imports for route components
- Suspense boundaries for route transitions
- Reduce initial bundle

## Story 045: Create i18n Infrastructure
**Sprint:** 4 | **Effort:** 8h | **Priority:** P2
- Setup i18n library
- Extract hardcoded strings
- Support Portuguese + English
- Settings for language selection

## Story 046: Implement Auto-Save for Forms
**Sprint:** 4 | **Effort:** 4h | **Priority:** P2
- Save form state as user types
- Recover unsaved data on page reload
- Show save status indicator

## Story 047: Add Batch Operations for Performance
**Sprint:** 5 | **Effort:** 3h | **Priority:** P2
- Batch transaction imports
- Batch account updates
- Reduce API calls

## Story 048: Implement localStorage Debouncing
**Sprint:** 1 | **Effort:** 3h | **Priority:** P2
- Debounce context state writes
- Reduce disk I/O
- Improve performance

## Story 049: Setup Security Headers + CSP
**Sprint:** 5 | **Effort:** 4h | **Priority:** P1
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options

## Story 050: Create Final Integration & Smoke Tests
**Sprint:** 6 | **Effort:** 8h | **Priority:** P1
- End-to-end regression test suite
- Critical path validation
- Performance baseline validation
- Deployment readiness checklist

---

**Total Stories Created:** 50
**Total Estimated Effort:** 335+ hours
**Recommended Timeline:** 6 weeks with 3 developers
**Status:** Ready for Sprint Planning

---

## Distribution Summary

| Sprint | Story IDs | Count | Effort |
|--------|-----------|-------|--------|
| **0** | 001-005 | 5 | 35h |
| **1** | 006-009, 027-030, 035-043 | 12 | 65h |
| **2-3** | 010-016, 020, 023-025, 031-034 | 18 | 111h |
| **4** | 014-015, 018-019, 021, 026, 041, 045-046 | 9 | 55h |
| **5-6** | 017, 022, 024-025, 028, 037-040, 042, 044, 047-050 | 15 | 69h |
| **TOTAL** | 001-050 | **50** | **335h** |

---

**Created:** 2026-01-26
**Status:** BATCH TEMPLATE - See individual story files for details
