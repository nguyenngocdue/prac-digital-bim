export interface CameraData {
  id: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  streamUrl: string;
  imageUrl?: string; // Optional image URL for static feeds
  status: 'online' | 'offline' | 'error';
  type: 'security' | 'ptz';
  roomId?: string;
}

export interface CameraFeed {
  cameraId: string;
  thumbnail?: string;
  liveUrl?: string;
  recordingUrl?: string;
  isImageStream?: boolean; // For MJPEG/static image streams
  isYouTube?: boolean; // Flag for YouTube iframe streams
}
