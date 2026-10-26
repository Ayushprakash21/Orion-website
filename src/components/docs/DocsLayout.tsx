import React, { useState, useEffect } from 'react';
import { DocsSidebar } from './DocsSidebar';
import { DocsHome } from './DocsHome';
import { DocsArticleView } from './DocsArticleView';
import { DocsSearchModal } from './DocsSearchModal';
import { Menu, Search, X, BookOpen, ArrowLeft, ShieldCheck } from 'lucide-react';

interface DocsLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const DocsLayout: React.FC<DocsLayoutProps> = ({
  currentPath,
  onNavigate,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Global Ctrl+K / Cmd+K / "/" keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isDocsHome = currentPath === '/docs' || currentPath === '/docs/';

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Docs Header */}
      <header className="sticky top-0 z-40 h-16 bg-[#030712]/90 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo / Link back to Marketing Home */}
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#070B19] border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition shadow-sm">
              <span className="font-mono text-xs font-bold">O9</span>
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-wide block">
                ORION<span className="text-cyan-400">-9</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 block -mt-0.5">
                Documentation Manual
              </span>
            </div>
          </button>
        </div>

        {/* Center / Right Header Controls */}
        <div className="flex items-center gap-3">
          {/* Search Trigger Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900 text-slate-400 hover:text-white transition text-xs font-mono cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Search docs...</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-400">
              Ctrl+K
            </kbd>
          </button>

          {/* Return to Website Button */}
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Main Site</span>
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Navigation Sidebar */}
        <DocsSidebar
          currentPath={currentPath}
          onNavigate={onNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-xs lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Content Pane */}
        <main className="flex-1 min-w-0 lg:pl-72 px-4 sm:px-8 md:px-12 pt-8">
          {isDocsHome ? (
            <DocsHome
              onNavigate={onNavigate}
              onOpenSearch={() => setIsSearchOpen(true)}
            />
          ) : (
            <DocsArticleView
              currentPath={currentPath}
              onNavigate={onNavigate}
            />
          )}
        </main>
      </div>

      {/* Global Interactive Search Modal */}
      <DocsSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
