import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { HeroSearch } from '@/components/HeroSearch';
import { ResultsView } from '@/components/ResultsView';
import { ModeSelector } from '@/components/ModeSelector';
import { ImageGenerator } from '@/components/ImageGenerator';
import { useSearch } from '@/hooks/useSearch';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isImageGenOpen, setIsImageGenOpen] = useState(false);
  
  const {
    threads,
    currentThreadId,
    messages,
    sources,
    images,
    videos,
    relatedQuestions,
    isLoading,
    isSourcesLoading,
    isRelatedLoading,
    hasSearched,
    aiMode,
    setAiMode,
    search,
    newThread,
    selectThread,
    deleteThread,
  } = useSearch(user);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        threads={threads}
        currentThreadId={currentThreadId ?? undefined}
        onNewThread={newThread}
        onSelectThread={selectThread}
        onDeleteThread={deleteThread}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Grok minimal style */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border/40">
          <div className="flex items-center gap-2">
            <ModeSelector mode={aiMode} onModeChange={setAiMode} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsImageGenOpen(true)}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <ImageIcon className="w-4 h-4 mr-1.5" />
              <span className="text-xs hidden sm:inline">Create</span>
            </Button>
          </div>
          
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-8 px-2">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" asChild className="h-8">
              <Link to="/auth">
                <LogIn className="w-4 h-4 mr-1.5" />
                <span className="text-xs">Sign In</span>
              </Link>
            </Button>
          )}
        </div>

        {hasSearched ? (
          <ResultsView
            messages={messages}
            sources={sources}
            images={images}
            videos={videos}
            relatedQuestions={relatedQuestions}
            isLoading={isLoading}
            isSourcesLoading={isSourcesLoading}
            isRelatedLoading={isRelatedLoading}
            onFollowUp={search}
          />
        ) : (
          <HeroSearch onSearch={search} isLoading={isLoading} />
        )}
      </main>

      {/* Image Generator Modal */}
      <ImageGenerator isOpen={isImageGenOpen} onClose={() => setIsImageGenOpen(false)} />
    </div>
  );
};

export default Index;
