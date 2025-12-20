import { Source } from '@/types/search';
import { ExternalLink } from 'lucide-react';

interface SourceCardProps {
  source: Source;
  index: number;
}

export function SourceCard({ source, index }: SourceCardProps) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex-shrink-0 w-[240px] p-3 rounded-lg bg-card border border-border hover:border-primary/40 transition-all duration-200"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex items-center justify-center w-5 h-5 rounded bg-primary/20 text-primary text-[10px] font-bold flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            {source.favicon && (
              <img
                src={source.favicon}
                alt=""
                className="w-3.5 h-3.5 rounded-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span className="text-[10px] text-muted-foreground truncate">
              {source.domain}
            </span>
            <ExternalLink className="w-2.5 h-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {source.title}
          </h3>
        </div>
      </div>
    </a>
  );
}

export function SourceCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[240px] p-3 rounded-lg bg-card border border-border">
      <div className="flex items-start gap-2.5">
        <div className="w-5 h-5 rounded bg-secondary animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-2.5 w-16 rounded bg-secondary animate-pulse" />
          <div className="h-3 w-full rounded bg-secondary animate-pulse" />
          <div className="h-3 w-3/4 rounded bg-secondary animate-pulse" />
        </div>
      </div>
    </div>
  );
}
