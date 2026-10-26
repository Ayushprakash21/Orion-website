import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, BookOpen, ArrowRight, Layers, Bot, Shield, Cpu, Tag } from 'lucide-react';
import featureCatalogData from '../../data/docs/feature-catalog.json';
import navigationData from '../../data/docs/navigation.json';
import articlesBundleData from '../../data/docs/articles-bundle.json';

interface SearchResult {
  id: string;
  type: 'article' | 'feature';
  title: string;
  category: string;
  snippet: string;
  path: string;
}

export const DocsSearchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setSelectedCategory('ALL');
    }
  }, [isOpen]);

  // Index articles and features
  const allSearchItems = useMemo<SearchResult[]>(() => {
    const list: SearchResult[] = [];

    // Articles from navigation data
    navigationData.forEach((section) => {
      section.items.forEach((item) => {
        const articleKey = item.path.replace(/^\/docs\//, '');
        const rawContent = (articlesBundleData as Record<string, string>)[articleKey] || '';
        const cleanSnippet = rawContent
          .replace(/#+\s+/g, '')
          .replace(/```[\s\S]*?```/g, '')
          .slice(0, 140);

        list.push({
          id: `art-${item.id}`,
          type: 'article',
          title: item.title,
          category: section.category,
          snippet: cleanSnippet || 'Authoritative technical manual and architecture specification.',
          path: item.path,
        });
      });
    });

    // Features from catalog
    featureCatalogData.forEach((feat) => {
      list.push({
        id: `feat-${feat.id}`,
        type: 'feature',
        title: feat.name,
        category: feat.category,
        snippet: feat.description,
        path: feat.docPath,
      });
    });

    return list;
  }, []);

  // Filtered results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allSearchItems.slice(0, 8);

    return allSearchItems
      .filter((item) => {
        const matchesCategory =
          selectedCategory === 'ALL' || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
        const matchesQuery =
          item.title.toLowerCase().includes(q) ||
          item.snippet.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q);
        return matchesCategory && matchesQuery;
      })
      .slice(0, 15);
  }, [allSearchItems, query, selectedCategory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + Math.max(1, results.length)) % Math.max(1, results.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          onNavigate(results[selectedIndex].path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onNavigate, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-[#070B19] shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/60">
          <Search className="w-5 h-5 text-cyan-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search docs, APIs, engines, formulas, and architecture..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800/80 bg-slate-950/40 overflow-x-auto scrollbar-none text-[11px] font-mono">
          {['ALL', 'Operating System', 'Supply Chain', 'AI', 'Architecture', 'Security'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-slate-800/50">
          {results.length > 0 ? (
            results.map((res, i) => {
              const isSelected = i === selectedIndex;
              return (
                <div
                  key={res.id}
                  onClick={() => {
                    onNavigate(res.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`p-3 rounded-xl transition cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected ? 'bg-cyan-950/40 border border-cyan-500/30' : 'hover:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
                        {res.category}
                      </span>
                      <span className="text-[10px] text-slate-500">· {res.type}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white truncate">{res.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{res.snippet}</p>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 mt-2 transition ${
                      isSelected ? 'text-cyan-400 transform translate-x-0.5' : 'text-slate-600'
                    }`}
                  />
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              No documentation articles or features matched &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>

        {/* Footer Shortcut Instructions */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Dismiss</span>
          </div>
          <span className="text-cyan-500/80">118 Features · 44 Articles Indexed</span>
        </div>
      </div>
    </div>
  );
};
