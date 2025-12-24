"use client";

import React from 'react';
import { CameraData } from '@/types/camera';
import { getCameraFeed } from '@/data/mock-cameras';

interface InfoTabProps {
  camera: CameraData;
}

export const InfoTab: React.FC<InfoTabProps> = ({ camera }) => {
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
    <div className="w-full h-full overflow-auto p-4 space-y-4">
      {/* Status Section */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Status</h4>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusColors[camera.status]}`} />
          <span className="text-sm">{statusText[camera.status]}</span>
        </div>
      </div>

      {/* Camera Information */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Camera Details</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{camera.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID:</span>
            <span className="font-mono">{camera.id}</span>
          </div>
          {camera.type && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="capitalize">{camera.type}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stream Type:</span>
            <span>{feed.isImageStream ? 'Traffic Cam' : feed.isYouTube ? 'YouTube Live' : 'Live Stream'}</span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Location</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">X Position:</span>
            <span className="font-mono">{camera.position[0].toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Y Position:</span>
            <span className="font-mono">{camera.position[1].toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Z Position:</span>
            <span className="font-mono">{camera.position[2].toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Stream Information */}
      {feed.liveUrl && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Stream Info</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">URL:</span>
              <a 
                href={feed.liveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline truncate max-w-[200px]"
              >
                {feed.liveUrl.substring(0, 30)}...
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Protocol:</span>
              <span>
                {feed.liveUrl.includes('.m3u8') ? 'HLS' : 
                 feed.isYouTube ? 'YouTube' : 
                 feed.isImageStream ? 'HTTP' : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Technical Details */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Technical</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Auto-refresh:</span>
            <span>{feed.isImageStream ? 'Enabled (2s)' : 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated:</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
