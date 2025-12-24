"use client";

import React from 'react';
import { CameraData } from '@/types/camera';
import { getCameraFeed } from '@/data/mock-cameras';

interface LiveViewTabProps {
  camera: CameraData;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  refreshKey: number;
}

export const LiveViewTab: React.FC<LiveViewTabProps> = ({ 
  camera, 
  videoRef, 
  refreshKey 
}) => {
  const feed = getCameraFeed(camera.id);

  return (
    <div className="relative w-full h-full bg-black">
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
              key={refreshKey}
              src={feed.liveUrl}
              alt={camera.name}
              className="w-full h-full object-contain bg-gray-900"
              onError={(e) => {
                console.error('Failed to load camera image:', feed.liveUrl);
                const img = e.target as HTMLImageElement;
                if (!img.dataset.retried) {
                  img.dataset.retried = 'true';
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
            <div className="text-sm">Camera Offline</div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white">
          <div className="text-center">
            <p className="text-sm text-red-400">Connection Error</p>
          </div>
        </div>
      )}
    </div>
  );
};
