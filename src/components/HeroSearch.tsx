import { SearchInput } from './SearchInput';
import { FocusMode } from '@/types/search';

interface HeroSearchProps {
  onSearch: (query: string, focus: FocusMode) => void;
  isLoading?: boolean;
}

export function HeroSearch({ onSearch, isLoading }: HeroSearchProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Minimal Grok-style hero */}
      <div className="w-full max-w-2xl space-y-8">
        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
            What do you want to know?
          </h1>
          <p className="text-muted-foreground text-sm">
            Research with <span className="text-primary">RUDRA-GROK</span> · Code with <span className="text-primary">ADA-Code</span>
          </p>
        </div>

        {/* Search Input */}
        <SearchInput
          onSearch={onSearch}
          isLoading={isLoading}
          variant="hero"
          placeholder="Ask me anything..."
        />

        {/* Quick prompts - minimal style */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            'Explain quantum computing',
            'Write a React hook',
            'How does AI work?',
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSearch(suggestion, 'all')}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border hover:border-primary/50 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
