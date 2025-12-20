import { useState } from 'react';
import { Image, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ImagesSidebarProps {
  images: string[];
  isLoading: boolean;
}

export function ImagesSidebar({ images, isLoading }: ImagesSidebarProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (url: string) => {
    setFailedImages(prev => new Set(prev).add(url));
  };

  const validImages = images.filter(img => !failedImages.has(img));

  if (!isLoading && validImages.length === 0) {
    return null;
  }

  return (
    <>
      <aside className="hidden xl:block w-72 flex-shrink-0 sticky top-0 h-fit p-4">
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground">Related Images</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </>
          ) : (
            validImages.map((url, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(url)}
                className="group relative aspect-square rounded-lg overflow-hidden bg-secondary/50 hover:ring-2 hover:ring-primary/50 transition-all"
              >
                <img
                  src={url}
                  alt={`Related image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={() => handleImageError(url)}
                />
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
