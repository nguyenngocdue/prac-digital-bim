"use client";

import { Button } from "@/components/ui/button";
import { 
  X, 
  Maximize2, 
  Download, 
  Camera as CameraIcon, 
  RefreshCw, 
  Move, 
  Video, 
  Info, 
  Workflow as WorkflowIcon,
  Box as BoxIcon,
  Calculator
} from "lucide-react";
import { CameraData } from "@/types/camera";
import { getCameraFeed } from "@/data/mock-cameras";
import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { LiveViewTab } from "./tabs/live-view-tab";
import { InfoTab } from "./tabs/info-tab";
import { WorkflowTab } from "./tabs/workflow-tab";
import { ThreeDViewTab } from "./tabs/3d-view-tab";
import { ComputationsTab } from "./tabs/computations-tab";

interface CameraViewerPanelProps {
  camera: CameraData | null;
  onClose: () => void;
  className?: string;
}

type TabType = 'live' | '3d' | 'info' | 'workflow' | 'computations';

export const CameraViewerPanel = ({ 
  camera, 
  onClose,
  className = "" 
}: CameraViewerPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('live');
  const [refreshKey, setRefreshKey] = useState(0);
  const [size, setSize] = useState({ width: 700, height: 500 });
  const [position, setPosition] = useState({ x: 24, y: -120 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  
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
        
        hls.on(Hls.Events.ERROR, (_event, data) => {
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
    <Draggable
      nodeRef={nodeRef}
      handle=".drag-handle"
      position={position}
      onStop={(_e, data) => setPosition({ x: data.x, y: data.y })}
      bounds="parent"
    >
      <div ref={nodeRef} className={`absolute bottom-24 left-6 z-9999 ${className}`} style={{ width: size.width }}>
        <ResizableBox
          width={size.width}
          height={size.height}
          minConstraints={[400, 350]}
          maxConstraints={[1200, 800]}
          onResize={(_e, data) => setSize({ width: data.size.width, height: data.size.height })}
          resizeHandles={['se', 'sw', 'ne', 'nw', 'e', 'w', 's', 'n']}
          className="viewer-panel rounded-xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header with tabs */}
          <div className="flex flex-col border-b">
            {/* Title bar */}
            <div className="drag-handle flex items-center justify-between p-3 cursor-move hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4 text-muted-foreground" />
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

            {/* Tabs */}
            <div className="flex items-center px-3 gap-1 bg-muted/30">
              <button
                onClick={() => setActiveTab('live')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors rounded-t ${
                  activeTab === 'live' 
                    ? 'bg-background text-foreground border-t border-x' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Video className="h-3.5 w-3.5" />
                Live
              </button>
              <button
                onClick={() => setActiveTab('3d')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors rounded-t ${
                  activeTab === '3d' 
                    ? 'bg-background text-foreground border-t border-x' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <BoxIcon className="h-3.5 w-3.5" />
                3D
              </button>
              <button
                onClick={() => setActiveTab('workflow')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors rounded-t ${
                  activeTab === 'workflow' 
                    ? 'bg-background text-foreground border-t border-x' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <WorkflowIcon className="h-3.5 w-3.5" />
                Workflow
              </button>
              <button
                onClick={() => setActiveTab('computations')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors rounded-t ${
                  activeTab === 'computations' 
                    ? 'bg-background text-foreground border-t border-x' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Calculator className="h-3.5 w-3.5" />
                Computations
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors rounded-t ${
                  activeTab === 'info' 
                    ? 'bg-background text-foreground border-t border-x' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Info className="h-3.5 w-3.5" />
                Info
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden" style={{ height: size.height - 120 }}>
            {activeTab === 'live' && (
              <LiveViewTab 
                camera={camera} 
                videoRef={videoRef} 
                refreshKey={refreshKey}
              />
            )}
            {activeTab === '3d' && (
              <ThreeDViewTab camera={camera} />
            )}
            {activeTab === 'info' && (
              <InfoTab camera={camera} />
            )}
            {activeTab === 'workflow' && (
              <WorkflowTab 
                cameraId={camera.id} 
                cameraName={camera.name}
              />
            )}
            {activeTab === 'computations' && (
              <ComputationsTab camera={camera} />
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between p-3 border-t bg-muted/30">
            <div className="flex gap-1">
              {activeTab === 'live' && feed.liveUrl && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                    onClick={() => window.open(feed.liveUrl, '_blank')}
                  >
                    <Maximize2 className="h-3 w-3 mr-1" />
                    <span className="text-xs">Open</span>
                  </Button>
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
                    onClick={() => alert('Screenshot feature')}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    <span className="text-xs">Snapshot</span>
                  </Button>
                </>
              )}
            </div>
            
            <div className="flex flex-col items-end">
              {camera.type && (
                <span className="text-xs text-muted-foreground capitalize">
                  {camera.type}
                </span>
              )}
              <span className="text-[10px] text-green-500">
                ● {feed.isImageStream ? 'Traffic Cam' : feed.isYouTube ? 'YouTube Live' : 'Live Stream'}
              </span>
            </div>
          </div>
        </ResizableBox>
      </div>
    </Draggable>
  );
};
