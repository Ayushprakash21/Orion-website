import React, { useState, useMemo, useEffect } from 'react';
import articlesData from '../../data/docs/articles-bundle.json';
import {
  BookOpen,
  Search,
  ChevronRight,
  Sparkles,
  Layers,
  Terminal,
  ShieldCheck,
  Cpu,
  Sliders,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface OsUserManualViewProps {
  initialArticleKey?: string;
  onNavigate: (path: string) => void;
}

interface ArticleCategory {
  title: string;
  prefix: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: ArticleCategory[] = [
  { title: 'Getting Started', prefix: 'getting-started/', icon: Sparkles },
  { title: 'OS & Spatial Shell', prefix: 'os/', icon: Layers },
  { title: 'SCM Applications', prefix: 'applications/', icon: Cpu },
  { title: 'Core Architecture', prefix: 'architecture/', icon: Terminal },
  { title: 'Administration & Governance', prefix: 'administration/', icon: Sliders },
  { title: 'Enterprise Security', prefix: 'security/', icon: ShieldCheck },
  { title: 'Developer Reference', prefix: 'developers/', icon: Terminal },
];

export const OsUserManualView: React.FC<OsUserManualViewProps> = ({
  initialArticleKey,
  onNavigate,
}) => {
  const articles = articlesData as Record<string, string>;
  const articleKeys = Object.keys(articles);

  const [activeArticleKey, setActiveArticleKey] = useState<string>(() => {
    if (initialArticleKey && articles[initialArticleKey]) {
      return initialArticleKey;
    }
    // Check URL search params
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const art = sp.get('article');
      if (art && articles[art]) return art;
    }
    return 'getting-started/overview';
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialArticleKey && articles[initialArticleKey]) {
      setActiveArticleKey(initialArticleKey);
    }
  }, [initialArticleKey]);

  // Format key to title
  const formatArticleTitle = (key: string): string => {
    const rawContent = articles[key] || '';
    const firstLine = rawContent.split('\n')[0];
    if (firstLine && firstLine.startsWith('# ')) {
      return firstLine.replace('# ', '').trim();
    }
    const slug = key.split('/')[1] || key;
    return slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const filteredArticleKeys = useMemo(() => {
    if (!searchQuery.trim()) return articleKeys;
    const q = searchQuery.toLowerCase();
    return articleKeys.filter((key) => {
      const content = articles[key] || '';
      const title = formatArticleTitle(key).toLowerCase();
      return title.includes(q) || key.toLowerCase().includes(q) || content.toLowerCase().includes(q);
    });
  }, [searchQuery, articleKeys]);

  const activeContent = articles[activeArticleKey] || articles['getting-started/overview'];

  const selectArticle = (key: string) => {
    setActiveArticleKey(key);
    window.history.replaceState({}, '', `/dashboard/manual?article=${key}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Markdown renderer
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockLang = '';
    let codeBlockLines: string[] = [];
    let inTable = false;
    let tableLines: string[] = [];

    const flushCodeBlock = (key: number) => {
      if (codeBlockLines.length > 0) {
        elements.push(
          <div
            key={`code-${key}`}
            className="my-4 rounded-2xl overflow-hidden border border-[var(--glass-border-subtle)] bg-slate-950/80 font-mono text-xs"
          >
            {codeBlockLang && (
              <div className="px-4 py-1.5 bg-white/5 border-b border-white/5 text-[10px] text-[var(--orion-text-muted)] uppercase tracking-wider flex items-center justify-between">
                <span>{codeBlockLang}</span>
                <span className="text-[9px] text-sky-400">Verified System Spec</span>
              </div>
            )}
            <pre className="p-4 overflow-x-auto text-sky-200 leading-relaxed font-mono">
              <code>{codeBlockLines.join('\n')}</code>
            </pre>
          </div>
        );
        codeBlockLines = [];
      }
    };

    const flushTable = (key: number) => {
      if (tableLines.length > 0) {
        const rows = tableLines.map((row) =>
          row
            .split('|')
            .filter((_, i, arr) => i > 0 && i < arr.length - 1)
            .map((c) => c.trim())
        );

        if (rows.length >= 2) {
          const header = rows[0];
          const body = rows.slice(2); // Skip separator row

          elements.push(
            <div
              key={`table-${key}`}
              className="my-5 overflow-x-auto rounded-2xl border border-[var(--glass-border-subtle)] bg-[var(--orion-canvas)]/50"
            >
              <table className="w-full text-xs text-left">
                <thead className="bg-white/5 text-[var(--orion-text-primary)] font-semibold border-b border-[var(--glass-border-subtle)] font-mono">
                  <tr>
                    {header.map((col, idx) => (
                      <th key={idx} className="px-4 py-3">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border-subtle)] text-[var(--orion-text-secondary)]">
                  {body.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-2.5">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        tableLines = [];
      }
    };

    lines.forEach((line, index) => {
      // Code block start/end
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock(index);
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBlockLang = line.replace('```', '').trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      // Table line
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        tableLines.push(line.trim());
        return;
      } else if (inTable) {
        flushTable(index);
        inTable = false;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1
            key={index}
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--orion-text-primary)] mb-4"
          >
            {line.replace('# ', '')}
          </h1>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2
            key={index}
            className="text-lg sm:text-xl font-bold text-[var(--orion-text-primary)] mt-8 mb-3 pb-2 border-b border-[var(--glass-border-subtle)]"
          >
            {line.replace('## ', '')}
          </h2>
        );
        return;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3
            key={index}
            className="text-base sm:text-lg font-bold text-[var(--orion-text-primary)] mt-6 mb-2 text-sky-400"
          >
            {line.replace('### ', '')}
          </h3>
        );
        return;
      }

      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(
          <li
            key={index}
            className="text-sm text-[var(--orion-text-secondary)] list-disc ml-5 my-1 leading-relaxed"
          >
            {line.trim().replace(/^[-*]\s+/, '')}
          </li>
        );
        return;
      }

      // Regular text
      if (line.trim()) {
        elements.push(
          <p
            key={index}
            className="text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed my-2.5"
          >
            {line}
          </p>
        );
      }
    });

    if (inCodeBlock) flushCodeBlock(lines.length);
    if (inTable) flushTable(lines.length);

    return elements;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <section className="relative overflow-hidden rounded-3xl liquid-glass-elevated border border-[var(--glass-border)] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-3.5 h-3.5" />
              <span>44 Authoritative Technical Manuals</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--orion-text-primary)]">
              Orion-9 OS User Manual
            </h1>
            <p className="text-xs sm:text-sm text-[var(--orion-text-secondary)]">
              Comprehensive architectural guides, window management mechanics, 19 deterministic formulas, and operational runbooks.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/dashboard/documentation')}
            className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer shrink-0"
          >
            <span>Open Docs Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Two Column Layout: Sidebar + Article Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--orion-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 44 manual articles..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl liquid-glass-subtle border border-[var(--glass-border-subtle)] text-xs text-[var(--orion-text-primary)] placeholder-[var(--orion-text-muted)] focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Categories & Articles List */}
          <div className="rounded-3xl liquid-glass-elevated border border-[var(--glass-border)] p-4 space-y-4 max-h-[75vh] overflow-y-auto">
            {CATEGORIES.map((cat) => {
              const catArticles = filteredArticleKeys.filter((k) => k.startsWith(cat.prefix));
              if (catArticles.length === 0) return null;
              const Icon = cat.icon;

              return (
                <div key={cat.prefix} className="space-y-1.5">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.title}</span>
                    <span className="text-[10px] text-[var(--orion-text-muted)] ml-auto font-normal">
                      ({catArticles.length})
                    </span>
                  </div>

                  <div className="space-y-1">
                    {catArticles.map((k) => {
                      const isActive = k === activeArticleKey;
                      const title = formatArticleTitle(k);

                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => selectArticle(k)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                            isActive
                              ? 'bg-sky-500 text-white font-semibold shadow-xs'
                              : 'text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] hover:bg-white/40 dark:hover:bg-white/5'
                          }`}
                        >
                          <span className="truncate">{title}</span>
                          {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Article Reader Pane */}
        <main className="lg:col-span-8 rounded-3xl liquid-glass-elevated border border-[var(--glass-border)] p-6 sm:p-8 lg:p-10 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--glass-border-subtle)] text-xs font-mono text-[var(--orion-text-muted)]">
            <span className="text-sky-400 font-semibold">{activeArticleKey}</span>
            <span>Manual v9.0.0</span>
          </div>

          <div className="prose prose-invert max-w-none">
            {renderMarkdown(activeContent)}
          </div>

          <div className="pt-6 border-t border-[var(--glass-border-subtle)] flex items-center justify-between text-xs text-[var(--orion-text-muted)]">
            <span>Orion-9 Supply Chain Operating System</span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-sky-400 hover:underline cursor-pointer"
            >
              Back to top &uarr;
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
