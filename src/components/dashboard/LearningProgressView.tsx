import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LEARNING_MODULES,
  ALL_LESSON_IDS,
} from '../../data/learningCurriculum';
import {
  getProgressState,
  saveProgressState,
  calculateModuleProgress,
  calculateOverallProgress,
  isLessonCompleted,
} from '../../services/learningProgress';
import {
  CheckCircle2,
  Circle,
  Award,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface LearningProgressViewProps {
  onNavigate: (path: string) => void;
}

export const LearningProgressView: React.FC<LearningProgressViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [progressState, setProgressState] = useState(() => getProgressState(user?.uid));
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

  const getReadinessTier = (percentage: number) => {
    if (percentage >= 95) {
      return {
        title: 'Principal Enterprise Architect',
        desc: 'Mastery across all 19 deterministic engines, kernel command bus, and fail-closed RBAC policies.',
        badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      };
    }
    if (percentage >= 70) {
      return {
        title: 'Senior Systems Specialist',
        desc: 'Advanced command of multi-window operations, ATP inventory algorithms, and 3-way matching.',
        badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      };
    }
    if (percentage >= 35) {
      return {
        title: 'Certified SCM Operator',
        desc: 'Competent in core purchasing, inbound receiving, ASN inspection, and Dynamic Island monitoring.',
        badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      };
    }
    return {
      title: 'SCM Operations Trainee',
      desc: 'Foundational introduction to the spatial desktop shell and deterministic supply chain concepts.',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    };
  };

  const tier = getReadinessTier(overallMetrics.percentage);

  const handleReset = () => {
    saveProgressState(user?.uid, {
      completedLessonIds: [],
      lastActiveLessonId: null,
      completedAt: {},
      lastUpdatedAt: new Date().toISOString(),
    });
    setProgressState(getProgressState(user?.uid));
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Readiness Tier */}
      <section className="relative overflow-hidden rounded-3xl liquid-glass-elevated border border-[var(--glass-border)] p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold border ${tier.badgeColor}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Current Status: {tier.title}</span>
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--orion-text-primary)]">
              Operator Learning Progress
            </h1>

            <p className="text-sm text-[var(--orion-text-secondary)] leading-relaxed">
              {tier.desc}
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-[var(--orion-text-muted)]">
              <span>{overallMetrics.completed} Completed</span>
              <span>&bull;</span>
              <span>{overallMetrics.total - overallMetrics.completed} Remaining</span>
              <span>&bull;</span>
              <span>{overallMetrics.total} Total Lessons</span>
            </div>
          </div>

          {/* Large Overall Progress Dial */}
          <div className="liquid-glass-subtle rounded-2xl p-6 border border-[var(--glass-border-subtle)] shrink-0 lg:w-80 space-y-4 text-center">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--orion-text-muted)]">
              Overall Curriculum Mastery
            </p>

            <div className="text-5xl font-extrabold font-mono text-sky-400">
              {overallMetrics.percentage}%
            </div>

            <div className="w-full h-3 rounded-full bg-slate-800/40 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${overallMetrics.percentage}%` }}
              />
            </div>

            <div className="pt-1 flex items-center justify-between text-xs text-[var(--orion-text-muted)]">
              <span>0% Start</span>
              <span className="font-semibold text-[var(--orion-text-primary)] font-mono">
                {overallMetrics.completed} of {overallMetrics.total}
              </span>
              <span>100% Certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Module Breakdown Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-[var(--orion-text-primary)] flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Curriculum Module Breakdown</span>
          </h2>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>
        </div>

        {/* Confirmation Modal */}
        {showResetConfirm && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-150">
            <p className="text-xs text-rose-300">
              Are you sure you want to reset all lesson completion records for this account? This cannot be undone.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-xl liquid-glass-button text-xs font-medium text-[var(--orion-text-primary)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {LEARNING_MODULES.map((module) => {
            const metrics = calculateModuleProgress(
              user?.uid,
              module.lessons.map((l) => l.id)
            );
            const isCompleted = metrics.completed === metrics.total && metrics.total > 0;

            return (
              <div
                key={module.id}
                className="rounded-2xl liquid-glass-elevated border border-[var(--glass-border)] p-5 hover:border-sky-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20">
                      {module.code}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--orion-text-muted)]">
                      {module.level}
                    </span>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[var(--orion-text-primary)]">
                    {module.title}
                  </h3>
                  <p className="text-xs text-[var(--orion-text-secondary)] line-clamp-1">
                    {module.description}
                  </p>
                </div>

                <div className="flex items-center gap-6 shrink-0 self-end md:self-center">
                  <div className="text-right space-y-1 min-w-[120px]">
                    <div className="flex items-center justify-end gap-2 text-xs font-mono">
                      <span className="font-semibold text-[var(--orion-text-primary)]">
                        {metrics.completed}/{metrics.total}
                      </span>
                      <span className="text-[var(--orion-text-muted)]">
                        ({metrics.percentage}%)
                      </span>
                    </div>
                    <div className="w-28 h-2 rounded-full bg-slate-800/40 dark:bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-400' : 'bg-sky-400'
                        }`}
                        style={{ width: `${metrics.percentage}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate(`/dashboard/learn#${module.id}`)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl liquid-glass-button text-xs font-semibold text-sky-400 hover:text-sky-300 cursor-pointer"
                  >
                    <span>{metrics.completed > 0 ? 'Review' : 'Start'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
