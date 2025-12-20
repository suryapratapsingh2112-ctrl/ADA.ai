import { Source, Message, Video, AIMode } from '@/types/search';
import { searchWeb, buildContextPrompt } from './searchService';

interface StreamCallbacks {
  onStart: () => void;
  onChunk: (chunk: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
  onSources: (sources: Source[], images?: string[], videos?: Video[]) => void;
}

export async function generateAnswer(
  query: string,
  callbacks: StreamCallbacks,
  supabaseUrl?: string,
  supabaseKey?: string,
  conversationHistory?: Message[],
  mode: AIMode = 'research'
): Promise<void> {
  callbacks.onStart();

  try {
    // Step 1: Search for sources
    const result = await searchWeb(query);
    callbacks.onSources(result.sources, result.images, result.videos);

    // Step 2: Build messages with conversation history
    const systemPrompt = buildContextPrompt(query, result.sources);
    
    // Build messages array with conversation history for follow-ups
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Add previous conversation for context (if any)
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
      });
    }
    
    // Add the current query
    messages.push({ role: 'user', content: query });

    // Step 3: Call AI through edge function (Lovable AI Gateway)
    if (!supabaseUrl) {
      throw new Error('Backend not configured. Please enable Lovable Cloud.');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ messages, mode }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('Usage limit reached. Please add credits.');
      }
      throw new Error('Failed to get AI response');
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            fullText += content;
            callbacks.onChunk(content);
          }
        } catch {
          buffer = line + '\n' + buffer;
          break;
        }
      }
    }

    callbacks.onComplete(fullText);
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
  }
}

// Mock streaming for demo without backend
export async function generateMockAnswer(
  query: string,
  callbacks: StreamCallbacks
): Promise<void> {
  callbacks.onStart();

  try {
    const result = await searchWeb(query);
    callbacks.onSources(result.sources, result.images, result.videos);

    const mockAnswer = `## Understanding ${query}

Based on the search results, here's what I found:

${query} is a topic that has garnered significant attention in recent years [1]. According to Wikipedia, it encompasses various aspects that are crucial to understand [1].

### Key Points

1. **Historical Context**: The concept has evolved significantly over time, with major developments occurring in the past decade [2].

2. **Current Applications**: Today, ${query} is widely used in multiple fields including technology, science, and everyday applications [3].

3. **Future Implications**: Experts predict that this area will continue to grow, with new innovations emerging regularly [4].

### Technical Details

The underlying mechanisms involve several complex processes:

\`\`\`javascript
// Example code snippet
const example = {
  topic: "${query}",
  relevance: "high",
  applications: ["research", "development", "analysis"]
};
\`\`\`

### Conclusion

In summary, ${query} represents an important area of study with broad implications across various domains [5]. The ongoing research continues to uncover new insights and applications.

*Sources cited from search results above.*`;

    // Simulate streaming
    const words = mockAnswer.split(' ');
    let fullText = '';

    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 20));
      fullText += word + ' ';
      callbacks.onChunk(word + ' ');
    }

    callbacks.onComplete(fullText.trim());
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
  }
}
