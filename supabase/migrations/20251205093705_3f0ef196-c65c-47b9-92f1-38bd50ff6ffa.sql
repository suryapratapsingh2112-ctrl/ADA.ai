-- Create search_threads table
CREATE TABLE public.search_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  answer TEXT NOT NULL,
  sources JSONB NOT NULL DEFAULT '[]',
  images JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.search_threads ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own threads"
ON public.search_threads
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own threads"
ON public.search_threads
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own threads"
ON public.search_threads
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_search_threads_user_id ON public.search_threads(user_id);
CREATE INDEX idx_search_threads_created_at ON public.search_threads(created_at DESC);