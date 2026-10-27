import React from 'react';
import { ChevronRight, Home, BookOpen } from 'lucide-react';

interface DocsBreadcrumbsProps {
  category?: string;
  title?: string;
  onNavigate: (path: string) => void;
}

export const DocsBreadcrumbs: React.FC<DocsBreadcrumbsProps> = ({
  category,
  title,
  onNavigate,
}) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-sans text-[var(--orion-text-muted)] mb-6 flex-wrap">
      <button
        type="button"
        onClick={() => onNavigate('/')}
        className="hover:text-[var(--orion-text-primary)] transition flex items-center gap-1.5 cursor-pointer font-medium"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      <ChevronRight className="w-3 h-3 opacity-40" />

      <button
        type="button"
        onClick={() => onNavigate('/docs')}
        className="hover:text-[var(--orion-accent)] transition flex items-center gap-1.5 cursor-pointer font-medium"
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>Documentation</span>
      </button>

      {category && (
        <>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <span className="text-[var(--orion-text-secondary)] font-medium">{category}</span>
        </>
      )}

      {title && (
        <>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <span className="text-[var(--orion-text-primary)] font-semibold truncate max-w-xs">{title}</span>
        </>
      )}
    </nav>
  );
};
