"use client";

import { Button } from "@/components/ui/button";
import { X, Maximize2, Download, Camera as CameraIcon, RefreshCw } from "lucide-react";
import { CameraData } from "@/types/camera";
import { getCameraFeed } from "@/data/mock-cameras";
import { useState, useEffect } from "react";

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
              ) : feed.liveUrl && !feed.isImageStream ? (
                <video
                  key={camera.id}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  className="w-full h-full object-contain"
                  src={feed.liveUrl}
                  onError={(e) => {
                    console.error('Failed to load video stream:', feed.liveUrl);
                  }}
                  onLoadedData={() => {
                    console.log('✅ Video stream loaded:', camera.name);
                  }}
                >
                  <source src={feed.liveUrl} type="application/x-mpegURL" />
                  <source src={feed.liveUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
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
