import { useState } from 'react';
import { Image, Video, X, Play, ExternalLink, Images, Film } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Video as VideoType } from '@/types/search';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MediaSidebarProps {
  images: string[];
  videos: VideoType[];
  isLoading: boolean;
}

export function MediaSidebar({ images, videos, isLoading }: MediaSidebarProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleImageError = (url: string) => {
    setFailedImages(prev => new Set(prev).add(url));
  };

  const validImages = images.filter(img => !failedImages.has(img));
  const hasContent = validImages.length > 0 || videos.length > 0;

  if (!isLoading && !hasContent) {
    return null;
  }

  const VideosContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={isMobile ? "space-y-3" : "space-y-2"}>
      {isLoading ? (
        <>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="w-28 h-16 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </>
      ) : (
        videos.map((video) => (
          <button
            key={video.id}
            onClick={() => {
              setSelectedVideo(video);
              setDrawerOpen(false);
            }}
            className={`group flex gap-3 w-full text-left p-2 rounded-xl hover:bg-secondary/50 transition-colors ${isMobile ? 'bg-secondary/30' : ''}`}
          >
            <div className={`relative ${isMobile ? 'w-32 h-20' : 'w-28 h-16'} rounded-lg overflow-hidden bg-secondary/50 flex-shrink-0`}>
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0 py-0.5">
              <p className={`font-medium text-foreground line-clamp-2 leading-tight ${isMobile ? 'text-sm' : 'text-xs'}`}>
                {video.title}
              </p>
              {video.channel && (
                <p className={`text-muted-foreground mt-1 truncate ${isMobile ? 'text-xs' : 'text-[10px]'}`}>
                  {video.channel}
                </p>
              )}
            </div>
          </button>
        ))
      )}
    </div>
  );

  const ImagesContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
      {isLoading ? (
        <>
          {[...Array(isMobile ? 6 : 4)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </>
      ) : (
        validImages.slice(0, isMobile ? 9 : 6).map((url, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedImage(url);
              setDrawerOpen(false);
            }}
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
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden xl:block w-80 flex-shrink-0 sticky top-0 h-fit p-4 space-y-6">
        {/* Videos Section */}
        {(videos.length > 0 || isLoading) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Video className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-medium text-muted-foreground">Related Videos</h3>
            </div>
            <VideosContent />
          </div>
        )}

        {/* Images Section */}
        {(validImages.length > 0 || isLoading) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Related Images</h3>
            </div>
            <ImagesContent />
          </div>
        )}
      </aside>

      {/* Mobile Drawer Trigger - Fixed button */}
      <div className="xl:hidden fixed bottom-24 right-4 z-40">
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
              <div className="flex -space-x-1">
                <Film className="w-4 h-4" />
                <Images className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Media</span>
              {(videos.length + validImages.length) > 0 && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary-foreground/20 text-xs font-semibold">
                  {videos.length + validImages.length}
                </span>
              )}
            </button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="text-center">Related Media</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6 overflow-y-auto">
              <Tabs defaultValue={videos.length > 0 ? "videos" : "images"} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="videos" className="gap-2">
                    <Film className="w-4 h-4" />
                    Videos
                    {videos.length > 0 && (
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{videos.length}</span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="images" className="gap-2">
                    <Images className="w-4 h-4" />
                    Images
                    {validImages.length > 0 && (
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{validImages.length}</span>
                    )}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="videos" className="mt-0">
                  {videos.length > 0 || isLoading ? (
                    <VideosContent isMobile />
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No videos found</p>
                  )}
                </TabsContent>
                <TabsContent value="images" className="mt-0">
                  {validImages.length > 0 || isLoading ? (
                    <ImagesContent isMobile />
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No images found</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Image Lightbox */}
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

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <button
            onClick={() => setSelectedVideo(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <div 
            className="w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.url)}?autoplay=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-white">{selectedVideo.title}</h3>
                {selectedVideo.channel && (
                  <p className="text-sm text-gray-400 mt-1">{selectedVideo.channel}</p>
                )}
              </div>
              <a
                href={selectedVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-primary hover:underline flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
                Open on YouTube
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getYouTubeId(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v') || '';
    } else if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1);
    }
  } catch {
    return '';
  }
  return '';
}
