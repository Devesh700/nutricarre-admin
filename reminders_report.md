# Supabase Reminders Analysis & Bug Report

This report documents how diet plan reminders, sleep/wakeup reminders, and other notifications are currently executed in the Supabase database, identifies key bugs in their implementation, and outlines a plan to resolve them.

---

## 1. How Reminders are Executed

We retrieved the database routine definitions, pg_cron configurations, and triggers currently active on the live Supabase instance:

### A. Cron Jobs (`cron.job` table)
Supabase handles scheduled executions using the `pg_cron` extension:
1. **`daily-payment-reminders`** (`schedule: '0 9 * * *'`)
   - Executes daily at 9:00 AM UTC (2:30 PM IST).
   - Invokes `SELECT public.check_and_send_payment_reminders();`.
2. **`hourly-automated-reminders`** (`schedule: '0 * * * *'`)
   - Executes once every hour at the 0th minute (e.g. 1:00, 2:00, etc.).
   - Invokes `SELECT public.check_and_send_automated_reminders();` (which in turn calls `public.check_and_send_diet_reminders()`).
3. **`sleep-reminder`** (`schedule: '25 16 * * *'`)
   - Executes daily at 4:25 PM UTC (9:55 PM IST).
   - Broadcats a static sleep reminder to all profiles where `is_active = true`.
4. **`wakeup-reminder`** (`schedule: '30 23 * * *'`)
   - Executes daily at 11:30 PM UTC (5:00 AM IST).
   - Broadcasts a static wakeup reminder to all profiles where `is_active = true`.

### B. Trigger-based Updates
Some events trigger evaluations immediately:
- **`trg_after_calorie_log_insert`** and **`trg_after_meal_log_insert`**: Triggers whenever a user logs a meal or calorie entry, calling `evaluate_user_achievements` to unlock streaks.
- **`trg_after_hydration_log_insert`**: Triggers upon adding a water log to evaluate hydration achievements.
- **`trg_after_step_log_insert`**: Triggers upon step updates.
- **`trg_after_profile_weight_update`**: Triggers when a profile's current weight is updated.

---

## 2. Key Issues Identified in the Current System

### ❌ Issue 1: Wrong `day_index` Calculation for User Meal Reminders (The "Today's Schedule" Bug)
* **Symptom:** Users receive reminders for meals that are not in their today's plan schedule.
* **Root Cause:** In the function `check_and_send_diet_reminders()`, the current day index of a user's diet plan is calculated as:
  ```sql
  v_day_index := FLOOR(EXTRACT(EPOCH FROM (NOW() - v_user.active_plan_start_date)) / 86400) + 1;
  ```
  Since `active_plan_start_date` includes the exact time of plan activation (e.g., 3:30 PM IST), `NOW() - active_plan_start_date` calculates a rolling 24-hour window from that hour/minute instead of calendar days.
  
  **Example Scenario:**
  - Plan starts on Day 1 at 3:30 PM IST.
  - On Day 2, at 10:00 AM IST: Since only 18.5 hours have elapsed, the calculation yields `FLOOR(18.5 / 24) + 1 = 1` (Day 1). The user gets breakfast/lunch reminders for **Day 1** meals.
  - On Day 2, at 4:00 PM IST: Now 24.5 hours have elapsed, so it yields `FLOOR(24.5 / 24) + 1 = 2` (Day 2). The user gets dinner reminders for **Day 2** meals.
  
  This splits the user's calendar day mid-way, leading to incorrect reminders.

---

### ❌ Issue 2: Upcoming Meal Reminders are Silently Skipped due to Hourly Cron
* **Symptom:** Upcoming meal reminders are rarely sent, or sent only for very specific meal times.
* **Root Cause:** 
  - The cron job `hourly-automated-reminders` executes strictly **once every hour** (`0 * * * *`).
  - Inside the database function, upcoming meals are verified using a narrow 30-minute window:
    ```sql
    v_diff_seconds := EXTRACT(EPOCH FROM (v_meal_time_val - v_curr_time));
    IF v_diff_seconds >= 0 AND v_diff_seconds <= 1800 THEN ...
    ```
  - If a meal is scheduled at **1:45 PM**:
    - When checked at 1:00 PM, the diff is 45 minutes (2700s) $\rightarrow$ Too far, skipped.
    - When checked at 2:00 PM, the diff is -15 minutes (-900s) $\rightarrow$ Already in the past, skipped.
  - As a result, any meal scheduled outside of `[0, 30] minutes` after any hour mark will **never** trigger an upcoming meal reminder.

---

### ❌ Issue 3: Hardcoded Broadcast of Sleep & Wake Up Reminders
* **Symptom:** All active users receive sleep/wakeup notifications at the exact same time (9:55 PM IST and 5:00 AM IST) regardless of their individual routines.
* **Root Cause:** The pg_cron jobs `sleep-reminder` and `wakeup-reminder` query the database at fixed cron schedule intervals and broadcast a generic notification string to all users, ignoring the personalized columns `wake_time` and `sleep_time` stored in the `public.profiles` table.

---

## 3. Recommended Fixes (Summary)
1. **Update `day_index` calculation** to calculate calendar date differences in `Asia/Kolkata` time:
   ```sql
   v_day_index := ((NOW() AT TIME ZONE 'Asia/Kolkata')::DATE - (v_user.active_plan_start_date AT TIME ZONE 'Asia/Kolkata')::DATE) + 1;
   ```
2. **Increase Cron frequency** for `hourly-automated-reminders` to run every 10 minutes (`*/10 * * * *`) and align the checking window inside `check_and_send_diet_reminders` to search for meals within the next 10-15 minutes.
3. **Move Sleep/Wakeup reminders** into the dynamic automated check functions, reading the specific user's `sleep_time` and `wake_time` from their profiles and comparing them to local time.
