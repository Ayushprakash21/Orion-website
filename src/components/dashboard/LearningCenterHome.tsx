import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LEARNING_MODULES,
  ALL_LESSON_IDS,
  type LearningModule,
  type Lesson,
} from '../../data/learningCurriculum';
import {
  getProgressState,
  calculateModuleProgress,
  calculateOverallProgress,
  isLessonCompleted,
} from '../../services/learningProgress';
import {
  GraduationCap,
  CheckCircle2,
  Circle,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BookOpen,
  Award,
  Sparkles,
  Layers,
  Compass,
} from 'lucide-react';

interface LearningCenterHomeProps {
  onNavigate: (path: string) => void;
}

export const LearningCenterHome: React.FC<LearningCenterHomeProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    // Expand the first module by default
    return { 'mod-01': true };
  });

  const [progressState, setProgressState] = useState(() => getProgressState(user?.uid));

  useEffect(() => {
    const handleUpdate = () => {
      setProgressState(getProgressState(user?.uid));
    };
    window.addEventListener('orion9:learning-progress-changed', handleUpdate);
    return () => {
      window.removeEventListener('orion9:learning-progress-changed', handleUpdate);
    };
  }, [user?.uid]);

  const overallMetrics = calculateOverallProgress(user?.uid, ALL_LESSON_IDS);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    LEARNING_MODULES.forEach((m) => {
      allExpanded[m.id] = true;
    });
    setExpandedModules(allExpanded);
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  // Filter modules and lessons
  const filteredModules = useMemo(() => {
    return LEARNING_MODULES.filter((module) => {
      const matchesSearch =
        searchQuery === '' ||
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.lessons.some(
          (l) =>
            l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (l.objective || l.summary || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

      const modLevel = (module.level || module.category || '').toLowerCase();
      const matchesLevel =
        selectedLevel === 'all' ||
        modLevel.includes(selectedLevel.toLowerCase());

      return matchesSearch && matchesLevel;
    });
  }, [searchQuery, selectedLevel]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden rounded-3xl liquid-glass-elevated border border-[var(--glass-border)] p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Orion-9 Academy & Certification Curriculum</span>
            </span>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--orion-text-primary)]">
              Orion-9 Learning Center
            </h1>

            <p className="text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed">
              Master the architecture, multi-window spatial desktop, 19 deterministic supply chain engines, and fail-closed security governing Orion-9 Enterprise.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--orion-text-muted)] pt-1">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>8 Structured Modules</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>41 Authoritative Lessons</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>~12 Hours Estimated</span>
              </span>
            </div>
          </div>

          {/* Progress Card */}
          <div className="liquid-glass-subtle rounded-2xl p-5 border border-[var(--glass-border-subtle)] shrink-0 lg:w-72 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--orion-text-muted)]">
                Academy Progress
              </p>
              <Award className="w-4 h-4 text-amber-400" />
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-[var(--orion-text-primary)] font-mono">
                {overallMetrics.percentage}%
              </span>
              <span className="text-xs text-[var(--orion-text-muted)] font-mono">
                {overallMetrics.completed} / {overallMetrics.total} Lessons
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-800/40 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${overallMetrics.percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => onNavigate('/dashboard/progress')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
              >
                Detailed Progress Report &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Search & Filter Bar */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--orion-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lessons by topic (e.g. ATP, 3-Way Match, Dynamic Island)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass-subtle border border-[var(--glass-border-subtle)] text-xs text-[var(--orion-text-primary)] placeholder-[var(--orion-text-muted)] focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Level Filters & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'fundamentals', 'architecture', 'mastery'].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition cursor-pointer ${
                selectedLevel === level
                  ? 'bg-sky-500 text-white font-semibold shadow-xs'
                  : 'liquid-glass-button text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)]'
              }`}
            >
              {level === 'all' ? 'All Levels' : level}
            </button>
          ))}

          <span className="hidden sm:inline-block h-4 w-px bg-[var(--glass-border-subtle)] mx-1" />

          <button
            type="button"
            onClick={expandAll}
            className="text-xs text-[var(--orion-text-muted)] hover:text-[var(--orion-text-primary)] transition cursor-pointer px-2 py-1"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs text-[var(--orion-text-muted)] hover:text-[var(--orion-text-primary)] transition cursor-pointer px-2 py-1"
          >
            Collapse All
          </button>
        </div>
      </section>

      {/* 3. Module Cards List */}
      <section className="space-y-6">
        {filteredModules.length === 0 ? (
          <div className="text-center py-12 rounded-2xl liquid-glass-subtle border border-[var(--glass-border-subtle)] p-6">
            <p className="text-sm text-[var(--orion-text-secondary)]">
              No lessons or modules match your search filter "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedLevel('all');
              }}
              className="mt-3 text-xs text-sky-400 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredModules.map((module, modIndex) => {
            const isExpanded = expandedModules[module.id] ?? false;
            const moduleMetrics = calculateModuleProgress(
              user?.uid,
              module.lessons.map((l) => l.id)
            );
            const isAllCompleted = moduleMetrics.completed === moduleMetrics.total && moduleMetrics.total > 0;

            return (
              <div
                key={module.id}
                id={module.id}
                className={`rounded-3xl liquid-glass-elevated border transition-all duration-200 overflow-hidden ${
                  isAllCompleted
                    ? 'border-emerald-500/30'
                    : 'border-[var(--glass-border)]'
                }`}
              >
                {/* Module Header Bar */}
                <div
                  onClick={() => toggleModule(module.id)}
                  className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <span className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-mono font-bold text-sm shrink-0">
                      {modIndex + 1}
                    </span>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20">
                          {module.code}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[var(--orion-text-muted)] border border-[var(--glass-border-subtle)]">
                          {module.level}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--orion-text-muted)]">
                          {module.estimatedHours}
                        </span>
                        {isAllCompleted && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-[var(--orion-text-primary)]">
                        {module.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--orion-text-secondary)] max-w-3xl">
                        {module.description}
                      </p>
                    </div>
                  </div>

                  {/* Module Progress & Toggle */}
                  <div className="flex items-center gap-5 self-end lg:self-center shrink-0">
                    <div className="text-right space-y-1">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-mono font-semibold text-[var(--orion-text-primary)]">
                          {moduleMetrics.completed}/{moduleMetrics.total}
                        </span>
                        <span className="text-[11px] text-[var(--orion-text-muted)]">
                          ({moduleMetrics.percentage}%)
                        </span>
                      </div>
                      <div className="w-24 sm:w-32 h-1.5 rounded-full bg-slate-800/40 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-sky-400 rounded-full transition-all duration-300"
                          style={{ width: `${moduleMetrics.percentage}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label={isExpanded ? 'Collapse module' : 'Expand module'}
                      className="p-2 rounded-xl liquid-glass-button text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)]"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Lessons List */}
                {isExpanded && (
                  <div className="border-t border-[var(--glass-border-subtle)] bg-[var(--orion-canvas)]/40 p-4 sm:p-6 space-y-3">
                    <div className="grid grid-cols-1 gap-2.5">
                      {module.lessons.map((lesson, lessonIdx) => {
                        const completed = isLessonCompleted(user?.uid, lesson.id);

                        return (
                          <div
                            key={lesson.id}
                            onClick={() => onNavigate(`/dashboard/learn/lessons/${lesson.id}`)}
                            className="p-3.5 rounded-2xl liquid-glass-subtle border border-[var(--glass-border-subtle)] hover:border-sky-500/40 hover:bg-white/40 dark:hover:bg-white/5 transition-all flex items-center justify-between gap-4 cursor-pointer group"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <span className="shrink-0">
                                {completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : (
                                  <Circle className="w-5 h-5 text-[var(--orion-text-muted)] group-hover:text-sky-400 transition-colors" />
                                )}
                              </span>

                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono text-[var(--orion-text-muted)] font-semibold">
                                    Lesson {lessonIdx + 1}
                                  </span>
                                  <span className="text-[10px] font-mono text-sky-400">
                                    {lesson.level}
                                  </span>
                                </div>
                                <h4 className="text-xs sm:text-sm font-semibold text-[var(--orion-text-primary)] group-hover:text-sky-400 transition-colors truncate">
                                  {lesson.title}
                                </h4>
                                <p className="text-[11px] text-[var(--orion-text-secondary)] line-clamp-1">
                                  {lesson.objective}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-[11px] font-mono text-[var(--orion-text-muted)] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{lesson.durationMinutes}m</span>
                              </span>

                              <span className="p-1.5 rounded-lg liquid-glass-button group-hover:bg-sky-500 group-hover:text-white transition-colors">
                                <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};
