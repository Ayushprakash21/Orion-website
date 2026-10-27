import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ALL_LESSON_IDS,
  LEARNING_MODULES,
  findLessonById,
} from '../../data/learningCurriculum';
import {
  getProgressState,
  calculateOverallProgress,
  getLastActiveLesson,
  type LessonProgressState,
} from '../../services/learningProgress';
import {
  Sparkles,
  GraduationCap,
  BookOpen,
  FileText,
  CheckCircle2,
  Download,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight,
  Clock,
  Compass,
  Cpu,
  Terminal,
  ExternalLink,
} from 'lucide-react';

interface UserDashboardHomeProps {
  onNavigate: (path: string) => void;
  onOpenDownload?: () => void;
}

export const UserDashboardHome: React.FC<UserDashboardHomeProps> = ({
  onNavigate,
  onOpenDownload,
}) => {
  const { user, username, isAdmin, launchOrion, destinationUrl } = useAuth();
  const [progress, setProgress] = useState<LessonProgressState>(() =>
    getProgressState(user?.uid)
  );

  useEffect(() => {
    const handleProgressUpdate = () => {
      setProgress(getProgressState(user?.uid));
    };
    window.addEventListener('orion9:learning-progress-changed', handleProgressUpdate);
    return () => {
      window.removeEventListener('orion9:learning-progress-changed', handleProgressUpdate);
    };
  }, [user?.uid]);

  const displayName = user?.displayName || username || user?.email?.split('@')[0] || 'Operator';
  const roleLabel = isAdmin ? 'System Administrator' : 'Enterprise SCM Operator';

  const overallMetrics = calculateOverallProgress(user?.uid, ALL_LESSON_IDS);

  // Determine active/continue lesson
  const lastActiveId = getLastActiveLesson(user?.uid);
  const activeLessonResult = lastActiveId
    ? findLessonById(lastActiveId)
    : findLessonById(ALL_LESSON_IDS[0]);

  const activeLesson = activeLessonResult?.lesson || LEARNING_MODULES[0].lessons[0];
  const activeModule = activeLessonResult?.module || LEARNING_MODULES[0];

  const handleLaunch = () => {
    launchOrion(destinationUrl);
  };

  const handleDownload = () => {
    if (onOpenDownload) {
      onOpenDownload();
    } else {
      onNavigate('/download');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Welcome & Status Banner */}
      <section className="relative overflow-hidden rounded-3xl macos-window border border-[var(--glass-border)] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--glass-border-subtle)] bg-white/20 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="macos-traffic-lights" aria-hidden="true">
              <span className="macos-traffic-light close" />
              <span className="macos-traffic-light minimize" />
              <span className="macos-traffic-light zoom" />
            </div>
            <span className="text-[11px] font-mono tracking-wider text-[var(--orion-text-muted)] font-semibold uppercase">
              ORION-9 WORKSPACE COCKPIT · v9.0.0
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>19 SCM Engines Operational</span>
          </span>
        </div>

        <div className="p-6 sm:p-8 lg:p-10 relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{roleLabel}</span>
              </span>
              <span className="sm:hidden inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Activity className="w-3 h-3 animate-pulse" />
                <span>19 SCM Engines</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--orion-text-primary)]">
              Welcome back, <span className="text-sky-400">{displayName}</span>
            </h1>

            <p className="text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed">
              Your supply chain workstation is ready. Launch the multi-window Orion-9 Operating System to manage procurement corridors, real-time ATP inventory, and automated 3-way matching.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleLaunch}
                className="macos-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-semibold cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Orion-9 OS</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate(`/dashboard/learn/lessons/${activeLesson.id}`)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl liquid-glass-button text-sm font-medium text-[var(--orion-text-primary)] cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-sky-400" />
                <span>{overallMetrics.completed > 0 ? 'Resume Learning' : 'Start Learning Center'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="liquid-glass-subtle rounded-2xl p-5 border border-[var(--glass-border-subtle)] shrink-0 lg:w-72 space-y-4">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--orion-text-muted)]">
              Curriculum Mastery
            </p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-[var(--orion-text-primary)] font-mono">
                {overallMetrics.percentage}%
              </span>
              <span className="text-xs text-[var(--orion-text-muted)] font-mono">
                {overallMetrics.completed} / {overallMetrics.total} Lessons
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800/40 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${overallMetrics.percentage}%` }}
              />
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/dashboard/progress')}
              className="w-full flex items-center justify-between text-xs text-sky-400 hover:text-sky-300 font-medium cursor-pointer pt-1"
            >
              <span>View Progress Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Six Primary Feature Overview Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-[var(--orion-text-primary)] flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Workspace Command Hub</span>
          </h2>
          <span className="text-xs text-[var(--orion-text-muted)] font-mono">6 Connected Modules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Continue Learning */}
          <div className="rounded-2xl liquid-glass-elevated border border-[var(--glass-border)] p-5 flex flex-col justify-between hover:border-sky-500/40 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-[var(--orion-text-muted)] border border-[var(--glass-border-subtle)]">
                  {activeModule.code}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--orion-text-primary)] group-hover:text-sky-400 transition-colors">
                  Continue Learning
                </h3>
                <p className="text-xs text-[var(--orion-text-secondary)] mt-1 line-clamp-2">
                  Pick up where you left off in <span className="text-[var(--orion-text-primary)] font-medium">{activeLesson.title}</span>.
                </p>
              </div>
              <div className="liquid-glass-subtle p-3 rounded-xl border border-[var(--glass-border-subtle)] space-y-1.5">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--orion-text-muted)]">
                  Active Lesson
                </p>
                <p className="text-xs font-semibold text-[var(--orion-text-primary)] truncate">
                  {activeLesson.title}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-[var(--orion-text-muted)]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{activeLesson.durationMinutes}m read</span>
                  </span>
                  <span>&bull;</span>
                  <span>{activeLesson.level}</span>
                </div>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-[var(--glass-border-subtle)]">
              <button
                type="button"
                onClick={() => onNavigate(`/dashboard/learn/lessons/${activeLesson.id}`)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold transition-all cursor-pointer"
              >
                <span>{overallMetrics.completed > 0 ? 'Resume Lesson' : 'Start First Lesson'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: OS User Manual */}
          <div className="rounded-2xl liquid-glass-elevated border border-[var(--glass-border)] p-5 flex flex-col justify-between hover:border-sky-500/40 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <BookOpen className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-[var(--orion-text-muted)] border border-[var(--glass-border-subtle)]">
                  44 Articles
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--orion-text-primary)] group-hover:text-emerald-400 transition-colors">
                  OS User Manual
                </h3>
                <p className="text-xs text-[var(--orion-text-secondary)] mt-1">
                  Authoritative guides on the window manager, Dynamic Island, keyboard shortcuts, and control systems.
                </p>
              </div>
              <div className="space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('/dashboard/manual?article=os/window-management')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg liquid-glass-subtle hover:bg-white/10 text-xs text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] transition flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">Window Geometry & Stacking</span>
                  <ChevronRight className="w-3 h-3 shrink-0 opacity-60" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/dashboard/manual?article=os/dynamic-island')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg liquid-glass-subtle hover:bg-white/10 text-xs text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] transition flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">Dynamic Island Telemetry</span>
                  <ChevronRight className="w-3 h-3 shrink-0 opacity-60" />
                </button>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-[var(--glass-border-subtle)]">
              <button
                type="button"
                onClick={() => onNavigate('/dashboard/manual')}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Browse Full Manual</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Documentation Library */}
          <div className="rounded-2xl liquid-glass-elevated border border-[var(--glass-border)] p-5 flex flex-col justify-between hover:border-sky-500/40 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <FileText className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-[var(--orion-text-muted)] border border-[var(--glass-border-subtle)]">
                  SCM Specs
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--orion-text-primary)] group-hover:text-indigo-400 transition-colors">
                  Documentation Library
                </h3>
                <p className="text-xs text-[var(--orion-text-secondary)] mt-1">
                  Searchable architectural specifications for 19 deterministic engines, Firestore schemas, and EDI.
                </p>
              </div>
              <div className="space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('/dashboard/documentation?category=Architecture')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg liquid-glass-subtle hover:bg-white/10 text-xs text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] transition flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">Micro-Kernel & Command Bus</span>
                  <ChevronRight className="w-3 h-3 shrink-0 opacity-60" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/dashboard/documentation?category=Engines')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg liquid-glass-subtle hover:bg-white/10 text-xs text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] transition flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">19 SCM Mathematical Engines</span>
                  <ChevronRight className="w-3 h-3 shrink-0 opacity-60" />
                </button>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-[var(--glass-border-subtle)]">
              <button
                type="button"
                onClick={() => onNavigate('/dashboard/documentation')}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Search Documentation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 4: Learning Progress */}
          <div className="rounded-2xl liquid-glass-elevated border border-[var(--glass-border)] p-5 flex flex-col justify-between hover:border-sky-500/40 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {overallMetrics.percentage}% Complete
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--orion-text-primary)] group-hover:text-amber-400 transition-colors">
                  Learning Progress
                </h3>
                <p className="text-xs text-[var(--orion-text-secondary)] mt-1">
                  Track your certified operator progress across all 8 modules and 41 comprehensive curriculum lessons.
                </p>
              </div>
              <div className="liquid-glass-subtle p-3 rounded-xl border border-[var(--glass-border-subtle)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--orion-text-muted)] font-mono">Lessons Completed</span>
                  <span className="font-semibold text-[var(--orion-text-primary)] font-mono">
                    {overallMetrics.completed} / {overallMetrics.total}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800/40 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${overallMetrics.percentage}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-[var(--glass-border-subtle)]">
              <button
                type="button"
                onClick={() => onNavigate('/dashboard/progress')}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold transition-all cursor-pointer"
              >
                <span>View Progress & Badges</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 5: Getting Started Checklist */}
          <div className="rounded-2xl liquid-glass-elevated border border-[var(--glass-border)] p-5 flex flex-col justify-between hover:border-sky-500/40 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                  <Compass className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-[var(--orion-text-muted)] border border-[var(--glass-border-subtle)]">
                  Onboarding
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--orion-text-primary)] group-hover:text-cyan-400 transition-colors">
                  Getting Started Checklist
                </h3>
                <p className="text-xs text-[var(--orion-text-secondary)] mt-1">
                  Master the 4 fundamental workflows every enterprise SCM operator must know.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-[var(--orion-text-secondary)] pt-1">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[10px] flex items-center justify-center">1</span>
                  <span>Explore Window Manager & Dock</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[10px] flex items-center justify-center">2</span>
                  <span>Inspect Dynamic Island Telemetry</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[10px] flex items-center justify-center">3</span>
                  <span>Test 3-Way Match & Inventory ATP</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 mt-2 border-t border-[var(--glass-border-subtle)]">
              <button
                type="button"
                onClick={() => onNavigate('/dashboard/manual?article=getting-started/quick-start')}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Follow Quick Start</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 6: Latest Resources & Downloads */}
          <div className="rounded-2xl liquid-glass-elevated border border-[var(--glass-border)] p-5 flex flex-col justify-between hover:border-sky-500/40 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <Download className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  v9.0.0 Stable
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--orion-text-primary)] group-hover:text-purple-400 transition-colors">
                  Desktop & Resources
                </h3>
                <p className="text-xs text-[var(--orion-text-secondary)] mt-1">
                  Download the high-performance native desktop workstation for Windows x64 and macOS.
                </p>
              </div>
              <div className="liquid-glass-subtle p-3 rounded-xl border border-[var(--glass-border-subtle)] space-y-1">
                <p className="text-[11px] font-semibold text-[var(--orion-text-primary)] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Native Tauri v2 Workstation</span>
                </p>
                <p className="text-[11px] text-[var(--orion-text-muted)]">
                  Zero-origin sandbox, offline IndexedDB sync, and multi-window hardware acceleration.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-[var(--glass-border-subtle)]">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Download Desktop Installer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Quick Curriculum Snapshot */}
      <section className="rounded-3xl liquid-glass-elevated border border-[var(--glass-border)] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--orion-text-primary)]">
              Learning Modules Overview
            </h2>
            <p className="text-xs text-[var(--orion-text-secondary)] mt-0.5">
              8 structured modules designed for supply chain operators, engineers, and platform administrators.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/dashboard/learn')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition cursor-pointer"
          >
            <span>View Full Curriculum</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LEARNING_MODULES.map((module) => {
            const modMetrics = calculateOverallProgress(
              user?.uid,
              module.lessons.map((l) => l.id)
            );
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => onNavigate(`/dashboard/learn#${module.id}`)}
                className="p-4 rounded-2xl liquid-glass-subtle border border-[var(--glass-border-subtle)] hover:border-sky-500/40 text-left transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-semibold">
                      {module.code}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--orion-text-muted)]">
                      {modMetrics.completed}/{modMetrics.total}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[var(--orion-text-primary)] group-hover:text-sky-400 transition-colors line-clamp-1">
                    {module.title}
                  </h4>
                  <p className="text-[11px] text-[var(--orion-text-secondary)] line-clamp-2">
                    {module.description}
                  </p>
                </div>
                <div className="pt-3 mt-2 border-t border-[var(--glass-border-subtle)]">
                  <div className="w-full h-1 rounded-full bg-slate-800/40 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-sky-400 rounded-full"
                      style={{ width: `${modMetrics.percentage}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
