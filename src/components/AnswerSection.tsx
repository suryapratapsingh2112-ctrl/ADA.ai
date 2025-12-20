import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useToast } from '@/hooks/use-toast';

interface AnswerSectionProps {
  content: string;
  isStreaming?: boolean;
}

export function AnswerSection({ content, isStreaming }: AnswerSectionProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!content) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        description: "Copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        description: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="group relative space-y-2">
      <div className={`answer-text ${isStreaming ? 'is-streaming streaming-text typing-cursor' : ''}`}>
        <MarkdownRenderer content={content} isStreaming={isStreaming} />
      </div>
      
      {/* Copy button - appears on hover or after streaming completes */}
      {!isStreaming && content && (
        <button
          onClick={handleCopy}
          className="absolute -top-1 right-0 p-1.5 rounded-md bg-secondary/80 hover:bg-secondary border border-border/50 text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
}

export function AnswerSkeleton() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      <TypingDot delay="0ms" />
      <TypingDot delay="150ms" />
      <TypingDot delay="300ms" />
    </div>
  );
}

function TypingDot({ delay }: { delay: string }) {
  return (
    <span
      className="w-2 h-2 rounded-full bg-primary/80 animate-typing-bounce"
      style={{ animationDelay: delay }}
    />
  );
}
