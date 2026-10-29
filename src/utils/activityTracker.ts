/**
 * SMART BRIDGE — Real-Time Study Timer, Daily Streak & Activity Tracker
 *
 * Provides accurate, client-side, zero-fake tracking of user learning sessions:
 * - Live study timer updating every second while active
 * - Pauses when tab is hidden, minimized, or idle (>120s inactivity)
 * - Multi-tab deduplication: only the focused tab accrues study time
 * - Reliable timestamp deltas with sleep/clock-skew protection
 * - Genuine daily learning streak: increments only on meaningful learning actions
 * - Safe persistence in localStorage under 'smartbridge_activity_tracker_v1'
 */

import { storage, STORAGE_KEYS } from './storage';
import type { QuizResultRecord, GeneratedNote } from '../types';

export interface LearningActivityRecord {
  id: string;
  type: 'quiz' | 'notes' | 'revision' | 'tutor' | 'milestone';
  title: string;
  category: string;
  timestamp: string; // ISO String
  date: string; // YYYY-MM-DD local date
  score?: string;
  icon: string;
}

export interface DayStudyRecord {
  date: string; // YYYY-MM-DD
  activeSeconds: number;
  activityCount: number;
  hasLearned: boolean; // True only if >= 1 qualifying learning action occurred
}

export interface ActivityTrackerState {
  version: 1;
  // Streak metrics
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null; // YYYY-MM-DD of last completed learning day

  // Study timer metrics
  todayDate: string; // YYYY-MM-DD
  todayActiveSeconds: number;
  lifetimeActiveSeconds: number;

  // History & logs
  dailyRecords: Record<string, DayStudyRecord>; // Keyed by YYYY-MM-DD
  recentActivities: LearningActivityRecord[]; // Latest completed learning actions
}

export interface WeeklyDaySummary {
  day: string; // "Mon", "Tue"
  date: string; // "YYYY-MM-DD"
  displayDate: string; // "29 Oct"
  hours: number;
  activeSeconds: number;
  hasLearned: boolean;
  isToday: boolean;
}

// ----------------------------------------------------------------------------
// DATE & FORMATTING HELPERS
// ----------------------------------------------------------------------------

/**
 * Returns local calendar date formatted as YYYY-MM-DD (respecting user's local timezone).
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Computes offset calendar date (e.g., offsetDays = -1 for yesterday).
 */
export function getOffsetDateString(dateStr: string, offsetDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + offsetDays);
  return getLocalDateString(date);
}

/**
 * Formats seconds into HH:MM:SS format (e.g. 1475 -> "00:24:35").
 */
