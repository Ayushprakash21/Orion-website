import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { DocsBreadcrumbs } from './DocsBreadcrumbs';
import { DocsTableOfContents } from './DocsTableOfContents';
import { DesktopTourDemo } from './DesktopTourDemo';
import { DataFlowExplorerDemo } from './DataFlowExplorerDemo';
import { ControlTowerDemo } from './ControlTowerDemo';
import { CopilotInteractionDemo } from './CopilotInteractionDemo';
import { SecurityExplorerDemo } from './SecurityExplorerDemo';

import articlesBundleData from '../../data/docs/articles-bundle.json';
import navigationData from '../../data/docs/navigation.json';

interface DocsArticleViewProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const DocsArticleView: React.FC<DocsArticleViewProps> = ({
  currentPath,
  onNavigate,
}) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Normalize key (e.g., "/docs/getting-started/overview" -> "getting-started/overview")
  const articleKey = currentPath.replace(/^\/docs\/?/, '') || 'getting-started/overview';

  const rawMarkdown =
    (articlesBundleData as Record<string, string>)[articleKey] ||
    (articlesBundleData as Record<string, string>)['getting-started/overview'] ||
    '# Document Not Found\n\nThe requested documentation article is currently being updated.';

  // Resolve category and item info from navigation tree
  const { currentCategory, currentItem, prevItem, nextItem } = useMemo(() => {
    let cat = 'Documentation';
    let item: { id: string; title: string; path: string } | null = null;
    let prev: { id: string; title: string; path: string } | null = null;
    let next: { id: string; title: string; path: string } | null = null;

    const flattened: { id: string; title: string; path: string; category: string }[] = [];
    navigationData.forEach((s) => {
      s.items.forEach((it) => {
        flattened.push({ ...it, category: s.category });
      });
    });

    const currIdx = flattened.findIndex((f) => f.path === currentPath);
    if (currIdx !== -1) {
      item = flattened[currIdx];
      cat = flattened[currIdx].category;
      if (currIdx > 0) prev = flattened[currIdx - 1];
      if (currIdx < flattened.length - 1) next = flattened[currIdx + 1];
    }

    return { currentCategory: cat, currentItem: item, prevItem: prev, nextItem: next };
  }, [currentPath]);

  // Extract article title from first line
  const articleTitle = useMemo(() => {
    const firstLine = rawMarkdown.split('\n')[0];
    return firstLine.replace(/^#\s+/, '') || currentItem?.title || 'Documentation Article';
  }, [rawMarkdown, currentItem]);

  // Copy code handler
  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Check if interactive demonstration should be embedded for this route
  const renderInteractiveDemo = () => {
    if (currentPath.startsWith('/docs/os')) {
      return <DesktopTourDemo onNavigate={onNavigate} />;
    }
    if (currentPath === '/docs/applications/control-tower') {
      return <ControlTowerDemo onNavigate={onNavigate} />;
    }
    if (currentPath === '/docs/applications/copilot') {
      return <CopilotInteractionDemo onNavigate={onNavigate} />;
    }
    if (
      currentPath === '/docs/applications/integrations' ||
      currentPath === '/docs/architecture/integration-fabric' ||
      currentPath === '/docs/architecture/system-overview'
    ) {
      return <DataFlowExplorerDemo onNavigate={onNavigate} />;
    }
    if (currentPath.startsWith('/docs/security')) {
      return <SecurityExplorerDemo onNavigate={onNavigate} />;
    }
    return null;
  };

  // Standard Markdown renderer matching the main website's editorial design system
  const renderMarkdownContent = () => {
    const lines = rawMarkdown.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeBuffer: string[] = [];
    let codeBlockCount = 0;
    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = () => {
      if (tableRows.length === 0) return;
      const header = tableRows[0];
      const body = tableRows.slice(1).filter((r) => !r.every((c) => /^[-:]+$/.test(c.trim())));

      elements.push(
        <div key={`table-${elements.length}`} className="my-6 overflow-x-auto rounded-2xl border border-[var(--glass-border-subtle)] liquid-glass shadow-xs">
          <table className="w-full text-left text-xs font-sans">
            <thead className="border-b border-[var(--glass-border-subtle)] bg-white/60 dark:bg-black/30 text-[var(--orion-text-primary)]">
              <tr>
                {header.map((col, i) => (
                  <th key={i} className="px-4 py-3 font-bold text-[var(--orion-accent)]">
                    {col.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border-subtle)] text-[var(--orion-text-secondary)]">
              {body.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 leading-relaxed">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    };

    lines.forEach((line, index) => {
      // Code block start / end
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          if (inTable) flushTable();
          inCodeBlock = true;
          codeLanguage = line.replace('```', '').trim();
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          const codeString = codeBuffer.join('\n');
          const currentIdx = codeBlockCount++;
          elements.push(
            <div key={`code-${index}`} className="my-6 rounded-2xl border border-[#1E293B] bg-[#070B19] overflow-hidden shadow-xl text-slate-200">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1E293B] bg-[#0A101D] text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 mr-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                  </div>
                  <span className="uppercase tracking-wider text-[#38BDF8] font-bold">
                    {codeLanguage || 'SOURCE'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeString, currentIdx)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition cursor-pointer font-sans"
                >
                  {copiedCodeIndex === currentIdx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 sm:p-5 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed">
                <code>{codeString}</code>
              </pre>
            </div>
          );
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Markdown Table rows
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        const cols = line
          .trim()
          .slice(1, -1)
          .split('|');
        tableRows.push(cols);
        return;
      } else if (inTable) {
        flushTable();
      }

      // Skip H1 (rendered in header)
      if (line.startsWith('# ')) {
        return;
      }

      // H2 Heading
      if (line.startsWith('## ')) {
        const text = line.replace('## ', '').trim();
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        elements.push(
          <h2
            key={`h2-${index}`}
            id={id}
            className="text-xl sm:text-2xl font-editorial font-bold text-[var(--orion-text-primary)] mt-12 mb-4 pt-4 border-t border-[var(--glass-border-subtle)] scroll-mt-24"
          >
            {text}
          </h2>
        );
        return;
      }

      // H3 Heading
      if (line.startsWith('### ')) {
        const text = line.replace('### ', '').trim();
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        elements.push(
          <h3 key={`h3-${index}`} id={id} className="text-base sm:text-lg font-bold text-[var(--orion-accent)] mt-8 mb-2 scroll-mt-24 font-sans">
            {text}
          </h3>
        );
        return;
      }

      // Blockquotes / Tips
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={`quote-${index}`} className="my-4 p-4 rounded-xl liquid-glass-elevated border-l-4 border-[var(--orion-accent)] text-xs sm:text-sm text-[var(--orion-text-secondary)] font-sans leading-relaxed">
            {line.replace(/^>\s+/, '')}
          </blockquote>
        );
        return;
      }

      // Unordered list
      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={`li-${index}`} className="ml-5 list-disc text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed my-1.5 font-sans">
            {line.replace(/^[-*]\s+/, '')}
          </li>
        );
        return;
      }

      // Ordered list
      const numMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (numMatch) {
        elements.push(
          <li key={`oli-${index}`} className="ml-5 list-decimal text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed my-1.5 font-sans">
            {numMatch[2]}
          </li>
        );
        return;
      }

      // Blank line
      if (!line.trim()) {
        return;
      }

      // Normal paragraph
      elements.push(
        <p key={`p-${index}`} className="text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed my-4 font-sans">
          {line}
        </p>
      );
    });

    if (inTable) flushTable();
    return elements;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20">
      {/* Main Content Column */}
      <article className="flex-1 min-w-0 max-w-4xl">
        <DocsBreadcrumbs
          category={currentCategory}
          title={articleTitle}
          onNavigate={onNavigate}
        />

        {/* Article Metadata Bar */}
        <header className="space-y-4 pb-6 border-b border-[var(--glass-border-subtle)]">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-sans">
            <span className="px-3 py-1 rounded-full liquid-glass-badge text-[var(--orion-accent)] font-semibold text-xs">
              {currentCategory}
            </span>
            <span className="opacity-40">·</span>
            <span className="text-[var(--orion-text-muted)] flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>4 min read</span>
            </span>
            <span className="opacity-40">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Implementation</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-editorial font-bold text-[var(--orion-text-primary)] tracking-tight leading-tight">
            {articleTitle}
          </h1>
        </header>

        {/* Embedded Interactive Demonstration (if applicable) */}
        {renderInteractiveDemo()}

        {/* Rendered Documentation Text */}
        <div className="pt-6">{renderMarkdownContent()}</div>

        {/* Previous / Next Article Navigation Footer */}
        <footer className="mt-14 pt-6 border-t border-[var(--glass-border-subtle)] flex flex-wrap items-center justify-between gap-4 font-sans text-xs">
          {prevItem ? (
            <button
              type="button"
              onClick={() => onNavigate(prevItem.path)}
              className="p-4 rounded-2xl liquid-glass-card border border-[var(--glass-border)] hover:border-[var(--orion-accent)] text-left transition cursor-pointer flex items-center gap-3 group shadow-2xs hover:shadow-md"
            >
              <ChevronLeft className="w-4 h-4 text-[var(--orion-accent)] group-hover:-translate-x-0.5 transition" />
              <div>
                <span className="text-[10px] font-mono text-[var(--orion-text-muted)] uppercase block">Previous Article</span>
                <span className="text-[var(--orion-text-primary)] font-semibold group-hover:text-[var(--orion-accent)] transition truncate max-w-[220px] block mt-0.5">
                  {prevItem.title}
                </span>
              </div>
            </button>
          ) : (
            <div />
          )}

          {nextItem ? (
            <button
              type="button"
              onClick={() => onNavigate(nextItem.path)}
              className="p-4 rounded-2xl liquid-glass-card border border-[var(--glass-border)] hover:border-[var(--orion-accent)] text-right transition cursor-pointer flex items-center gap-3 group shadow-2xs hover:shadow-md"
            >
              <div>
                <span className="text-[10px] font-mono text-[var(--orion-text-muted)] uppercase block">Next Article</span>
                <span className="text-[var(--orion-text-primary)] font-semibold group-hover:text-[var(--orion-accent)] transition truncate max-w-[220px] block mt-0.5">
                  {nextItem.title}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--orion-accent)] group-hover:translate-x-0.5 transition" />
            </button>
          ) : (
            <div />
          )}
        </footer>
      </article>

      {/* Right Column: Sticky Table of Contents (Desktop Only) */}
      <aside className="hidden xl:block w-64 shrink-0">
        <DocsTableOfContents markdownContent={rawMarkdown} />
      </aside>
    </div>
  );
};
