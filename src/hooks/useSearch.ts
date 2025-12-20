import { useState, useCallback, useEffect } from 'react';
import { Source, Message, SearchThread, FocusMode, Video, AIMode } from '@/types/search';
import { generateAnswer } from '@/services/geminiService';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export function useSearch(user: User | null) {
  const [threads, setThreads] = useState<SearchThread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSourcesLoading, setIsSourcesLoading] = useState(false);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [aiMode, setAiMode] = useState<AIMode>('research');

  const generateId = () => Math.random().toString(36).substring(2, 15);

  // Load threads from database when user changes
  useEffect(() => {
    if (user) {
      loadThreads();
    } else {
      setThreads([]);
    }
  }, [user]);

  const loadThreads = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('search_threads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading threads:', error);
      return;
    }

    const loadedThreads: SearchThread[] = data.map(t => ({
      id: t.id,
      query: t.query,
      answer: t.answer,
      sources: (t.sources as unknown) as Source[],
      images: (t.images as unknown) as string[],
      videos: [], // Videos not persisted to DB yet
      createdAt: new Date(t.created_at),
    }));

    setThreads(loadedThreads);
  };

  const saveThread = async (thread: SearchThread) => {
    if (!user) return;

    const { error } = await supabase
      .from('search_threads')
      .insert([{
        user_id: user.id,
        query: thread.query,
        answer: thread.answer,
        sources: JSON.parse(JSON.stringify(thread.sources)),
        images: JSON.parse(JSON.stringify(thread.images)),
      }]);

    if (error) {
      console.error('Error saving thread:', error);
    }
  };

  const fetchRelatedQuestions = async (query: string, answer: string) => {
    setIsRelatedLoading(true);
    setRelatedQuestions([]);

    try {
      const { data, error } = await supabase.functions.invoke('related-questions', {
        body: { query, answer },
      });

      if (error) {
        console.error('Error fetching related questions:', error);
        return;
      }

      setRelatedQuestions(data.questions || []);
    } catch (err) {
      console.error('Error fetching related questions:', err);
    } finally {
      setIsRelatedLoading(false);
    }
  };

  const search = useCallback(async (query: string, focus: FocusMode) => {
    setHasSearched(true);
    setIsLoading(true);
    setIsSourcesLoading(true);
    setRelatedQuestions([]);
    
    // For follow-ups, don't reset sources/images/videos - they accumulate
    const isFollowUp = messages.length > 0;
    if (!isFollowUp) {
      setSources([]);
      setImages([]);
      setVideos([]);
    }

    // Capture current messages for conversation history before adding new ones
    const conversationHistory = [...messages];

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: query,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Create assistant message placeholder
    const assistantId = generateId();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };
    setMessages((prev) => [...prev, assistantMessage]);

    let currentSources: Source[] = [];
    let currentImages: string[] = [];
    let currentVideos: Video[] = [];

    // Generate answer using real AI
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    await generateAnswer(query, {
      onStart: () => {
        setIsSourcesLoading(false);
      },
      onSources: (newSources, newImages, newVideos) => {
        currentSources = newSources;
        currentImages = newImages || [];
        currentVideos = newVideos || [];
        setSources(prev => isFollowUp ? [...prev, ...newSources] : newSources);
        setImages(prev => isFollowUp ? [...prev, ...(newImages || [])] : (newImages || []));
        setVideos(prev => isFollowUp ? [...prev, ...(newVideos || [])] : (newVideos || []));
        setIsSourcesLoading(false);
      },
      onChunk: (chunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        );
      },
      onComplete: (fullText) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: fullText, isStreaming: false }
              : msg
          )
        );
        setIsLoading(false);

        // Fetch related questions
        fetchRelatedQuestions(query, fullText);

        // Save thread (only on initial search, not follow-ups)
        if (!isFollowUp) {
          const thread: SearchThread = {
            id: generateId(),
            query,
            answer: fullText,
            sources: currentSources,
            images: currentImages,
            videos: currentVideos,
            createdAt: new Date(),
          };
          setThreads((prev) => [thread, ...prev]);
          setCurrentThreadId(thread.id);
          
          // Persist to database if user is logged in
          if (user) {
            saveThread(thread);
          }
        }
      },
      onError: (error) => {
        console.error('Search error:', error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: `Error: ${error.message}`, isStreaming: false }
              : msg
          )
        );
        setIsLoading(false);
        setIsSourcesLoading(false);
      },
    }, supabaseUrl, supabaseKey, conversationHistory, aiMode);
  }, [messages, user, aiMode]);

  const newThread = useCallback(() => {
    setMessages([]);
    setSources([]);
    setImages([]);
    setVideos([]);
    setRelatedQuestions([]);
    setCurrentThreadId(null);
    setHasSearched(false);
  }, []);

  const selectThread = useCallback((id: string) => {
    const thread = threads.find((t) => t.id === id);
    if (thread) {
      setCurrentThreadId(id);
      setSources(thread.sources);
      setImages(thread.images || []);
      setVideos(thread.videos || []);
      setRelatedQuestions([]);
      setMessages([
        { id: generateId(), role: 'user', content: thread.query },
        { id: generateId(), role: 'assistant', content: thread.answer },
      ]);
      setHasSearched(true);
      
      // Fetch related questions for restored thread
      fetchRelatedQuestions(thread.query, thread.answer);
    }
  }, [threads]);

  const deleteThread = useCallback(async (id: string) => {
    if (user) {
      await supabase.from('search_threads').delete().eq('id', id);
    }
    setThreads(prev => prev.filter(t => t.id !== id));
    
    if (currentThreadId === id) {
      newThread();
    }
  }, [user, currentThreadId, newThread]);

  return {
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
  };
}
