import { useState } from 'react';
import { Search, Plus, Menu, X, Trash2, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { SearchThread } from '@/types/search';

interface SidebarProps {
  threads: SearchThread[];
  currentThreadId?: string;
  onNewThread: () => void;
  onSelectThread: (id: string) => void;
  onDeleteThread?: (id: string) => void;
}

export function Sidebar({ threads, currentThreadId, onNewThread, onSelectThread, onDeleteThread }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredThread, setHoveredThread] = useState<string | null>(null);

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden h-9 w-9"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Grok minimal style */}
      <aside className={`
        fixed top-0 left-0 h-full w-56 bg-sidebar border-r border-sidebar-border z-40
        transition-transform duration-200 ease-out
        lg:translate-x-0 lg:relative
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-3">
          {/* Logo - minimal */}
          <div className="flex items-center gap-2 mb-4 px-2 py-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-base font-semibold text-foreground">ADA AI</span>
          </div>

          {/* New Thread Button */}
          <Button
            variant="outline"
            className="w-full mb-4 justify-start border-dashed hover:border-primary/50 hover:bg-transparent"
            onClick={() => {
              onNewThread();
              setIsOpen(false);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New chat
          </Button>

          {/* Thread History */}
          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-0.5">
            {threads.length === 0 ? (
              <div className="px-2 py-8 text-sm text-muted-foreground text-center">
                No conversations yet
              </div>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredThread(thread.id)}
                  onMouseLeave={() => setHoveredThread(null)}
                >
                  <button
                    onClick={() => {
                      onSelectThread(thread.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full text-left px-2.5 py-2 rounded-lg transition-colors text-sm
                      ${currentThreadId === thread.id
                        ? 'bg-sidebar-accent text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                      <span className="truncate pr-6">{thread.query}</span>
                    </div>
                  </button>
                  {onDeleteThread && hoveredThread === thread.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteThread(thread.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
