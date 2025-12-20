import { Source } from '@/types/search';
import { SourceCard, SourceCardSkeleton } from './SourceCard';
import { Globe } from 'lucide-react';

interface SourcesCarouselProps {
  sources: Source[];
  isLoading?: boolean;
}

export function SourcesCarousel({ sources, isLoading }: SourcesCarouselProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Sources</span>
        {!isLoading && sources.length > 0 && (
          <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
            {sources.length}
          </span>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {isLoading ? (
          <>
            <SourceCardSkeleton />
            <SourceCardSkeleton />
            <SourceCardSkeleton />
          </>
        ) : (
          sources.map((source, index) => (
            <SourceCard key={source.id} source={source} index={index} />
          ))
        )}
      </div>
    </div>
  );
}
