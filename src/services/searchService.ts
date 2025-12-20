import { Source, SearchResult } from '@/types/search';
import { supabase } from '@/integrations/supabase/client';

export async function searchWeb(query: string): Promise<SearchResult> {
  const { data, error } = await supabase.functions.invoke('tavily-search', {
    body: { query, searchDepth: 'basic', maxResults: 5 },
  });

  if (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search the web');
  }

  return {
    sources: data.sources || [],
    images: data.images || [],
    videos: data.videos || [],
  };
}

export function buildContextPrompt(query: string, sources: Source[]): string {
  const sourceContext = sources
    .map((source, index) => `[${index + 1}] ${source.title}: ${source.snippet}`)
    .join('\n\n');

  return `You are an AI research assistant. Answer questions using the provided search results.
Be comprehensive but concise. Use markdown formatting for better readability.
When citing information, use numbered brackets like [1], [2], etc. to reference the sources.

For follow-up questions, use context from the conversation history to provide relevant answers.
If the follow-up question relates to previous answers, build upon that context.

Current Search Results:
${sourceContext}

Provide well-structured answers with proper citations when referencing search results.`;
}
