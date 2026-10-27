import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronRight,
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
      className={`fixed top-16 sm:top-17 bottom-0 left-0 z-30 w-72 liquid-glass-elevated border-r border-[var(--glass-border-subtle)] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
        isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      {/* Sidebar Header & Quick Search */}
      <div className="p-4 border-b border-[var(--glass-border-subtle)] space-y-3">
        <button
          type="button"
          onClick={() => {
            onNavigate('/docs');
            if (onCloseMobile) onCloseMobile();
          }}
          className="flex items-center gap-2.5 text-left w-full cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#0284C7]/10 border border-[#0284C7]/20 flex items-center justify-center text-[#0284C7] group-hover:scale-105 transition shadow-2xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-tight text-[var(--orion-text-primary)] flex items-center gap-1.5 font-sans">
              <span>ORION-9 DOCS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[11px] text-[var(--orion-text-muted)] font-sans">Enterprise OS Manual</div>
          </div>
        </button>

        {/* Global Search Shortcut Pill */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full px-3.5 py-2 rounded-xl border border-[var(--glass-border-subtle)] bg-white/70 dark:bg-white/5 hover:bg-white hover:border-[var(--orion-accent)] text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] transition flex items-center justify-between text-xs font-sans cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[var(--orion-accent)]" />
            <span>Search docs...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-[var(--orion-text-muted)]">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs font-sans scrollbar-thin">
        {navigationData.map((section) => {
          const isCollapsed = collapsedCategories[section.category];
          return (
            <div key={section.category} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleCategory(section.category)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[var(--orion-text-muted)] hover:text-[var(--orion-text-primary)] uppercase tracking-wider transition cursor-pointer font-sans"
              >
                <span>{section.category}</span>
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                )}
              </button>

              {!isCollapsed && (
                <div className="space-y-0.5 pl-1.5 border-l border-[var(--glass-border-subtle)] ml-2">
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
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-sans transition truncate cursor-pointer flex items-center justify-between ${
                          isActive
                            ? 'bg-[#0284C7]/10 text-[#0284C7] font-semibold border-l-2 border-[#0284C7]'
                            : 'text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 font-normal'
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
      <div className="p-3.5 border-t border-[var(--glass-border-subtle)] bg-white/40 dark:bg-black/20 text-[11px] font-mono text-[var(--orion-text-muted)] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>v9.0.0-certified</span>
        </div>
        <span>{coverageData.totalModulesInventoried} Apps</span>
      </div>
    </aside>
  );
};
