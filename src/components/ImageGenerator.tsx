import { useState } from 'react';
import { ImageIcon, Loader2, Download, X, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface ImageGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImageGenerator({ isOpen, onClose }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({ description: "Bhai, prompt toh daal! 😅", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setImageUrl(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        toast({ description: "Image generated! 🔥" });
      } else {
        throw new Error('No image received');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        description: error instanceof Error ? error.message : 'Failed to generate image',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-card border border-border rounded-xl p-6 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="p-2 rounded-lg bg-primary/10">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Image Generator ✨</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create... (e.g., 'A futuristic city with flying cars at sunset')"
              className="w-full h-24 px-4 py-3 bg-secondary/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
              disabled={isGenerating}
            />
          </div>

          <Button
            onClick={generateImage}
            disabled={isGenerating || !prompt.trim()}
            className="w-full h-12 text-base font-medium"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating... Thoda wait kar bhai 🎨
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5 mr-2" />
                Generate Image
              </>
            )}
          </Button>
        </div>

        {/* Generated Image */}
        {imageUrl && (
          <div className="mt-6 space-y-4 animate-fade-in">
            <div className="relative rounded-xl overflow-hidden border border-border bg-secondary/30">
              <img
                src={imageUrl}
                alt="Generated"
                className="w-full h-auto max-h-[400px] object-contain"
              />
            </div>
            <Button
              onClick={downloadImage}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Image
            </Button>
          </div>
        )}

        {/* Loading state placeholder */}
        {isGenerating && (
          <div className="mt-6 rounded-xl border border-border bg-secondary/30 h-64 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
              <p className="text-muted-foreground">Creating your masterpiece... 🎨</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
