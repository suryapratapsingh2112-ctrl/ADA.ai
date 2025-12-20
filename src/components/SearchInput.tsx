import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { ArrowUp, Globe, GraduationCap, MessageSquare, Newspaper } from 'lucide-react';
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

export function SearchInput({ onSearch, isLoading, variant = 'hero', placeholder = 'Ask anything...' }: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [focusMode, setFocusMode] = useState<FocusMode>('all');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (query.trim() && !isLoading) {
      onSearch(query.trim(), focusMode);
      setQuery('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [query]);

  // Focus input on mount for compact variant
  useEffect(() => {
    if (variant === 'compact' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [variant]);

  const isHero = variant === 'hero';

  return (
    <div className={`w-full ${isHero ? 'max-w-2xl mx-auto' : ''}`}>
      <div className={`
        relative rounded-xl transition-all duration-200
        ${isHero 
          ? 'bg-card border border-border hover:border-primary/30 p-4' 
          : 'bg-card/80 border border-border/60 hover:border-border p-3'
        }
      `}>
        {/* Focus Mode Pills - Hero only */}
        {isHero && (
          <div className="flex items-center gap-1 mb-3">
            {focusModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setFocusMode(mode.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${focusMode === mode.id
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

        {/* Input Area */}
        <div className="flex items-end gap-3">
          <div className="flex-1 min-w-0">
            <textarea
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              rows={1}
              className={`
                w-full bg-transparent border-none outline-none resize-none
                placeholder:text-muted-foreground text-foreground
                ${isHero ? 'text-base leading-relaxed' : 'text-sm leading-normal'}
              `}
              style={{ minHeight: isHero ? '48px' : '24px' }}
            />
          </div>
          
          <Button
            variant="default"
            size="icon"
            onClick={handleSubmit}
            disabled={!query.trim() || isLoading}
            className={`
              flex-shrink-0 rounded-lg transition-all
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
