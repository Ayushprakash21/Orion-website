import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  findLessonById,
  type Lesson,
  type LearningModule,
  LEARNING_MODULES,
} from '../../data/learningCurriculum';
import {
  isLessonCompleted,
  toggleLessonCompletion,
  setLastActiveLesson,
} from '../../services/learningProgress';
import {
  CheckCircle2,
  Circle,
  Clock,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Award,
  HelpCircle,
  Check,
  ChevronRight,
  Layers,
  Sparkles,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

interface LessonReaderViewProps {
  lessonId: string;
  onNavigate: (path: string) => void;
}

export const LessonReaderView: React.FC<LessonReaderViewProps> = ({
  lessonId,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(() =>
    isLessonCompleted(user?.uid, lessonId)
  );

  const lookup = findLessonById(lessonId);

  useEffect(() => {
    setIsCompleted(isLessonCompleted(user?.uid, lessonId));
    setShowAnswer(false);
    if (lookup) {
      setLastActiveLesson(user?.uid, lessonId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [lessonId, user?.uid]);

  if (!lookup) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl liquid-glass-subtle border border-[var(--glass-border)] flex items-center justify-center mx-auto text-sky-400">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[var(--orion-text-primary)]">
          Lesson Not Found
        </h2>
        <p className="text-xs text-[var(--orion-text-secondary)]">
          The requested lesson identifier <code className="font-mono text-sky-400">"{lessonId}"</code> does not exist in the Orion-9 curriculum.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/dashboard/learn')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Learning Center</span>
        </button>
      </div>
    );
  }

  const { lesson, module: currentModule, nextLessonId, prevLessonId } = lookup;

  const handleToggleCompletion = () => {
    const nextState = toggleLessonCompletion(user?.uid, lesson.id);
    setIsCompleted(nextState);
  };

  // Simple Markdown / Formatted Section Parser
  const renderFormattedContent = (content: string) => {
    // Split content into paragraphs or code blocks
    const blocks = content.split('\n\n');

    return blocks.map((block, index) => {
      const trimmed = block.trim();

      // Heading 2 (##)
      if (trimmed.startsWith('## ')) {
        return (
          <h2
            key={index}
            className="text-lg sm:text-xl font-bold text-[var(--orion-text-primary)] mt-8 mb-3 pb-2 border-b border-[var(--glass-border-subtle)]"
          >
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      // Heading 3 (###)
      if (trimmed.startsWith('### ')) {
        return (
          <h3
            key={index}
            className="text-base sm:text-lg font-bold text-[var(--orion-text-primary)] mt-6 mb-2 text-sky-400"
          >
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      // Code Block (``` ... ```)
      if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
        const lines = trimmed.split('\n');
        const lang = lines[0].replace('```', '').trim();
        const code = lines.slice(1, -1).join('\n');
        return (
          <div
            key={index}
            className="my-4 rounded-2xl overflow-hidden border border-[var(--glass-border-subtle)] bg-slate-950/80 font-mono text-xs"
          >
            {lang && (
              <div className="px-4 py-1.5 bg-white/5 border-b border-white/5 text-[10px] text-[var(--orion-text-muted)] uppercase tracking-wider flex items-center justify-between">
                <span>{lang}</span>
                <span className="text-[9px] text-sky-400">Deterministic Engine</span>
              </div>
            )}
            <pre className="p-4 overflow-x-auto text-sky-200 leading-relaxed font-mono">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Unordered List (- or *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').map((line) => line.replace(/^[-*]\s+/, '').trim());
        return (
          <ul key={index} className="my-3 space-y-2 text-sm text-[var(--orion-text-secondary)] pl-2">
            {items.map((item, itemIdx) => (
              <li key={itemIdx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 shrink-0" />
                <span className="leading-relaxed">{parseInlineMarkdown(item)}</span>
              </li>
            ))}
          </ul>
        );
      }

      // Numbered List (1. 2.)
      if (/^\d+\.\s+/.test(trimmed)) {
        const items = trimmed.split('\n').map((line) => line.replace(/^\d+\.\s+/, '').trim());
        return (
          <ol key={index} className="my-3 space-y-2 text-sm text-[var(--orion-text-secondary)] pl-2">
            {items.map((item, itemIdx) => (
              <li key={itemIdx} className="flex items-start gap-2.5">
                <span className="font-mono text-xs text-sky-400 font-bold mt-0.5 shrink-0">
                  {itemIdx + 1}.
                </span>
                <span className="leading-relaxed">{parseInlineMarkdown(item)}</span>
              </li>
            ))}
          </ol>
        );
      }

      // Regular Paragraph
      return (
        <p
          key={index}
          className="text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed my-3"
        >
          {parseInlineMarkdown(trimmed)}
        </p>
      );
    });
  };

  // Simple inline bolding & code parser
  const parseInlineMarkdown = (text: string): React.ReactNode => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded-md bg-white/10 text-sky-400 font-mono text-xs border border-white/10"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-[var(--orion-text-primary)]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Main Content Column */}
      <article className="lg:col-span-8 space-y-6">
        {/* Top Header Card */}
        <div className="rounded-3xl liquid-glass-elevated border border-[var(--glass-border)] p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20">
                {currentModule.code}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[var(--orion-text-muted)] border border-[var(--glass-border-subtle)]">
                {lesson.level}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[var(--orion-text-muted)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{lesson.durationMinutes} min read</span>
              </span>

              {/* Completion Toggle Button */}
              <button
                type="button"
                onClick={handleToggleCompletion}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs'
                    : 'liquid-glass-button text-[var(--orion-text-primary)] hover:border-sky-500/40'
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 text-[var(--orion-text-muted)]" />
                    <span>Mark Complete</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--orion-text-primary)]">
            {lesson.title}
          </h1>

          {/* Objective Box */}
          <div className="liquid-glass-subtle p-4 rounded-2xl border border-[var(--glass-border-subtle)] flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                Operational Objective
              </p>
              <p className="text-xs sm:text-sm text-[var(--orion-text-secondary)] leading-relaxed">
                {lesson.objective}
              </p>
            </div>
          </div>
        </div>

        {/* Lesson Body Content */}
        <div className="rounded-3xl liquid-glass-elevated border border-[var(--glass-border)] p-6 sm:p-8">
          <div className="prose prose-invert max-w-none">
            {renderFormattedContent(lesson.content)}
          </div>

          {/* Key Takeaways Highlight Box */}
          {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
            <div className="mt-8 rounded-2xl liquid-glass-subtle border border-sky-500/30 p-5 sm:p-6 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Key Operational Takeaways</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-[var(--orion-text-secondary)]">
                {lesson.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{parseInlineMarkdown(takeaway)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Knowledge Check / Scenario Checkpoint */}
          {lesson.scenarioCheck && (
            <div className="mt-8 rounded-2xl liquid-glass-subtle border border-amber-500/30 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Interactive Operational Scenario</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                  Self-Check
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-[var(--orion-text-primary)] leading-relaxed">
                {lesson.scenarioCheck.question}
              </p>

              {showAnswer ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 animate-in fade-in duration-200">
                  <p className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Authoritative SCM Resolution:
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--orion-text-secondary)] leading-relaxed">
                    {lesson.scenarioCheck.answer}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAnswer(false)}
                    className="text-xs text-[var(--orion-text-muted)] hover:text-amber-400 transition cursor-pointer pt-1"
                  >
                    Hide explanation
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAnswer(true)}
                  className="px-4 py-2 rounded-xl liquid-glass-button text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition cursor-pointer"
                >
                  Reveal Solution & Rationale
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Pagination & Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl liquid-glass-elevated border border-[var(--glass-border)]">
          {prevLessonId ? (
            <button
              type="button"
              onClick={() => onNavigate(`/dashboard/learn/lessons/${prevLessonId}`)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl liquid-glass-button text-xs font-medium text-[var(--orion-text-primary)] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Lesson</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('/dashboard/learn')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl liquid-glass-button text-xs font-medium text-[var(--orion-text-secondary)] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Learning Center</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleCompletion}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              isCompleted
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white shadow-md shadow-sky-600/25'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCompleted ? 'Marked as Completed ✓' : 'Mark as Completed'}</span>
          </button>

          {nextLessonId ? (
            <button
              type="button"
              onClick={() => onNavigate(`/dashboard/learn/lessons/${nextLessonId}`)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 text-xs font-semibold transition cursor-pointer"
            >
              <span>Next Lesson</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('/dashboard/progress')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold transition cursor-pointer"
            >
              <span>Curriculum Completed &rarr;</span>
            </button>
          )}
        </div>
      </article>

      {/* Module Syllabus Sidebar */}
      <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
        <div className="rounded-3xl liquid-glass-elevated border border-[var(--glass-border)] p-5 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-semibold">
              Current Module Syllabus
            </span>
            <h3 className="text-sm font-bold text-[var(--orion-text-primary)]">
              {currentModule.title}
            </h3>
            <p className="text-xs text-[var(--orion-text-muted)] font-mono">
              {currentModule.lessons.length} Lessons &bull; {currentModule.estimatedHours}
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[var(--glass-border-subtle)] max-h-[60vh] overflow-y-auto pr-1">
            {currentModule.lessons.map((item, idx) => {
              const active = item.id === lesson.id;
              const completed = isLessonCompleted(user?.uid, item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(`/dashboard/learn/lessons/${item.id}`)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                    active
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold'
                      : 'hover:bg-white/40 dark:hover:bg-white/5 text-[var(--orion-text-secondary)] border border-transparent'
                  }`}
                >
                  <span className="shrink-0 mt-0.5">
                    {completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-[var(--orion-text-muted)]" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate">{item.title}</p>
                    <p className="text-[10px] font-mono text-[var(--orion-text-muted)] mt-0.5">
                      {item.durationMinutes}m &bull; {item.level}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[var(--glass-border-subtle)]">
            <button
              type="button"
              onClick={() => onNavigate('/dashboard/learn')}
              className="w-full text-center py-2 text-xs text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
            >
              Browse All 8 Modules &rarr;
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
