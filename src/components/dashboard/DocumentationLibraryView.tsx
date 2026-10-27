import React, { useState, useMemo } from 'react';
import articlesData from '../../data/docs/articles-bundle.json';
import {
  FileText,
  Search,
  BookOpen,
  ArrowRight,
  Terminal,
  ShieldCheck,
  Cpu,
  Layers,
  Sliders,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';

interface DocumentationLibraryViewProps {
  onNavigate: (path: string) => void;
}

interface DocEntry {
  key: string;
  category: string;
  title: string;
  summary: string;
  readTime: string;
}

export const DocumentationLibraryView: React.FC<DocumentationLibraryViewProps> = ({
  onNavigate,
}) => {
  const articles = articlesData as Record<string, string>;
  const [searchQuery, setSearchQuery] = useState('');

  // Read category filter from URL if present
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const cat = sp.get('category');
      if (cat) return cat;
    }
    return 'All';
  });

  const categories = ['All', 'Architecture', 'Engines', 'Operations', 'Security', 'Governance', 'Developers'];

  const docEntries: DocEntry[] = useMemo(() => {
    return Object.entries(articles).map(([key, content]) => {
      const lines = content.split('\n').filter((l) => l.trim().length > 0);
      const titleLine = lines.find((l) => l.startsWith('# '));
      const title = titleLine ? titleLine.replace('# ', '').trim() : key;

      // Extract a summary paragraph
      const summaryLine = lines.find(
        (l) => !l.startsWith('#') && !l.startsWith('```') && !l.startsWith('|') && l.length > 20
      );
      const summary = summaryLine
        ? summaryLine.replace(/[*_`]/g, '').slice(0, 160) + '...'
        : 'Authoritative documentation specification for Orion-9 Enterprise.';

      // Determine category
      let category = 'Operations';
      if (key.startsWith('architecture/')) category = 'Architecture';
      else if (key.startsWith('applications/')) category = 'Engines';
      else if (key.startsWith('security/')) category = 'Security';
      else if (key.startsWith('administration/')) category = 'Governance';
      else if (key.startsWith('developers/')) category = 'Developers';
      else if (key.startsWith('os/')) category = 'Architecture';

      return {
        key,
        category,
        title,
        summary,
        readTime: `${Math.max(3, Math.ceil(content.split(/\s+/).length / 200))}m`,
      };
    });
  }, [articles]);

  const filteredDocs = useMemo(() => {
    return docEntries.filter((doc) => {
      const matchesCategory =
        selectedCategory === 'All' || doc.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        doc.title.toLowerCase().includes(q) ||
        doc.summary.toLowerCase().includes(q) ||
        doc.key.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [docEntries, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden rounded-3xl liquid-glass-elevated border border-[var(--glass-border)] p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-3.5 h-3.5" />
              <span>Enterprise Reference Documentation</span>
            </span>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--orion-text-primary)]">
              Orion-9 Documentation Library
            </h1>

            <p className="text-sm sm:text-base text-[var(--orion-text-secondary)] leading-relaxed">
              Explore the technical specifications, API schemas, multi-tenant security guarantees, and deterministic business logic powering the Orion-9 ecosystem.
            </p>

            <div className="flex items-center gap-4 text-xs font-mono text-[var(--orion-text-muted)] pt-1">
              <span>{docEntries.length} Documented Topics</span>
              <span>&bull;</span>
              <span>100% Real-time Synchronized</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/dashboard/manual')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl liquid-glass-button text-xs font-semibold text-[var(--orion-text-primary)] cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Browse User Manual</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/dashboard/learn')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 text-xs font-semibold cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Open Learning Center</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Search & Category Filters */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--orion-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search specifications, APIs, schemas, and engines..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass-subtle border border-[var(--glass-border-subtle)] text-xs text-[var(--orion-text-primary)] placeholder-[var(--orion-text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-indigo-500 text-white font-semibold shadow-xs'
                    : 'liquid-glass-button text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Cards Grid */}
      <section>
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12 rounded-3xl liquid-glass-subtle border border-[var(--glass-border-subtle)] p-6">
            <p className="text-sm text-[var(--orion-text-secondary)]">
              No documentation articles match your filter criteria.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-3 text-xs text-sky-400 hover:underline cursor-pointer"
            >
              Reset search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((doc) => (
              <div
                key={doc.key}
                onClick={() => onNavigate(`/dashboard/manual?article=${doc.key}`)}
                className="rounded-2xl liquid-glass-elevated border border-[var(--glass-border)] p-5 flex flex-col justify-between hover:border-indigo-500/40 transition-all group cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                      {doc.category}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--orion-text-muted)]">
                      {doc.readTime} read
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--orion-text-primary)] group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-[var(--orion-text-secondary)] line-clamp-3 leading-relaxed">
                    {doc.summary}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-[var(--glass-border-subtle)] flex items-center justify-between text-xs text-indigo-400 group-hover:text-indigo-300 font-medium">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
