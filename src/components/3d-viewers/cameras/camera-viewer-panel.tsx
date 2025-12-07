"use client";

import { Button } from "@/components/ui/button";
import { X, Maximize2, Download, Camera as CameraIcon, RefreshCw } from "lucide-react";
import { CameraData } from "@/types/camera";
import { getCameraFeed } from "@/data/mock-cameras";
import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";

interface CameraViewerPanelProps {
  camera: CameraData | null;
  onClose: () => void;
  className?: string;
}

export const CameraViewerPanel = ({ 
  camera, 
  onClose,
  className = "" 
}: CameraViewerPanelProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  // Auto-refresh for image streams every 2 seconds
  useEffect(() => {
    if (!camera) return;
    
    const feed = getCameraFeed(camera.id);
    if (feed.isImageStream) {
      const interval = setInterval(() => {
        setRefreshKey(prev => prev + 1);
      }, 2000); // Refresh every 2 seconds
      
      return () => clearInterval(interval);
    }
  }, [camera]);

  // HLS player setup
  useEffect(() => {
    if (!camera || !videoRef.current) return;

    const feed = getCameraFeed(camera.id);
    
    // Only setup HLS for non-YouTube, non-image video streams
    if (!feed.liveUrl || feed.isYouTube || feed.isImageStream) return;

    const video = videoRef.current;

    // Check if the URL is an HLS stream (.m3u8)
    if (feed.liveUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        // Use hls.js for browsers that don't natively support HLS
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        
        hlsRef.current = hls;
        
        hls.loadSource(feed.liveUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ HLS manifest loaded, attempting to play:', camera.name);
          video.play().catch(err => {
            console.warn('Auto-play blocked, user interaction needed:', err);
          });
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('❌ HLS Error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('Network error, attempting to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('Media error, attempting to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.error('Fatal error, destroying HLS instance');
                hls.destroy();
                break;
            }
          }
        });

        return () => {
          if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
          }
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = feed.liveUrl;
        video.addEventListener('loadedmetadata', () => {
          console.log('✅ Native HLS loaded:', camera.name);
          video.play().catch(err => {
            console.warn('Auto-play blocked:', err);
          });
        });
      }
    } else {
      // Regular video file (MP4, etc.)
      video.src = feed.liveUrl;
    }
  }, [camera]);
  
  if (!camera) return null;

  const feed = getCameraFeed(camera.id);
  
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    error: 'bg-red-500'
  };
  
  const statusText = {
    online: 'Live',
    offline: 'Offline',
    error: 'Error'
  };

  return (
    <div className={`absolute bottom-24 left-6 z-50 ${className}`}>
      <div className="bg-background/95 backdrop-blur-sm rounded-lg shadow-2xl border w-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <CameraIcon className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">{camera.name}</h3>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${statusColors[camera.status]}`} />
              <span className="text-xs text-muted-foreground">
                {statusText[camera.status]}
              </span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Video Feed */}
        <div className="relative aspect-video bg-black">
          {camera.status === 'online' ? (
            <>
              {/* YouTube iframe stream */}
              {feed.liveUrl && feed.isYouTube ? (
                <iframe
                  key={camera.id}
                  src={feed.liveUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={camera.name}
                />
              ) : feed.liveUrl && !feed.isImageStream && !feed.isYouTube ? (
                // HLS/MP4 Video stream with hls.js support
                <video
                  ref={videoRef}
                  key={camera.id}
                  autoPlay
                  muted
                  playsInline
                  controls
                  className="w-full h-full object-contain"
                />
              ) : feed.liveUrl && feed.isImageStream ? (
                <img 
                  key={refreshKey} // Force refresh
                  src={feed.liveUrl}
                  alt={camera.name}
                  className="w-full h-full object-contain bg-gray-900"
                  onError={(e) => {
                    console.error('Failed to load camera image:', feed.liveUrl);
                    const img = e.target as HTMLImageElement;
                    if (!img.dataset.retried) {
                      img.dataset.retried = 'true';
                      // Show fallback image
                      img.src = `https://picsum.photos/seed/${camera.id}/400/300`;
                    }
                  }}
                  onLoad={() => {
                    console.log('✅ Camera loaded:', camera.name);
                  }}
                />
              ) : null}
              
              {/* Live Indicator */}
              <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
              
              {/* Refresh indicator for image streams */}
              {feed.isImageStream && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded flex items-center gap-1 z-10">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Auto-refresh
                </div>
              )}
              
              {/* Camera info overlay */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs p-2 rounded z-10">
                <div className="flex justify-between items-center">
                  <span>{camera.name}</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </>
          ) : camera.status === 'offline' ? (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <CameraIcon className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                <p className="text-sm">Camera Offline</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <CameraIcon className="h-12 w-12 mx-auto mb-2 text-red-500" />
                <p className="text-sm text-red-400">Connection Error</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-3 border-t">
          <div className="flex gap-1">
            {feed.liveUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={() => window.open(feed.liveUrl, '_blank')}
              >
                <Maximize2 className="h-3 w-3 mr-1" />
                <span className="text-xs">Open Direct</span>
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => setRefreshKey(prev => prev + 1)}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              <span className="text-xs">Refresh</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => {
                alert('Screenshot feature - will capture current frame');
              }}
            >
              <Download className="h-3 w-3 mr-1" />
              <span className="text-xs">Snapshot</span>
            </Button>
          </div>
          
          <div className="flex flex-col items-end">
            {camera.type && (
              <span className="text-xs text-muted-foreground capitalize">
                {camera.type}
              </span>
            )}
            <span className="text-[10px] text-green-500">
              ● {feed.isImageStream ? 'Traffic Cam' : 'Live Stream'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
