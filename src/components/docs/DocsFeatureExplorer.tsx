import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  ExternalLink,
  Code2,
} from 'lucide-react';
import featureCatalogData from '../../data/docs/feature-catalog.json';

const CATEGORIES = [
  'ALL',
  'Operating System',
  'Supply Chain',
  'AI Copilot',
  'Integration Fabric',
  'Data and Analytics',
  'Security and Administration',
  'Platform Architecture',
  'Desktop Applications',
];

export const DocsFeatureExplorer: React.FC<{ onNavigate: (path: string) => void }> = ({
  onNavigate,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredFeatures = useMemo(() => {
    return featureCatalogData.filter((feat) => {
      const matchCat = selectedCat === 'ALL' || feat.category.toLowerCase() === selectedCat.toLowerCase();
      const matchSearch =
        !searchTerm.trim() ||
        feat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feat.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feat.sourceFiles.some((f) => f.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCat, searchTerm]);

  return (
    <section className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--orion-accent)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter features, engines, source files..."
            className="w-full pl-10 pr-3 py-2.5 rounded-xl liquid-glass-input text-xs font-sans text-[var(--orion-text-primary)] placeholder-[var(--orion-text-muted)] outline-hidden focus:border-[var(--orion-accent)]"
          />
        </div>

        <span className="text-xs font-mono text-[var(--orion-text-muted)] self-end sm:self-center">
          Showing {filteredFeatures.length} of {featureCatalogData.length} Core Capabilities
        </span>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs font-sans">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(cat)}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer text-xs ${
              selectedCat === cat
                ? 'bg-[#070B19] dark:bg-white text-white dark:text-[#070B19] font-semibold shadow-xs'
                : 'border border-[var(--glass-border-subtle)] bg-white/70 dark:bg-white/5 text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFeatures.map((feat) => {
          const isVerified = feat.status.includes('Verified');
          return (
            <div
              key={feat.id}
              className="liquid-glass-card rounded-2xl p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 border border-[var(--glass-border)] flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-[var(--orion-accent)] uppercase">
                    {feat.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1 ${
                      isVerified
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{feat.status.split(' ')[0]}</span>
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[var(--orion-text-primary)] group-hover:text-[var(--orion-accent)] transition font-sans">
                  {feat.name}
                </h3>

                <p className="text-xs text-[var(--orion-text-secondary)] leading-relaxed font-sans line-clamp-3">
                  {feat.description}
                </p>

                {/* Source File Badge */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-[var(--orion-text-muted)]">
                  <Code2 className="w-3 h-3 text-[var(--orion-accent)] shrink-0" />
                  <span className="truncate max-w-[200px] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                    {feat.sourceFiles[0]}
                  </span>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-4 mt-4 border-t border-[var(--glass-border-subtle)] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--orion-text-muted)]">
                  {feat.platformSupport.join(' · ')}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate(feat.docPath)}
                  className="text-xs font-semibold text-[var(--orion-accent)] hover:text-[#0369A1] transition flex items-center gap-1 cursor-pointer font-sans"
                >
                  <span>Manual</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
