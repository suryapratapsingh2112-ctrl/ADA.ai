import { ArrowRight, Sparkles } from 'lucide-react';

interface RelatedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  isLoading?: boolean;
}

export function RelatedQuestions({ questions, onSelect, isLoading }: RelatedQuestionsProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Related</h3>
        </div>
        <div className="space-y-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 bg-secondary/40 rounded-md animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Related</h3>
      </div>
      <div className="space-y-1">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-md transition-colors group"
          >
            <span className="line-clamp-1">{question}</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
