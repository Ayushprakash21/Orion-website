import React, { useState, useEffect } from 'react';
import { DocsSidebar } from './DocsSidebar';
import { DocsHome } from './DocsHome';
import { DocsArticleView } from './DocsArticleView';
import { DocsSearchModal } from './DocsSearchModal';
import { OrionLogo } from '../OrionLogo';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { Menu, Search, X, ArrowLeft } from 'lucide-react';

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
  const { activeConfig } = useSiteConfig();
  const companyName = activeConfig.branding.companyName || 'Orion-9';

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
    <div className="min-h-screen bg-[var(--orion-canvas)] text-[var(--orion-text-primary)] flex flex-col font-sans selection:bg-[#0284C7] selection:text-white relative transition-colors duration-300">
      {/* Ambient background light spot matching main website */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-sky-400/10 dark:bg-sky-500/5 blur-[140px] rounded-full z-0"
        aria-hidden="true"
      />

      {/* Top Docs Header - macOS Liquid Glass */}
      <header className="sticky top-0 z-40 h-16 sm:h-17 liquid-glass-elevated border-b border-[var(--glass-border-subtle)] flex items-center justify-between px-4 sm:px-8 shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-[var(--glass-border-subtle)] bg-white/70 dark:bg-white/5 text-[var(--orion-text-primary)] hover:bg-white transition cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Canonical Orion Logo Lockup */}
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-left cursor-pointer group focus:outline-hidden"
            aria-label="Return to Orion-9 Home"
          >
            <OrionLogo companyName={companyName} size="sm" placement="header" />
            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-[var(--glass-border-subtle)]">
              <span className="text-xs font-semibold text-[var(--orion-text-secondary)] group-hover:text-[var(--orion-text-primary)] transition">
                Documentation Manual
              </span>
            </div>
          </button>
        </div>

        {/* Center / Right Header Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Search Trigger Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-[var(--glass-border-subtle)] bg-white/60 dark:bg-white/5 hover:border-[var(--orion-accent)] hover:bg-white text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] transition text-xs font-medium cursor-pointer shadow-2xs"
          >
            <Search className="w-3.5 h-3.5 text-[var(--orion-accent)]" />
            <span>Search docs...</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-[var(--orion-text-muted)]">
              Ctrl+K
            </kbd>
          </button>

          {/* Mobile Search Icon Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden p-2 rounded-xl border border-[var(--glass-border-subtle)] bg-white/60 dark:bg-white/5 text-[var(--orion-text-primary)] hover:bg-white transition cursor-pointer"
            aria-label="Open Search"
          >
            <Search className="w-4 h-4 text-[var(--orion-accent)]" />
          </button>

          {/* Return to Website Button */}
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="px-3.5 py-2 rounded-xl border border-[var(--glass-border-subtle)] bg-white/60 dark:bg-white/5 hover:bg-white hover:border-[var(--orion-accent)] text-[var(--orion-text-primary)] text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[var(--orion-accent)]" />
            <span className="hidden sm:inline">Back to Main Site</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto relative z-10">
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
            className="fixed inset-0 z-20 bg-black/50 backdrop-blur-xs lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Content Pane */}
        <main className="flex-1 min-w-0 lg:pl-72 px-4 sm:px-8 md:px-12 py-8 sm:py-12">
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
