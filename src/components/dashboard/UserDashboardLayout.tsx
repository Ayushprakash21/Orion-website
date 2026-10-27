import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { useTheme } from '../../context/ThemeContext';
import { OrionLogo } from '../OrionLogo';
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  FileText,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Sliders,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

interface UserDashboardLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  children: React.ReactNode;
}

export const UserDashboardLayout: React.FC<UserDashboardLayoutProps> = ({
  currentPath,
  onNavigate,
  breadcrumbs,
  children,
}) => {
  const { user, username, isAdmin, launchOrion, logout, destinationUrl } = useAuth();
  const { activeConfig } = useSiteConfig();
  const { theme, toggleTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const companyName = activeConfig.branding.companyName || 'Orion-9';

  const navTabs = [
    {
      label: 'Overview',
      path: '/dashboard',
      icon: LayoutDashboard,
      isActive: currentPath === '/dashboard',
    },
    {
      label: 'Learning Center',
      path: '/dashboard/learn',
      icon: GraduationCap,
      isActive: currentPath.startsWith('/dashboard/learn'),
    },
    {
      label: 'OS User Manual',
      path: '/dashboard/manual',
      icon: BookOpen,
      isActive: currentPath.startsWith('/dashboard/manual'),
    },
    {
      label: 'Documentation',
      path: '/dashboard/documentation',
      icon: FileText,
      isActive: currentPath.startsWith('/dashboard/documentation'),
    },
    {
      label: 'Progress',
      path: '/dashboard/progress',
      icon: CheckCircle2,
      isActive: currentPath.startsWith('/dashboard/progress'),
    },
  ];

  const handleTabClick = (path: string) => {
    setMobileNavOpen(false);
    onNavigate(path);
  };

  const displayName = user?.displayName || username || user?.email?.split('@')[0] || 'Operator';
  const roleLabel = isAdmin ? 'System Administrator' : 'Enterprise Operator';

  return (
    <div className="min-h-screen bg-[var(--orion-canvas)] text-[var(--orion-text-primary)] flex flex-col font-sans transition-colors duration-300">
      {/* Background ambient refraction orbs */}
      <div
        className="pointer-events-none fixed -top-40 -left-40 w-[500px] h-[500px] bg-sky-500/10 dark:bg-sky-500/5 blur-[120px] rounded-full z-0"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-600/10 dark:bg-blue-600/5 blur-[120px] rounded-full z-0"
        aria-hidden="true"
      />

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--glass-border-subtle)] bg-[var(--glass-bg)] backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Back to Home */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              className="inline-flex items-center gap-2 cursor-pointer focus:outline-none"
              aria-label="Orion-9 Dashboard Home"
            >
              <OrionLogo
                companyName={companyName}
                size="md"
                tone={theme === 'dark' ? 'light' : 'dark'}
                placement="header"
              />
            </button>

            <span className="hidden md:inline-block h-5 w-px bg-[var(--glass-border-subtle)]" />

            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-[var(--orion-text-muted)] hover:text-[var(--orion-text-primary)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </button>
          </div>

          {/* Center: Desktop Navigation Tabs (macOS Segmented Picker) */}
          <nav className="hidden lg:flex items-center gap-1 macos-segmented p-1 rounded-2xl border border-[var(--glass-border-subtle)]">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.path}
                  type="button"
                  onClick={() => handleTabClick(tab.path)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer macos-segmented-pill ${
                    tab.isActive ? 'active' : ''
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Actions, User Info, Theme Toggle, Launch OS */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl liquid-glass-button text-[var(--orion-text-secondary)] hover:text-[var(--orion-text-primary)] transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => onNavigate('/admin')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass-button text-xs font-medium text-[var(--orion-text-primary)] cursor-pointer"
                title="Open Admin Console"
              >
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Admin</span>
              </button>
            )}

            {/* Launch OS Button */}
            <button
              type="button"
              onClick={() => launchOrion(destinationUrl)}
              className="macos-btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Launch Orion-9 OS</span>
              <span className="sm:hidden">Launch OS</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-xl liquid-glass-button text-[var(--orion-text-primary)] cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-[var(--glass-border-subtle)] bg-[var(--orion-canvas)]/95 backdrop-blur-2xl px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--glass-border-subtle)]">
              <div>
                <p className="text-xs font-semibold text-[var(--orion-text-primary)]">{displayName}</p>
                <p className="text-[10px] text-[var(--orion-accent)] font-mono">{roleLabel}</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified</span>
              </span>
            </div>

            <nav className="flex flex-col space-y-1">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.path}
                    type="button"
                    onClick={() => handleTabClick(tab.path)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer ${
                      tab.isActive
                        ? 'bg-sky-500 text-white font-semibold'
                        : 'text-[var(--orion-text-primary)] hover:bg-white/40 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-[var(--glass-border-subtle)] flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  onNavigate('/');
                }}
                className="w-full py-2 px-3 rounded-xl liquid-glass-button text-xs font-medium text-[var(--orion-text-primary)] text-center cursor-pointer"
              >
                Return to Public Website
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    onNavigate('/admin');
                  }}
                  className="w-full py-2 px-3 rounded-xl liquid-glass-button text-xs font-medium text-sky-400 text-center cursor-pointer"
                >
                  Admin Console
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Breadcrumb Sub-Bar (When Provided) */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="border-b border-[var(--glass-border-subtle)] bg-[var(--orion-canvas)]/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 text-xs text-[var(--orion-text-muted)] overflow-x-auto">
            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              className="hover:text-[var(--orion-text-primary)] transition-colors cursor-pointer shrink-0"
            >
              Dashboard
            </button>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label}>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50" />
                {crumb.href ? (
                  <button
                    type="button"
                    onClick={() => onNavigate(crumb.href!)}
                    className="hover:text-[var(--orion-text-primary)] transition-colors cursor-pointer shrink-0 truncate max-w-[200px]"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-[var(--orion-text-primary)] font-medium shrink-0 truncate max-w-[240px]">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Subdued Footer */}
      <footer className="border-t border-[var(--glass-border-subtle)] py-6 text-center text-xs text-[var(--orion-text-muted)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[11px]">
            {companyName} Supply Chain Operating System &bull; Version 9.0.0
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              type="button"
              onClick={() => onNavigate('/dashboard/manual')}
              className="hover:text-[var(--orion-text-primary)] transition-colors cursor-pointer"
            >
              OS Manual
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/dashboard/documentation')}
              className="hover:text-[var(--orion-text-primary)] transition-colors cursor-pointer"
            >
              Docs Library
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/dashboard/progress')}
              className="hover:text-[var(--orion-text-primary)] transition-colors cursor-pointer"
            >
              Learning Progress
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
