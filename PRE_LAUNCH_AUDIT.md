# Pre-Launch Audit Report: Volunteer Scheduler Web

**Auditor:** Jules (Cynical QA Tester)
**Date:** 2026-01-15
**Status:** 🔴 FAIL (Launch Blocked by High-Risk Issues)

---

## 🛑 Executive Summary
The application has several critical logic flaws that could lead to data corruption, user confusion, and security risks. Most notably, the Kiosk mode provides false positive feedback on failures, and the shift management system allows impossible time ranges. Deployment configuration is incomplete, and several hardcoded secrets/endpoints persist in the codebase.

---

## 1. Logic & Functionality
### 🚨 [CRITICAL] Kiosk "Success" Lie
In `kiosk-flow.tsx`, the application blindly proceeds to the "Success" screen and displays "Checked In!" or "Checked Out!" even if the underlying server action (`kioskCheckIn` or `kioskCheckOut`) fails.
- **Impact:** Volunteers may think they have successfully checked in when they haven't, leading to inaccurate attendance data and equipment tracking.
- **Fix:** Inspect the response from server actions and display error notifications on failure.

### 🚨 [HIGH] Missing Shift Time Validation
The `ShiftSchema` and associated server actions do not verify that a shift's `end_time` is after its `start_time`.
- **Impact:** Users can create "negative duration" shifts or shifts that end before they start, which will break the Timeline view, reporting, and the Auto-Assign scheduler.
- **Fix:** Implement `.refine()` in Zod schema and server-side checks.

### ⚠️ [MEDIUM] Destructive Auto-Assign
The `autoAssign` action in `assign/actions.ts` deletes all existing assignments for an event before applying new ones.
- **Impact:** Accidental clicks can wipe hours of manual assignment work with no "undo" or confirmation prompt.
- **Fix:** Add a confirmation modal to the "Auto-Assign" button in the UI.

### ⚠️ [MEDIUM] Fragile CSV Parsing
The `bulkAddShifts` action uses `new Date(dateStr)`, which is notoriously unreliable across different environments and locales.
- **Impact:** Shifts imported from CSVs might have incorrect dates or fail to import if the format doesn't match the server's locale.

---

## 2. Visual & UI/UX
### 🚨 [HIGH] Jarring Full-Page Refreshes
The application extensively uses `window.location.reload()` after almost every data-modifying action.
- **Impact:** This causes a full page flicker, loses scroll position, and provides a "clunky" experience typical of 2010-era web apps.
- **Fix:** Refactor to use Next.js `router.refresh()` for seamless server-state updates.

### ⚠️ [LOW] Branding Inconsistency
Components like `PremiumButton` and `PremiumInput` still carry "Premium" naming, while `globals.css` explicitly states that "Premium" branding was removed in favor of "Standard."
- **Impact:** Confusing for developers; inconsistent internal design language.

### ⚠️ [LOW] Kiosk Scale Issues
The Kiosk UI uses extremely large text (`text-8xl`, `text-6xl`).
- **Impact:** On smaller tablets or mobile devices (often used as backup kiosks), elements will overlap or require excessive scrolling, breaking the "high-contrast tablet" design goal.

---

## 3. Performance & Bugs
### 🚨 [HIGH] Security Risk: SSL Bypass
`process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'` is present in `autoAssign`.
- **Impact:** If this environment variable persists in production (e.g., if `NODE_ENV` is incorrectly set), the application is vulnerable to Man-in-the-Middle (MITM) attacks when calling the scheduler API.

### 🚨 [HIGH] Hardcoded Secrets & Endpoints
- Hardcoded `PASSWORD_HASH` in `src/app/analytics/page.tsx`.
- Hardcoded API endpoint `https://shift-scheduler-api-3nxm.vercel.app/schedule/json` in `src/app/events/[id]/assign/actions.ts`.
- **Impact:** Security risk and maintenance nightmare. Changing endpoints requires a code push instead of a simple config change.

### ⚠️ [MEDIUM] Missing Deployment Config
The `render.yaml` file is missing several required environment variables identified in the Vanguard audit (`SCHEDULER_API_KEY`, `NEXT_PUBLIC_ANALYTICS_PASSWORD_HASH`, etc.).
- **Impact:** The site will fail to function correctly immediately upon deployment to Render.

---

## 🛡️ Recommended Fixes (Priority Order)
1. **Handle Kiosk Server Errors**: Ensure volunteers get real feedback.
2. **Shift Validation**: Prevent invalid data at the source.
3. **Refactor Reloads**: Switch to `router.refresh()`.
4. **Environment Variables**: Move all hardcoded values to `render.yaml` and `.env`.
