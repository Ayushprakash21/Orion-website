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
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-6 flex-wrap">
      <button
        type="button"
        onClick={() => onNavigate('/')}
        className="hover:text-slate-200 transition flex items-center gap-1 cursor-pointer"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

      <button
        type="button"
        onClick={() => onNavigate('/docs')}
        className="hover:text-cyan-400 transition flex items-center gap-1 cursor-pointer"
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>Docs</span>
      </button>

      {category && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-400">{category}</span>
        </>
      )}

      {title && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-cyan-400 font-semibold truncate max-w-xs">{title}</span>
        </>
      )}
    </nav>
  );
};
