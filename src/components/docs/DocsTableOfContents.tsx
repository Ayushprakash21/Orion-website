import React, { useState, useEffect } from 'react';
import { List } from 'lucide-react';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export const DocsTableOfContents: React.FC<{ markdownContent: string }> = ({
  markdownContent,
}) => {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const lines = markdownContent.split('\n');
    const extracted: HeadingItem[] = [];

    for (const line of lines) {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        extracted.push({ id, text, level });
      }
    }

    setHeadings(extracted);
    if (extracted.length > 0) {
      setActiveId(extracted[0].id);
    }
  }, [markdownContent]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="sticky top-24 space-y-3 p-5 rounded-2xl liquid-glass-card border border-[var(--glass-border-subtle)] shadow-xs">
      <div className="flex items-center gap-2 text-xs font-bold text-[var(--orion-text-muted)] uppercase tracking-wider font-sans">
        <List className="w-3.5 h-3.5 text-[var(--orion-accent)]" />
        <span>On This Page</span>
      </div>

      <nav className="space-y-1 text-xs font-sans">
        {headings.map((h) => {
          const isAct = activeId === h.id;
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => scrollToHeading(h.id)}
              className={`block w-full text-left py-1.5 transition truncate cursor-pointer rounded-md ${
                h.level === 3 ? 'pl-3 text-[11px]' : ''
              } ${
                isAct
                  ? 'text-[var(--orion-accent)] font-semibold border-l-2 border-[var(--orion-accent)] pl-2'
                  : 'text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] hover:translate-x-0.5'
              }`}
            >
              {h.text}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
