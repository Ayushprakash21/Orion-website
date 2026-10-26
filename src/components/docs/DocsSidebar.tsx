import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  Shield,
  Activity,
  Cpu,
  FileText,
  Home,
  CheckCircle2,
} from 'lucide-react';
import navigationData from '../../data/docs/navigation.json';
import coverageData from '../../data/docs/coverage.json';

interface DocsSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const DocsSidebar: React.FC<DocsSidebarProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
  isOpenMobile,
  onCloseMobile,
}) => {
  // Track open/collapsed state of categories
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <aside
      className={`fixed top-16 bottom-0 left-0 z-30 w-72 bg-[#050914] border-r border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Sidebar Header & Quick Search */}
      <div className="p-4 border-b border-slate-800/80 space-y-3">
        <button
          type="button"
          onClick={() => {
            onNavigate('/docs');
            if (onCloseMobile) onCloseMobile();
          }}
          className="flex items-center gap-2.5 text-left w-full cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold tracking-wider text-white flex items-center gap-1.5">
              <span>ORION-9 DOCS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <div className="text-[10px] font-mono text-slate-400">Enterprise OS Manual</div>
          </div>
        </button>

        {/* Global Search Shortcut Pill */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white transition flex items-center justify-between text-xs font-mono cursor-pointer shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Search docs...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs font-mono">
        {navigationData.map((section) => {
          const isCollapsed = collapsedCategories[section.category];
          return (
            <div key={section.category} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleCategory(section.category)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] font-bold text-slate-400 hover:text-slate-200 uppercase tracking-wider transition cursor-pointer"
              >
                <span>{section.category}</span>
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                )}
              </button>

              {!isCollapsed && (
                <div className="space-y-0.5 pl-1 border-l border-slate-800/80 ml-2">
                  {section.items.map((item) => {
                    const isActive = currentPath === item.path;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onNavigate(item.path);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition truncate cursor-pointer flex items-center justify-between ${
                          isActive
                            ? 'bg-cyan-500/10 text-cyan-300 font-semibold border-l-2 border-cyan-400'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer System Status Badge */}
      <div className="p-3 border-t border-slate-800 bg-[#030712] text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>v9.0.0-certified</span>
        </div>
        <span className="text-slate-500">{coverageData.totalModulesInventoried} Apps</span>
      </div>
    </aside>
  );
};
