import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'orion9_theme_preference';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') return 'light';
    const urlTheme = new URLSearchParams(window.location.search).get('theme');
    if (urlTheme === 'light' || urlTheme === 'dark') {
      return urlTheme;
    }
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'light'; // Default to pristine light glass mode with dark toggle
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Evaluate resolved theme based on preference and media query
  useEffect(() => {
    const updateTheme = () => {
      let active: 'light' | 'dark' = 'light';
      if (themePreference === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        active = isDark ? 'dark' : 'light';
      } else {
        active = themePreference;
      }

      setResolvedTheme(active);

      // Toggle dark class and data-theme on root HTML and body element
      const root = document.documentElement;
      if (active === 'dark') {
        root.classList.add('dark');
        document.body.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        document.body.setAttribute('data-theme', 'dark');
        root.style.removeProperty('--orion-canvas');
        root.style.removeProperty('--orion-alt-bg');
        root.style.removeProperty('--orion-surface');
        root.style.removeProperty('--orion-text-primary');
        root.style.removeProperty('--orion-text-secondary');
        root.style.removeProperty('--orion-border');
        root.style.removeProperty('--orion-deep-blue');
        root.style.removeProperty('--orion-steel-blue');
        root.style.removeProperty('--orion-dark-surface');
      } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        document.body.setAttribute('data-theme', 'light');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('orion-theme-changed', { detail: { theme: 'light' } }));
        }
      }
    };

    updateTheme();

    if (themePreference === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themePreference]);

  const setThemePreference = (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, pref);
    } catch {}
  };

  const toggleTheme = () => {
    setThemePreference(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme,
        themePreference,
        setThemePreference,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Graceful fallback for non-provider or test contexts
    return {
      theme: 'light',
      themePreference: 'light',
      setThemePreference: () => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}
