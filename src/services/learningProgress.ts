/**
 * Orion-9 Learning Center — Progress & State Persistence Service
 *
 * Persists lesson completion, last active lesson, notes, and progress metrics
 * per authenticated user (keyed by user.uid) with fallback to guest storage.
 */

export interface LessonProgressState {
  completedLessonIds: string[];
  lastActiveLessonId: string | null;
  completedAt: Record<string, string>; // lessonId -> ISO timestamp
  lastUpdatedAt: string;
}

const STORAGE_KEY_PREFIX = 'orion9_learning_progress_';

function getStorageKey(userId?: string | null): string {
  const safeId = userId && userId.trim() ? userId.trim() : 'guest';
  return `${STORAGE_KEY_PREFIX}${safeId}`;
}

export function getProgressState(userId?: string | null): LessonProgressState {
  if (typeof window === 'undefined') {
    return {
      completedLessonIds: [],
      lastActiveLessonId: null,
      completedAt: {},
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) {
      return {
        completedLessonIds: [],
        lastActiveLessonId: null,
        completedAt: {},
        lastUpdatedAt: new Date().toISOString(),
      };
    }
    const parsed = JSON.parse(raw);
    return {
      completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [],
      lastActiveLessonId: typeof parsed.lastActiveLessonId === 'string' ? parsed.lastActiveLessonId : null,
      completedAt: parsed.completedAt && typeof parsed.completedAt === 'object' ? parsed.completedAt : {},
      lastUpdatedAt: parsed.lastUpdatedAt || new Date().toISOString(),
    };
  } catch (err) {
    console.warn('[LearningProgress] Failed to read state from localStorage:', err);
    return {
      completedLessonIds: [],
      lastActiveLessonId: null,
      completedAt: {},
      lastUpdatedAt: new Date().toISOString(),
    };
  }
}

export function saveProgressState(userId: string | null | undefined, state: LessonProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    const updated = {
      ...state,
      lastUpdatedAt: new Date().toISOString(),
    };
    localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
    // Dispatch custom event for reactive dashboard updates in the same window
    window.dispatchEvent(new CustomEvent('orion9:learning-progress-changed', { detail: updated }));
  } catch (err) {
    console.error('[LearningProgress] Failed to save state to localStorage:', err);
  }
}

export function isLessonCompleted(userId: string | null | undefined, lessonId: string): boolean {
  const state = getProgressState(userId);
  return state.completedLessonIds.includes(lessonId);
}

export function toggleLessonCompletion(userId: string | null | undefined, lessonId: string): boolean {
  const state = getProgressState(userId);
  const exists = state.completedLessonIds.includes(lessonId);
  let nextCompleted: string[];
  const nextCompletedAt = { ...state.completedAt };

  if (exists) {
    nextCompleted = state.completedLessonIds.filter((id) => id !== lessonId);
    delete nextCompletedAt[lessonId];
  } else {
    nextCompleted = [...state.completedLessonIds, lessonId];
    nextCompletedAt[lessonId] = new Date().toISOString();
  }

  saveProgressState(userId, {
    ...state,
    completedLessonIds: nextCompleted,
    completedAt: nextCompletedAt,
    lastActiveLessonId: lessonId,
  });

  return !exists;
}

export function setLessonCompleted(userId: string | null | undefined, lessonId: string, completed: boolean): void {
  const state = getProgressState(userId);
  const exists = state.completedLessonIds.includes(lessonId);
  if (exists === completed) return; // No change needed

  const nextCompleted = completed
    ? [...state.completedLessonIds, lessonId]
    : state.completedLessonIds.filter((id) => id !== lessonId);

  const nextCompletedAt = { ...state.completedAt };
  if (completed) {
    nextCompletedAt[lessonId] = new Date().toISOString();
  } else {
    delete nextCompletedAt[lessonId];
  }

  saveProgressState(userId, {
    ...state,
    completedLessonIds: nextCompleted,
    completedAt: nextCompletedAt,
    lastActiveLessonId: lessonId,
  });
}

export function setLastActiveLesson(userId: string | null | undefined, lessonId: string): void {
  const state = getProgressState(userId);
  if (state.lastActiveLessonId === lessonId) return;
  saveProgressState(userId, {
    ...state,
    lastActiveLessonId: lessonId,
  });
}

export function getLastActiveLesson(userId: string | null | undefined): string | null {
  return getProgressState(userId).lastActiveLessonId;
}

export function calculateModuleProgress(
  userId: string | null | undefined,
  moduleLessonIds: string[]
): { completed: number; total: number; percentage: number } {
  if (!moduleLessonIds || moduleLessonIds.length === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }
  const state = getProgressState(userId);
  const completedCount = moduleLessonIds.filter((id) => state.completedLessonIds.includes(id)).length;
  const percentage = Math.round((completedCount / moduleLessonIds.length) * 100);
  return {
    completed: completedCount,
    total: moduleLessonIds.length,
    percentage,
  };
}

export function calculateOverallProgress(
  userId: string | null | undefined,
  allLessonIds: string[]
): { completed: number; total: number; percentage: number } {
  return calculateModuleProgress(userId, allLessonIds);
}
