import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import {
  ArrowUp,
  Globe,
  GraduationCap,
  MessageSquare,
  Newspaper,
  ImagePlus,
} from 'lucide-react';
import { Button } from './ui/button';
import { FocusMode } from '@/types/search';

interface SearchInputProps {
  onSearch: (query: string, focus: FocusMode) => void;
  isLoading?: boolean;
  variant?: 'hero' | 'compact';
  placeholder?: string;
}

const focusModes = [
  { id: 'all' as FocusMode, label: 'All', icon: Globe },
  { id: 'academic' as FocusMode, label: 'Academic', icon: GraduationCap },
  { id: 'reddit' as FocusMode, label: 'Reddit', icon: MessageSquare },
  { id: 'news' as FocusMode, label: 'News', icon: Newspaper },
];

export function SearchInput({
  onSearch,
  isLoading,
  variant = 'hero',
  placeholder = 'Ask anything...',
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [focusMode, setFocusMode] = useState<FocusMode>('all');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isHero = variant === 'hero';

  const handleSubmit = () => {
    if (!query.trim() || isLoading) return;
    onSearch(query.trim(), focusMode);
    setQuery('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height =
      Math.min(inputRef.current.scrollHeight, 140) + 'px';
  }, [query]);

  // Focus input for compact mode
  useEffect(() => {
    if (variant === 'compact') {
      inputRef.current?.focus();
    }
  }, [variant]);

  return (
    <div className={`w-full ${isHero ? 'max-w-2xl mx-auto' : ''}`}>
      {/* OUTER CONTAINER */}
      <div
        className={`
          relative overflow-hidden rounded-xl transition-all duration-200
          ${isHero ? 'bg-card border border-border p-4' : 'bg-card/80 border border-border/60 p-3'}
        `}
      >
        {/* Focus Mode Pills */}
        {isHero && (
          <div className="flex gap-1 mb-3">
            {focusModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setFocusMode(mode.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition
                  ${
                    focusMode === mode.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }
                `}
              >
                <mode.icon className="w-3 h-3" />
                {mode.label}
              </button>
            ))}
          </div>
        )}

        {/* INPUT ROW */}
        <div className="relative">
          {/* TEXTAREA */}
          <textarea
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className={`
              w-full resize-none bg-transparent outline-none border-none
              placeholder:text-muted-foreground text-foreground
              pr-28
              ${isHero ? 'text-base leading-relaxed' : 'text-sm'}
            `}
            style={{ minHeight: isHero ? '48px' : '28px' }}
          />

          {/* IMAGE BUTTON */}
          <button
            type="button"
            title="Upload image (coming soon)"
            onClick={() => alert('Image upload coming soon 🚀')}
            className={`
              absolute right-12 top-1/2 -translate-y-1/2
              flex items-center justify-center
              rounded-lg bg-secondary text-muted-foreground
              hover:text-foreground hover:bg-secondary/80 transition
              ${isHero ? 'h-10 w-10' : 'h-8 w-8'}
            `}
          >
            <ImagePlus className={isHero ? 'w-5 h-5' : 'w-4 h-4'} />
          </button>

          {/* SEND BUTTON */}
          <Button
            variant="default"
            size="icon"
            onClick={handleSubmit}
            disabled={!query.trim() || isLoading}
            className={`
              absolute right-2 top-1/2 -translate-y-1/2
              flex items-center justify-center
              rounded-lg transition
              ${isHero ? 'h-10 w-10' : 'h-8 w-8'}
              ${query.trim() ? 'bg-primary hover:bg-primary/90' : 'bg-secondary text-muted-foreground'}
            `}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <ArrowUp className={isHero ? 'w-5 h-5' : 'w-4 h-4'} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}