import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ORION_LEARNING_CURRICULUM,
  LEARNING_MODULES,
  ALL_LESSON_IDS,
  getAllLessons,
  getLessonById,
  getModuleById,
  getAdjacentLessons,
  findLessonById,
} from '../data/learningCurriculum.ts';
import {
  getProgressState,
  saveProgressState,
  toggleLessonCompletion,
  setLessonCompleted,
  isLessonCompleted,
  setLastActiveLesson,
  getLastActiveLesson,
  calculateModuleProgress,
  calculateOverallProgress,
} from '../services/learningProgress.ts';
import articlesData from '../data/docs/articles-bundle.json' with { type: 'json' };

// Mock localStorage for Node test runner
class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Attach mock globals
(globalThis as any).localStorage = new MockLocalStorage();
(globalThis as any).window = globalThis;
(globalThis as any).CustomEvent = class CustomEvent {
  type: string;
  detail: any;
  constructor(type: string, params: any = {}) {
    this.type = type;
    this.detail = params.detail;
  }
};
(globalThis as any).dispatchEvent = () => true;

describe('Orion-9 Learning Center & Curriculum Integrity', () => {
  it('should contain 8 structured modules in curriculum', () => {
    assert.equal(LEARNING_MODULES.length, 8);
    assert.equal(ORION_LEARNING_CURRICULUM.length, 8);
  });

  it('should contain 41 authoritative lessons across all modules', () => {
    const all = getAllLessons();
    assert.equal(all.length, 41);
    assert.equal(ALL_LESSON_IDS.length, 41);
  });

  it('should have unique lesson IDs across the entire curriculum', () => {
    const seen = new Set<string>();
    for (const id of ALL_LESSON_IDS) {
      assert.equal(seen.has(id), false, `Duplicate lesson ID found: ${id}`);
      seen.add(id);
    }
  });

  it('should provide comprehensive content and takeaways for every lesson', () => {
    const all = getAllLessons();
    for (const lesson of all) {
      assert.ok(lesson.id, 'Lesson must have an id');
      assert.ok(lesson.title && lesson.title.length > 3, `Lesson ${lesson.id} has invalid title`);
      assert.ok(lesson.content && lesson.content.length > 50, `Lesson ${lesson.id} has insufficient content`);
      assert.ok(Array.isArray(lesson.keyTakeaways) && lesson.keyTakeaways.length > 0, `Lesson ${lesson.id} missing takeaways`);
      assert.ok(lesson.estimatedMinutes > 0, `Lesson ${lesson.id} must have positive estimated duration`);
    }
  });

  it('findLessonById should return lesson, parent module, and correct adjacent navigation pointers', () => {
    const firstLesson = ALL_LESSON_IDS[0];
    const secondLesson = ALL_LESSON_IDS[1];
    const lastLesson = ALL_LESSON_IDS[ALL_LESSON_IDS.length - 1];

    const firstLookup = findLessonById(firstLesson);
    assert.ok(firstLookup);
    assert.equal(firstLookup.lesson.id, firstLesson);
    assert.equal(firstLookup.prevLessonId, undefined);
    assert.equal(firstLookup.nextLessonId, secondLesson);
    assert.equal(firstLookup.module.id, 'module-1');

    const lastLookup = findLessonById(lastLesson);
    assert.ok(lastLookup);
    assert.equal(lastLookup.lesson.id, lastLesson);
    assert.ok(lastLookup.prevLessonId);
    assert.equal(lastLookup.nextLessonId, undefined);
    assert.equal(lastLookup.module.id, 'module-8');
  });
});

describe('Orion-9 Learning Progress Persistence Service', () => {
  const testUid = 'test-operator-uid-42';

  it('should initialize empty state for a new user', () => {
    (globalThis as any).localStorage.clear();
    const state = getProgressState(testUid);
    assert.deepEqual(state.completedLessonIds, []);
    assert.equal(state.lastActiveLessonId, null);
  });

  it('should toggle lesson completion and persist to storage', () => {
    const lessonId = 'm1-l1';
    assert.equal(isLessonCompleted(testUid, lessonId), false);

    const isNowComplete = toggleLessonCompletion(testUid, lessonId);
    assert.equal(isNowComplete, true);
    assert.equal(isLessonCompleted(testUid, lessonId), true);

    const state = getProgressState(testUid);
    assert.ok(state.completedLessonIds.includes(lessonId));
    assert.ok(state.completedAt[lessonId]);

    // Toggle off
    const toggledOff = toggleLessonCompletion(testUid, lessonId);
    assert.equal(toggledOff, false);
    assert.equal(isLessonCompleted(testUid, lessonId), false);
  });

  it('should track last active lesson', () => {
    setLastActiveLesson(testUid, 'm2-l2');
    assert.equal(getLastActiveLesson(testUid), 'm2-l2');
  });

  it('should calculate module and overall progress percentages correctly', () => {
    (globalThis as any).localStorage.clear();
    const module1LessonIds = ['m1-l1', 'm1-l2', 'm1-l3', 'm1-l4'];

    let progress = calculateModuleProgress(testUid, module1LessonIds);
    assert.equal(progress.completed, 0);
    assert.equal(progress.total, 4);
    assert.equal(progress.percentage, 0);

    setLessonCompleted(testUid, 'm1-l1', true);
    setLessonCompleted(testUid, 'm1-l2', true);

    progress = calculateModuleProgress(testUid, module1LessonIds);
    assert.equal(progress.completed, 2);
    assert.equal(progress.total, 4);
    assert.equal(progress.percentage, 50);

    const overall = calculateOverallProgress(testUid, ALL_LESSON_IDS);
    assert.equal(overall.completed, 2);
    assert.equal(overall.total, 41);
    assert.equal(overall.percentage, 5); // Math.round(2 / 41 * 100) = 5
  });

  it('should isolate progress between different user UIDs', () => {
    const userA = 'operator-alpha';
    const userB = 'operator-bravo';

    setLessonCompleted(userA, 'm1-l1', true);
    setLessonCompleted(userB, 'm1-l1', false);

    assert.equal(isLessonCompleted(userA, 'm1-l1'), true);
    assert.equal(isLessonCompleted(userB, 'm1-l1'), false);
  });
});

describe('Orion-9 OS User Manual & Documentation Library', () => {
  it('should load all authoritative documentation articles (at least 44, actual 50)', () => {
    const articles = articlesData as Record<string, string>;
    const keys = Object.keys(articles);
    assert.equal(keys.length, 50);
  });

  it('should contain comprehensive content for every article', () => {
    const articles = articlesData as Record<string, string>;
    for (const [key, content] of Object.entries(articles)) {
      assert.ok(content.length > 100, `Article ${key} has insufficient content`);
      assert.ok(content.startsWith('# '), `Article ${key} must have top-level heading`);
    }
  });

  it('should cover key operational domains (getting started, os, applications, architecture, security)', () => {
    const articles = articlesData as Record<string, string>;
    const keys = Object.keys(articles);

    assert.ok(keys.some((k) => k.startsWith('getting-started/')));
    assert.ok(keys.some((k) => k.startsWith('os/')));
    assert.ok(keys.some((k) => k.startsWith('applications/')));
    assert.ok(keys.some((k) => k.startsWith('architecture/')));
    assert.ok(keys.some((k) => k.startsWith('security/')));
    assert.ok(keys.some((k) => k.startsWith('administration/')));
    assert.ok(keys.some((k) => k.startsWith('developers/')));
  });
});