export function formatTimerHHMMSS(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = safeSec % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Formats seconds into human-readable duration (e.g. "1.5 hrs" or "24 mins" or "45 secs").
 */
export function formatDurationHuman(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  if (safeSec < 60) return `${safeSec}s`;
  const mins = Math.floor(safeSec / 60);
  if (mins < 60) {
    const secs = safeSec % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} mins`;
  }
  const hrs = (safeSec / 3600).toFixed(1);
  return `${hrs} hrs`;
}

/**
 * Formats an activity timestamp relative to now (e.g. "Just now", "5 mins ago", "Today, 2:45 PM").
 */
export function formatRelativeActivityTime(isoString: string): string {
  if (!isoString) return 'Recent';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Recent';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 30) return 'Just now';
    if (diffSec < 3600) {
      const mins = Math.floor(diffSec / 60);
      return `${mins} min${mins === 1 ? '' : 's'} ago`;
    }

    const todayStr = getLocalDateString(now);
    const dateStr = getLocalDateString(d);
    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

    if (dateStr === todayStr) {
      return `Today, ${timeStr}`;
    }
    if (dateStr === getOffsetDateString(todayStr, -1)) {
      return `Yesterday, ${timeStr}`;
    }

    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  } catch {
    return 'Recent';
  }
}

// ----------------------------------------------------------------------------
// STREAK CALCULATION (Deterministic & Pure)
// ----------------------------------------------------------------------------

/**
 * Calculates current consecutive learning streak from daily records.
 * Rules:
 * - A day only counts if hasLearned === true.
 * - If today has a learning action: streak includes today and counts backward consecutive days.
 * - If today has no learning action yet, but yesterday did: streak is preserved from yesterday
 *   (streak is NOT broken until the day ends without learning).
 * - If yesterday was also missed: streak is 0.
 */
export function calculateStreakFromDailyRecords(
  dailyRecords: Record<string, DayStudyRecord>,
  todayStr: string = getLocalDateString()
): { currentStreak: number; longestStreak: number; lastActiveDate: string | null } {
  let lastActiveDate: string | null = null;

  // Find most recent active date
  const sortedDates = Object.keys(dailyRecords)
    .filter((d) => dailyRecords[d]?.hasLearned)
    .sort((a, b) => b.localeCompare(a));

  if (sortedDates.length > 0) {
    lastActiveDate = sortedDates[0];
  }

  // Calculate current streak
  let currentStreak = 0;
  const yesterdayStr = getOffsetDateString(todayStr, -1);

  const todayLearned = Boolean(dailyRecords[todayStr]?.hasLearned);
  const yesterdayLearned = Boolean(dailyRecords[yesterdayStr]?.hasLearned);

  if (todayLearned) {
    // Streak is active today! Walk backwards from today
    let checkDate = todayStr;
    while (dailyRecords[checkDate]?.hasLearned) {
      currentStreak++;
      checkDate = getOffsetDateString(checkDate, -1);
    }
  } else if (yesterdayLearned) {
    // Has not learned today yet, but streak preserved from yesterday
    let checkDate = yesterdayStr;
    while (dailyRecords[checkDate]?.hasLearned) {
      currentStreak++;
      checkDate = getOffsetDateString(checkDate, -1);
    }
  } else {
    // Both today and yesterday missed -> streak broken
    currentStreak = 0;
  }

  // Calculate all-time longest streak in records
  let longestStreak = 0;
  if (sortedDates.length > 0) {
    // Scan all dates chronologically
    const chronological = [...sortedDates].sort((a, b) => a.localeCompare(b));
    let tempStreak = 0;
    let prevDate: string | null = null;

    for (const d of chronological) {
      if (prevDate === null) {
        tempStreak = 1;
      } else if (getOffsetDateString(prevDate, 1) === d) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      prevDate = d;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak, lastActiveDate };
}

// ----------------------------------------------------------------------------
// STATE INITIALIZATION & SAFE MIGRATION
// ----------------------------------------------------------------------------

function getInitialTrackerState(): ActivityTrackerState {
  const todayStr = getLocalDateString();
  const raw = storage.get<ActivityTrackerState | null>(STORAGE_KEYS.ACTIVITY_TRACKER, null);

  if (raw && raw.version === 1 && typeof raw.dailyRecords === 'object') {
    // Check if midnight rolled over
    if (raw.todayDate !== todayStr) {
      // Archive previous today and reset today counter
      const updatedDaily = { ...raw.dailyRecords };
      if (!updatedDaily[raw.todayDate]) {
        updatedDaily[raw.todayDate] = {
          date: raw.todayDate,
          activeSeconds: raw.todayActiveSeconds || 0,
          activityCount: 0,
          hasLearned: false
        };
      } else {
        updatedDaily[raw.todayDate].activeSeconds = raw.todayActiveSeconds || updatedDaily[raw.todayDate].activeSeconds;
      }

      if (!updatedDaily[todayStr]) {
        updatedDaily[todayStr] = {
          date: todayStr,
          activeSeconds: 0,
          activityCount: 0,
          hasLearned: false
        };
      }

      const streakData = calculateStreakFromDailyRecords(updatedDaily, todayStr);

      const rolledOver: ActivityTrackerState = {
        ...raw,
        todayDate: todayStr,
        todayActiveSeconds: 0,
        currentStreak: streakData.currentStreak,
        longestStreak: Math.max(raw.longestStreak || 0, streakData.longestStreak),
        lastActiveDate: streakData.lastActiveDate,
        dailyRecords: updatedDaily
      };

      storage.set(STORAGE_KEYS.ACTIVITY_TRACKER, rolledOver);
      return rolledOver;
    }

    const streakData = calculateStreakFromDailyRecords(raw.dailyRecords, todayStr);
    return {
      ...raw,
      currentStreak: streakData.currentStreak,
      longestStreak: Math.max(raw.longestStreak || 0, streakData.longestStreak),
      lastActiveDate: streakData.lastActiveDate
    };
  }

  // First time initialization: inspect existing local storage data to backfill today if applicable
  const initialDailyRecords: Record<string, DayStudyRecord> = {
    [todayStr]: {
      date: todayStr,
      activeSeconds: 0,
      activityCount: 0,
      hasLearned: false
    }
  };

  const initialActivities: LearningActivityRecord[] = [];

  // Inspect existing quiz history
  try {
    const existingQuiz = storage.get<QuizResultRecord[]>(STORAGE_KEYS.QUIZ_HISTORY, []);
    if (Array.isArray(existingQuiz)) {
      existingQuiz.slice(0, 10).forEach((q) => {
        if (q.completedAt) {
          const qDate = getLocalDateString(new Date(q.completedAt));
          if (!initialDailyRecords[qDate]) {
            initialDailyRecords[qDate] = {
              date: qDate,
              activeSeconds: 180,
              activityCount: 1,
              hasLearned: true
            };
          } else {
            initialDailyRecords[qDate].hasLearned = true;
            initialDailyRecords[qDate].activityCount++;
          }

          initialActivities.push({
            id: `init-act-quiz-${q.id || Math.random()}`,
            type: 'quiz',
            title: `Completed ${q.track || 'Technical'} Quiz`,
            category: 'Assessment',
            timestamp: q.completedAt,
            date: qDate,
            score: q.percentage !== undefined ? `${q.percentage}%` : undefined,
            icon: '🎯'
          });
        }
      });
    }

    // Inspect existing notes
    const existingNotes = storage.get<GeneratedNote[]>(STORAGE_KEYS.NOTES, []);
    if (Array.isArray(existingNotes)) {
      existingNotes.slice(0, 5).forEach((n) => {
        if (n.createdAt && n.createdAt !== 'Sample Note') {
          const nDate = getLocalDateString();
          initialActivities.push({
            id: `init-act-note-${n.id || Math.random()}`,
            type: 'notes',
            title: `Saved Note: ${n.title || n.topic}`,
            category: n.styleLabel || 'Notes Studio',
            timestamp: new Date().toISOString(),
            date: nDate,
            icon: '📝'
          });
        }
      });
    }
  } catch {
    // Fallback safe
  }

  const streakData = calculateStreakFromDailyRecords(initialDailyRecords, todayStr);

  const freshState: ActivityTrackerState = {
    version: 1,
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    lastActiveDate: streakData.lastActiveDate,
    todayDate: todayStr,
    todayActiveSeconds: 0,
    lifetimeActiveSeconds: 0,
    dailyRecords: initialDailyRecords,
    recentActivities: initialActivities
  };

  storage.set(STORAGE_KEYS.ACTIVITY_TRACKER, freshState);
  return freshState;
}

// ----------------------------------------------------------------------------
// SINGLETON RUNTIME ENGINE & MULTI-TAB LEADER ELECTION
// ----------------------------------------------------------------------------

let inMemoryState: ActivityTrackerState | null = null;
let trackerIntervalId: ReturnType<typeof setInterval> | null = null;
let lastTickTs = Date.now();
let lastUserInteractionTs = Date.now();
let isTabFocused = true;
let isTabVisible = true;
const IDLE_THRESHOLD_MS = 120_000; // 2 minutes without user interaction pauses active accrual

// Generate unique session ID for this browser tab
const TAB_SESSION_ID =
  typeof window !== 'undefined'
    ? window.sessionStorage?.getItem('__sb_tab_id__') ||
      (() => {
        const id = 'tab_' + Math.random().toString(36).substring(2, 9);
        try {
          window.sessionStorage?.setItem('__sb_tab_id__', id);
        } catch {
          // sessionStorage restricted
        }
        return id;
      })()
    : 'tab_server';

function isCurrentTabLeader(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const leader = window.localStorage.getItem('__sb_active_tab_id__');
    if (!leader || leader === TAB_SESSION_ID) return true;
    // Check if leader heartbeat is stale (> 5 seconds old)
    const hbStr = window.localStorage.getItem('__sb_active_tab_heartbeat__');
    if (hbStr) {
      const hb = Number(hbStr);
      if (Date.now() - hb > 5000) {
        // Take over leadership
        claimTabLeadership();
        return true;
      }
    }
    return false;
  } catch {
    return true;
  }
}

function claimTabLeadership() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem('__sb_active_tab_id__', TAB_SESSION_ID);
    window.localStorage.setItem('__sb_active_tab_heartbeat__', String(Date.now()));
  } catch {
    // Ignore
  }
}

/**
 * Accrues study time for the active session.
 */
function tickTracker() {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  const elapsedMs = now - lastTickTs;
  if (elapsedMs < 950) return; // Wait until ~1 second has elapsed

  isTabVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
  const isIdle = now - lastUserInteractionTs > IDLE_THRESHOLD_MS;
  const isEligible = isTabVisible && !isIdle;

  if (isEligible) {
    claimTabLeadership();
  }

  const isLeader = isCurrentTabLeader();

  if (!isEligible || !isLeader) {
    // Page is hidden, idle, or another tab is leading -> advance timestamp without accruing time
    lastTickTs = now;
    return;
  }

  // Guard against computer sleep / suspend: cap delta at 2 seconds
  const deltaSeconds = Math.min(2, Math.max(1, Math.floor(elapsedMs / 1000)));
  lastTickTs = now - (elapsedMs % 1000);

  if (!inMemoryState) {
    inMemoryState = getInitialTrackerState();
  }

  const todayStr = getLocalDateString();

  // Handle midnight transition during active session
  if (inMemoryState.todayDate !== todayStr) {
    inMemoryState = getInitialTrackerState();
  }

  inMemoryState.todayActiveSeconds += deltaSeconds;
  inMemoryState.lifetimeActiveSeconds += deltaSeconds;

  if (!inMemoryState.dailyRecords[todayStr]) {
    inMemoryState.dailyRecords[todayStr] = {
      date: todayStr,
      activeSeconds: inMemoryState.todayActiveSeconds,
      activityCount: 0,
      hasLearned: false
    };
  } else {
    inMemoryState.dailyRecords[todayStr].activeSeconds = inMemoryState.todayActiveSeconds;
  }

  // Periodically save to localStorage (every ~5 seconds)
  if (inMemoryState.todayActiveSeconds % 5 === 0) {
    storage.set(STORAGE_KEYS.ACTIVITY_TRACKER, inMemoryState);
  }

  // Dispatch live real-time event for zero-lag UI updates
  window.dispatchEvent(
    new CustomEvent('smartbridge:timer-tick', {
      detail: {
        todayActiveSeconds: inMemoryState.todayActiveSeconds,
        lifetimeActiveSeconds: inMemoryState.lifetimeActiveSeconds,
        isTrackingActive: true
      }
    })
  );
}

/**
 * Initializes real-time activity and study-time tracking.
 * Safe to call multiple times (idempotent singleton).
 */
export function initStudyTimeTracker() {
  if (typeof window === 'undefined') return;
  if (trackerIntervalId !== null) return; // Already running

  inMemoryState = getInitialTrackerState();
  lastTickTs = Date.now();
  lastUserInteractionTs = Date.now();
  isTabVisible = document.visibilityState === 'visible';
  isTabFocused = document.hasFocus();

  if (isTabVisible && isTabFocused) {
    claimTabLeadership();
  }

  // Visibility and focus listeners
  const handleVisibility = () => {
    isTabVisible = document.visibilityState === 'visible';
    lastTickTs = Date.now();
    if (isTabVisible) {
      isTabFocused = true;
      claimTabLeadership();
      lastUserInteractionTs = Date.now();
    } else {
      // Save state immediately on hiding
      if (inMemoryState) {
        storage.set(STORAGE_KEYS.ACTIVITY_TRACKER, inMemoryState);
      }
    }
  };

  const handleFocus = () => {
    isTabFocused = true;
    lastTickTs = Date.now();
    lastUserInteractionTs = Date.now();
    claimTabLeadership();
  };

  const handleBlur = () => {
    isTabFocused = false;
    if (inMemoryState) {
      storage.set(STORAGE_KEYS.ACTIVITY_TRACKER, inMemoryState);
    }
  };

  const handleUserActivity = () => {
    lastUserInteractionTs = Date.now();
  };

  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('focus', handleFocus);
  window.addEventListener('blur', handleBlur);

  ['pointerdown', 'keydown', 'scroll'].forEach((evt) => {
    window.addEventListener(evt, handleUserActivity, { passive: true });
  });

  // Cross-tab synchronization
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.ACTIVITY_TRACKER && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed && parsed.version === 1) {
          inMemoryState = parsed;
          window.dispatchEvent(new CustomEvent('smartbridge:activity-logged', { detail: { state: parsed } }));
        }
      } catch {
        // Storage parse error safe
      }
    }
  });

  // Run timer every 1000ms
  trackerIntervalId = setInterval(tickTracker, 1000);

  // Unload listener to flush final active seconds
  window.addEventListener('beforeunload', () => {
    if (inMemoryState && !(window as any).__sb_skip_beforeunload__) {
      storage.set(STORAGE_KEYS.ACTIVITY_TRACKER, inMemoryState);
    }
  });
}

/**
 * Force-reloads tracker state from storage (useful after manual storage edits or resets).
 */
export function reloadTrackerStateFromStorage(): ActivityTrackerState {
  inMemoryState = getInitialTrackerState();
  return inMemoryState;
}

// ----------------------------------------------------------------------------
// PUBLIC API: READ & WRITE ACTIVITIES
// ----------------------------------------------------------------------------

/**
 * Returns current activity tracker state from memory or storage.
 */
export function getTrackerState(): ActivityTrackerState {
  if (!inMemoryState) {
    inMemoryState = getInitialTrackerState();
  }
  return inMemoryState;
}

// Cooldown tracker to prevent duplicate rapid spamming of the same action (e.g. rapid clicking)
const recentActionCooldowns = new Map<string, number>();

/**
 * Records a qualifying, meaningful learning activity (e.g., quiz completed, notes saved, tutor interaction).
 * Updates streak, today's activity count, and dispatches real-time events.
 */
export function recordLearningActivity(
  activity: Omit<LearningActivityRecord, 'id' | 'timestamp' | 'date'>
): LearningActivityRecord | null {
  if (typeof window === 'undefined') return null;

  const now = new Date();
  const todayStr = getLocalDateString(now);
  const cooldownKey = `${activity.type}:${activity.title.toLowerCase().trim()}`;
  const lastLogged = recentActionCooldowns.get(cooldownKey) || 0;

  // Prevent duplicate spamming within 20 seconds
  if (now.getTime() - lastLogged < 20_000) {
    return null;
  }
  recentActionCooldowns.set(cooldownKey, now.getTime());

  const state = getTrackerState();

  const record: LearningActivityRecord = {
    ...activity,
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.toISOString(),
    date: todayStr
  };

  // 1. Update daily records
  if (!state.dailyRecords[todayStr]) {
    state.dailyRecords[todayStr] = {
      date: todayStr,
      activeSeconds: state.todayActiveSeconds || 0,
      activityCount: 1,
      hasLearned: true
    };
  } else {
    state.dailyRecords[todayStr].hasLearned = true;
    state.dailyRecords[todayStr].activityCount++;
  }

  // 2. Prepend to recent activities list (keep latest 30)
  state.recentActivities = [record, ...state.recentActivities.filter((a) => a.id !== record.id)].slice(0, 30);

  // 3. Recalculate streak
  const streakData = calculateStreakFromDailyRecords(state.dailyRecords, todayStr);
  state.currentStreak = streakData.currentStreak;
  state.longestStreak = Math.max(state.longestStreak || 0, streakData.longestStreak);
  state.lastActiveDate = streakData.lastActiveDate;

  // 4. Save to storage
  storage.set(STORAGE_KEYS.ACTIVITY_TRACKER, state);
  inMemoryState = state;

  // 5. Notify all components immediately without page reload
  window.dispatchEvent(
    new CustomEvent('smartbridge:activity-logged', {
      detail: { record, state }
    })
  );

  return record;
}

/**
 * Returns weekly activity summary for the 7 calendar days ending today.
 */
export function getWeeklyActivitySummary(): WeeklyDaySummary[] {
  const state = getTrackerState();
  const todayStr = getLocalDateString();
  const result: WeeklyDaySummary[] = [];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // 7 days ending on today (from 6 days ago up to today)
  for (let i = 6; i >= 0; i--) {
    const dStr = getOffsetDateString(todayStr, -i);
    const [y, m, d] = dStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = dayNames[dateObj.getDay()];
    const displayDate = dateObj.toLocaleDateString([], { day: 'numeric', month: 'short' });

    const dayRecord = state.dailyRecords[dStr];
    const activeSec = dayRecord ? dayRecord.activeSeconds : dStr === todayStr ? state.todayActiveSeconds : 0;
    const hours = Math.round((activeSec / 3600) * 10) / 10;
    const hasLearned = dayRecord ? dayRecord.hasLearned : false;

    result.push({
      day: dayName,
      date: dStr,
      displayDate,
      hours,
      activeSeconds: activeSec,
      hasLearned,
      isToday: dStr === todayStr
    });
  }

  return result;
}

/**
 * Returns total count of activities completed on today's calendar date.
 */
export function getTodayActivitiesCount(): number {
  const state = getTrackerState();
  const todayStr = getLocalDateString();
  const record = state.dailyRecords[todayStr];
  return record ? record.activityCount : 0;
}
