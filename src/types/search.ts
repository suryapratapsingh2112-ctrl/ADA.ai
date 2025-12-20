export interface Source {
  id: string;
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
  domain: string;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  channel?: string;
}

export interface SearchThread {
  id: string;
  query: string;
  answer: string;
  sources: Source[];
  images: string[];
  videos: Video[];
  createdAt: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
}

export interface SearchResult {
  sources: Source[];
  images: string[];
  videos: Video[];
}

export type FocusMode = 'all' | 'academic' | 'reddit' | 'news';

export type AIMode = 'research' | 'code';
