import React, { useState, useEffect } from 'react';
import { AlignLeft, List } from 'lucide-react';

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
    <div className="sticky top-28 space-y-3 p-4 rounded-xl border border-slate-800 bg-[#070B19]/60 backdrop-blur-md">
      <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
        <List className="w-3.5 h-3.5 text-cyan-400" />
        <span>On This Page</span>
      </div>

      <nav className="space-y-1 text-xs">
        {headings.map((h) => {
          const isAct = activeId === h.id;
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => scrollToHeading(h.id)}
              className={`block w-full text-left py-1 transition truncate cursor-pointer ${
                h.level === 3 ? 'pl-3' : ''
              } ${
                isAct
                  ? 'text-cyan-400 font-semibold border-l-2 border-cyan-400 pl-2'
                  : 'text-slate-400 hover:text-slate-200'
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
