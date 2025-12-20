import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, searchDepth = 'basic', maxResults = 5 } = await req.json();

    if (!query) {
      console.error('No query provided');
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tavilyApiKey = Deno.env.get('TAVILY_API_KEY');
    if (!tavilyApiKey) {
      console.error('TAVILY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Tavily API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Searching Tavily for: "${query}" with depth: ${searchDepth}, maxResults: ${maxResults}`);

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query,
        search_depth: searchDepth,
        max_results: maxResults,
        include_answer: false,
        include_raw_content: false,
        include_images: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Tavily API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Tavily API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log(`Tavily returned ${data.results?.length || 0} results and ${data.images?.length || 0} images`);

    const sources = (data.results || []).map((result: any, index: number) => {
      const url = new URL(result.url);
      return {
        id: String(index + 1),
        title: result.title,
        url: result.url,
        snippet: result.content,
        favicon: `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`,
        domain: url.hostname.replace('www.', ''),
      };
    });

    const images = (data.images || []).slice(0, 6);

    // Extract YouTube videos from results
    const videos = (data.results || [])
      .filter((result: any) => {
        const url = result.url.toLowerCase();
        return url.includes('youtube.com/watch') || url.includes('youtu.be/');
      })
      .slice(0, 4)
      .map((result: any, index: number) => {
        let videoId = '';
        try {
          const url = new URL(result.url);
          if (url.hostname.includes('youtube.com')) {
            videoId = url.searchParams.get('v') || '';
          } else if (url.hostname.includes('youtu.be')) {
            videoId = url.pathname.slice(1);
          }
        } catch {
          videoId = '';
        }
        
        return {
          id: String(index + 1),
          title: result.title,
          url: result.url,
          thumbnailUrl: videoId 
            ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
            : '',
          channel: result.domain || '',
        };
      })
      .filter((v: any) => v.thumbnailUrl);

    console.log(`Found ${videos.length} YouTube videos`);

    return new Response(
      JSON.stringify({ sources, images, videos }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in tavily-search function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
