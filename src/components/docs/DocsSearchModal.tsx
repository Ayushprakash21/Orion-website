import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
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
        setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl liquid-glass-elevated border border-[var(--glass-border)] rounded-3xl shadow-2xl overflow-hidden text-[var(--orion-text-primary)] my-auto max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-5 py-4 border-b border-[var(--glass-border-subtle)] bg-white/40 dark:bg-black/20 shrink-0">
          <Search className="w-5 h-5 text-[var(--orion-accent)] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search docs, APIs, engines, formulas, and architecture..."
            className="w-full bg-transparent text-sm sm:text-base text-[var(--orion-text-primary)] placeholder-[var(--orion-text-muted)] outline-hidden font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-[var(--orion-text-muted)] hover:text-[var(--orion-text-primary)] transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-[var(--orion-text-muted)]">
            ESC
          </kbd>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 border-b border-[var(--glass-border-subtle)] bg-black/5 dark:bg-white/5 overflow-x-auto scrollbar-none text-xs font-sans shrink-0">
          {['ALL', 'Operating System', 'Supply Chain', 'AI', 'Architecture', 'Security'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-xl transition whitespace-nowrap cursor-pointer text-xs font-medium ${
                selectedCategory === cat
                  ? 'bg-[#070B19] dark:bg-white text-white dark:text-[#070B19] shadow-xs font-semibold'
                  : 'border border-[var(--glass-border-subtle)] bg-white/70 dark:bg-white/5 text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-3 divide-y divide-[var(--glass-border-subtle)]">
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
                  className={`p-3.5 rounded-2xl transition cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#0284C7]/10 border-l-4 border-[#0284C7]'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-[var(--orion-accent)] uppercase">
                        {res.category}
                      </span>
                      <span className="text-[10px] text-[var(--orion-text-muted)] font-mono">· {res.type}</span>
                    </div>
                    <h4 className="text-sm font-bold text-[var(--orion-text-primary)] truncate font-sans">{res.title}</h4>
                    <p className="text-xs text-[var(--orion-text-secondary)] line-clamp-2 leading-relaxed font-sans">{res.snippet}</p>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 mt-2 transition ${
                      isSelected ? 'text-[var(--orion-accent)] transform translate-x-0.5' : 'text-[var(--orion-text-muted)] opacity-50'
                    }`}
                  />
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-[var(--orion-text-muted)] text-xs font-sans">
              No documentation articles or features matched &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>

        {/* Footer Shortcut Instructions */}
        <div className="px-5 py-2.5 border-t border-[var(--glass-border-subtle)] bg-white/40 dark:bg-black/20 flex items-center justify-between text-[11px] font-mono text-[var(--orion-text-muted)] shrink-0">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Dismiss</span>
          </div>
          <span className="text-[var(--orion-accent)]">118 Features · 44 Articles Indexed</span>
        </div>
      </div>
    </div>
  );
};
