import { useEffect, useRef } from 'react';
import { Source, Message, FocusMode, Video } from '@/types/search';
import { SourcesCarousel } from './SourcesCarousel';
import { AnswerSection, AnswerSkeleton } from './AnswerSection';
import { SearchInput } from './SearchInput';
import { MediaSidebar } from './MediaSidebar';
import { RelatedQuestions } from './RelatedQuestions';

interface ResultsViewProps {
  messages: Message[];
  sources: Source[];
  images: string[];
  videos: Video[];
  relatedQuestions: string[];
  isLoading: boolean;
  isSourcesLoading: boolean;
  isRelatedLoading: boolean;
  onFollowUp: (query: string, focus: FocusMode) => void;
}

export function ResultsView({ 
  messages, 
  sources, 
  images,
  videos,
  relatedQuestions,
  isLoading, 
  isSourcesLoading,
  isRelatedLoading,
  onFollowUp 
}: ResultsViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleRelatedSelect = (question: string) => {
    onFollowUp(question, 'all');
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin"
      >
        <div className="flex max-w-5xl mx-auto min-h-full">
          {/* Main Chat Area */}
          <div className="flex-1 max-w-3xl px-4 lg:px-6 py-6">
            {/* Sources - Perplexity style at top */}
            {(sources.length > 0 || isSourcesLoading) && (
              <div className="mb-8">
                <SourcesCarousel sources={sources} isLoading={isSourcesLoading} />
              </div>
            )}

            {/* Chat Messages - Grok minimal style */}
            <div className="space-y-8">
              {messages.map((message, index) => (
                <div 
                  key={message.id} 
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {message.role === 'user' ? (
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-xs font-medium text-muted-foreground">
                        U
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-foreground font-medium">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                        R
                      </div>
                      <div className="flex-1 min-w-0">
                        <AnswerSection 
                          content={message.content} 
                          isStreaming={message.isStreaming} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading State */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                    R
                  </div>
                  <div className="flex-1">
                    <AnswerSkeleton />
                  </div>
                </div>
              )}

              {/* Related Questions */}
              {!isLoading && (relatedQuestions.length > 0 || isRelatedLoading) && (
                <div className="pt-6 mt-4 border-t border-border/40">
                  <RelatedQuestions
                    questions={relatedQuestions}
                    onSelect={handleRelatedSelect}
                    isLoading={isRelatedLoading}
                  />
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          </div>

          {/* Media Sidebar - Desktop only */}
          <MediaSidebar images={images} videos={videos} isLoading={isSourcesLoading} />
        </div>
      </div>

      {/* Fixed Input Bar at Bottom - Grok style */}
      <div className="flex-shrink-0 border-t border-border/40 bg-background">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <SearchInput
            onSearch={onFollowUp}
            isLoading={isLoading}
            variant="compact"
            placeholder="Ask a follow-up..."
          />
        </div>
      </div>
    </div>
  );
}
