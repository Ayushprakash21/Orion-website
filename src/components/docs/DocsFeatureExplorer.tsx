import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Code2,
  Filter,
  Monitor,
  Cpu,
  Bot,
  ShieldCheck,
  Database,
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
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter features, engines, source files..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-cyan-500/50"
          />
        </div>

        <span className="text-xs font-mono text-slate-400 self-end sm:self-center">
          Showing {filteredFeatures.length} of {featureCatalogData.length} Core Capabilities
        </span>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 font-mono text-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(cat)}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
              selectedCat === cat
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeatures.map((feat) => {
          const isVerified = feat.status.includes('Verified');
          return (
            <div
              key={feat.id}
              className="group p-5 rounded-2xl border border-slate-800 bg-[#070B19]/80 hover:border-cyan-500/40 hover:bg-slate-900/40 transition-all flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
                    {feat.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold flex items-center gap-1 ${
                      isVerified
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{feat.status.split(' ')[0]}</span>
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition">
                  {feat.name}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3">
                  {feat.description}
                </p>

                {/* Source File Badge */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-500">
                  <Code2 className="w-3 h-3 text-cyan-500/70 shrink-0" />
                  <span className="truncate max-w-[200px]">{feat.sourceFiles[0]}</span>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  {feat.platformSupport.join(' · ')}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate(feat.docPath)}
                  className="text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Manual</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
