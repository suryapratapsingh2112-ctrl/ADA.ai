import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GoogleSearchItem {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  pagemap?: {
    cse_thumbnail?: Array<{ src: string }>;
    cse_image?: Array<{ src: string }>;
    videoobject?: Array<{ 
      name: string;
      thumbnailurl: string;
      embedurl?: string;
      url?: string;
    }>;
  };
}

interface GoogleSearchResponse {
  items?: GoogleSearchItem[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
  error?: {
    message: string;
    code: number;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, maxResults = 5 } = await req.json();
    
    const API_KEY = Deno.env.get("GOOGLE_CSE_API_KEY");
    const CSE_ID = Deno.env.get("GOOGLE_CSE_ID");

    if (!API_KEY || !CSE_ID) {
      console.error("Missing Google CSE configuration");
      throw new Error("Google Search not configured");
    }

    console.log(`Searching Google for: "${query}" with max ${maxResults} results`);

    // Search for web results
    const searchUrl = new URL("https://www.googleapis.com/customsearch/v1");
    searchUrl.searchParams.set("key", API_KEY);
    searchUrl.searchParams.set("cx", CSE_ID);
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("num", String(Math.min(maxResults, 10)));

    const response = await fetch(searchUrl.toString());
    const data: GoogleSearchResponse = await response.json();

    if (data.error) {
      console.error("Google Search API error:", data.error);
      throw new Error(data.error.message);
    }

    console.log(`Found ${data.items?.length || 0} results`);

    // Transform results to our format
    const sources = (data.items || []).map((item, index) => ({
      id: `source-${index}`,
      title: item.title,
      url: item.link,
      snippet: item.snippet || "",
      domain: item.displayLink,
      favicon: `https://www.google.com/s2/favicons?domain=${item.displayLink}&sz=32`,
    }));

    // Extract images from results
    const images: string[] = [];
    for (const item of data.items || []) {
      if (item.pagemap?.cse_image?.[0]?.src) {
        images.push(item.pagemap.cse_image[0].src);
      } else if (item.pagemap?.cse_thumbnail?.[0]?.src) {
        images.push(item.pagemap.cse_thumbnail[0].src);
      }
    }

    // Also do an image-specific search
    const imageSearchUrl = new URL("https://www.googleapis.com/customsearch/v1");
    imageSearchUrl.searchParams.set("key", API_KEY);
    imageSearchUrl.searchParams.set("cx", CSE_ID);
    imageSearchUrl.searchParams.set("q", query);
    imageSearchUrl.searchParams.set("searchType", "image");
    imageSearchUrl.searchParams.set("num", "5");

    try {
      const imageResponse = await fetch(imageSearchUrl.toString());
      const imageData: GoogleSearchResponse = await imageResponse.json();
      
      if (imageData.items) {
        for (const item of imageData.items) {
          if (item.link && !images.includes(item.link)) {
            images.push(item.link);
          }
        }
      }
    } catch (imgError) {
      console.error("Image search error:", imgError);
      // Continue without additional images
    }

    // Extract videos from results
    const videos = [];
    for (const item of data.items || []) {
      if (item.pagemap?.videoobject?.[0]) {
        const video = item.pagemap.videoobject[0];
        videos.push({
          id: `video-${videos.length}`,
          title: video.name || item.title,
          url: item.link,
          thumbnailUrl: video.thumbnailurl || "",
          channel: item.displayLink,
        });
      } else if (item.link.includes("youtube.com") || item.link.includes("youtu.be")) {
        videos.push({
          id: `video-${videos.length}`,
          title: item.title,
          url: item.link,
          thumbnailUrl: item.pagemap?.cse_thumbnail?.[0]?.src || "",
          channel: "YouTube",
        });
      }
    }

    console.log(`Returning ${sources.length} sources, ${images.length} images, ${videos.length} videos`);

    return new Response(
      JSON.stringify({
        sources,
        images: images.slice(0, 8),
        videos: videos.slice(0, 5),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Google search error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Search failed",
        sources: [],
        images: [],
        videos: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
