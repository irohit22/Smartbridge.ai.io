/**
 * SMART BRIDGE — Centralized LocalStorage Utility
 *
 * Provides safe, namespaced, and error-tolerant browser storage access.
 * Handles missing keys, corrupted JSON, and quota limitations gracefully.
 */

export const STORAGE_PREFIX = 'smartbridge_';

export const STORAGE_KEYS = {
  NOTES: `${STORAGE_PREFIX}notes_v1`,
  QUIZ_HISTORY: `${STORAGE_PREFIX}quiz_history_v1`,
  REVISION_TASKS: `${STORAGE_PREFIX}revision_tasks_v1`,
  USER_PROFILE: `${STORAGE_PREFIX}user_profile_v1`,
  CAREER_COMPASS: `${STORAGE_PREFIX}career_compass_v1`,
  CAREER_ANALYSIS: `${STORAGE_PREFIX}career_analysis_v1`,
  USER_SKILL: `${STORAGE_PREFIX}user_skill_v1`,
  ACTIVITY_TRACKER: `${STORAGE_PREFIX}activity_tracker_v1`
} as const;

export type StorageStatus = 'ok' | 'empty' | 'corrupted' | 'unavailable';

export interface StorageReadResult<T> {
  data: T;
  status: StorageStatus;
  warning?: string;
}

// Track any corrupted keys detected during the active session
const corruptedKeysLog = new Set<string>();

export const storage = {
  /**
   * Check if browser localStorage is available and writable.
   */
  isAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = '__sb_test_avail__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Safely retrieve and parse a value from localStorage with status metadata.
   * Warns when data is corrupted instead of silently discarding it.
   */
  getWithStatus<T>(key: string, fallback: T): StorageReadResult<T> {
    if (!this.isAvailable()) {
      return {
        data: fallback,
        status: 'unavailable',
        warning: 'Browser storage is disabled or unavailable. Working in session memory.'
      };
    }

    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null || raw === undefined) {
        return { data: fallback, status: 'empty' };
      }

      const parsed = JSON.parse(raw);
      return { data: parsed as T, status: 'ok' };
    } catch (err) {
      corruptedKeysLog.add(key);
      const warnMsg = `Corrupted data encountered in "${key}". Safely recovered default data.`;
      console.warn(`[SmartBridge Storage] ${warnMsg}`, err);
      return {
        data: fallback,
        status: 'corrupted',
        warning: warnMsg
      };
    }
  },

  /**
   * Safely retrieve and parse a value from localStorage.
   * Returns fallback if key is missing or parsing fails.
   */
  get<T>(key: string, fallback: T): T {
    return this.getWithStatus<T>(key, fallback).data;
  },

  /**
   * Safely serialize and store a value in localStorage.
   * Returns true if successful, false otherwise.
   */
  set<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) {
      console.warn(`[SmartBridge Storage] Storage unavailable. Could not save key "${key}".`);
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
      // Clear corruption flag for this key if successfully re-saved
      corruptedKeysLog.delete(key);
      return true;
    } catch (err) {
      console.error(`[SmartBridge Storage] Failed to write key "${key}":`, err);
      return false;
    }
  },

  /**
   * Remove a specific key from localStorage.
   */
  remove(key: string): boolean {
    if (!this.isAvailable()) return false;
    try {
      window.localStorage.removeItem(key);
      corruptedKeysLog.delete(key);
      return true;
    } catch (err) {
      console.error(`[SmartBridge Storage] Failed to remove key "${key}":`, err);
      return false;
    }
  },

  /**
   * Remove strictly all SMART BRIDGE namespaced keys from localStorage.
   * Never deletes or touches unrelated keys belonging to other websites/apps.
   */
  clearAllSmartBridge(): { deletedCount: number; deletedKeys: string[] } {
    if (!this.isAvailable()) return { deletedCount: 0, deletedKeys: [] };

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(k);
        }
      }

      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      corruptedKeysLog.clear();

      return { deletedCount: keysToRemove.length, deletedKeys: keysToRemove };
    } catch (err) {
      console.error('[SmartBridge Storage] Failed to clear SmartBridge storage keys:', err);
      return { deletedCount: 0, deletedKeys: [] };
    }
  },

  /**
   * Check if any keys are currently flagged as corrupted.
   */
  getCorruptedKeys(): string[] {
    return Array.from(corruptedKeysLog);
  },

  /**
   * Count total items currently stored across SmartBridge keys.
   */
  getDiagnostics(): {
    isAvailable: boolean;
    notesCount: number;
    quizAttemptsCount: number;
    tasksCount: number;
    corruptedKeysCount: number;
  } {
    const isAvail = this.isAvailable();
    if (!isAvail) {
      return {
        isAvailable: false,
        notesCount: 0,
        quizAttemptsCount: 0,
        tasksCount: 0,
        corruptedKeysCount: corruptedKeysLog.size
      };
    }

    try {
      const notes = storage.get<unknown[]>(STORAGE_KEYS.NOTES, []);
      const quiz = storage.get<unknown[]>(STORAGE_KEYS.QUIZ_HISTORY, []);
      const tasks = storage.get<unknown[]>(STORAGE_KEYS.REVISION_TASKS, []);
      return {
        isAvailable: true,
        notesCount: Array.isArray(notes) ? notes.length : 0,
        quizAttemptsCount: Array.isArray(quiz) ? quiz.length : 0,
        tasksCount: Array.isArray(tasks) ? tasks.length : 0,
        corruptedKeysCount: corruptedKeysLog.size
      };
    } catch {
      return {
        isAvailable: true,
        notesCount: 0,
        quizAttemptsCount: 0,
        tasksCount: 0,
        corruptedKeysCount: corruptedKeysLog.size
      };
    }
  }
};
