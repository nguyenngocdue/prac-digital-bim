import { CameraData } from '@/types/camera';

// Camera feeds - Using YouTube live streams
export const mockCameras: CameraData[] = [
  {
    id: 'cam-01',
    name: 'Tokyo Shibuya Crossing Live',
    position: [-6, 2.5, 8],
    rotation: [0, Math.PI / 4, 0],
    // YouTube live stream
    streamUrl: 'https://www.youtube.com/embed/AShvF9ILGkc?autoplay=1&mute=1',
    imageUrl: undefined,
    status: 'online',
    type: 'security',
    roomId: 'r24'
  },
  {
    id: 'cam-02',
    name: 'Live Camera Feed 1',
    position: [0, 2.5, 5],
    rotation: [0, 0, 0],
    streamUrl: 'https://www.youtube.com/embed/ADAdsOny7Mo?autoplay=1&mute=1',
    imageUrl: undefined,
    status: 'online',
    type: 'ptz',
    roomId: 'r31'
  },
  {
    id: 'cam-03',
    name: 'Live Camera Feed 2',
    position: [4, 2.5, 2],
    rotation: [0, -Math.PI / 4, 0],
    streamUrl: 'https://www.youtube.com/embed/YYiid3jUUQE?autoplay=1&mute=1',
    imageUrl: undefined,
    status: 'online',
    type: 'security',
    roomId: 'r33'
  },
  {
    id: 'cam-04',
    name: 'Live Camera Feed 3',
    position: [-4, 2.5, -4],
    rotation: [0, Math.PI / 2, 0],
    streamUrl: 'https://www.youtube.com/embed/HiOvVp-wMj0?autoplay=1&mute=1',
    imageUrl: undefined,
    status: 'online',
    type: 'security',
    roomId: 'r22'
  },
  {
    id: 'cam-05',
    name: 'Image Feed 1',
    position: [6, 2.5, -1],
    rotation: [0, -Math.PI / 2, 0],
    streamUrl: 'https://www.webcamtaxi.com',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    status: 'online',
    type: 'security',
    roomId: 'r17'
  },
  {
    id: 'cam-06',
    name: 'Image Feed 2',
    position: [0, 3, 0],
    rotation: [-Math.PI / 4, 0, 0],
    streamUrl: 'https://www.webcamtaxi.com',
    imageUrl: 'https://picsum.photos/800/600?random=3',
    status: 'online',
    type: 'ptz'
  }
];

// Get camera feed - supports both YouTube iframe and image streams
export const getCameraFeed = (cameraId: string) => {
  const camera = mockCameras.find(c => c.id === cameraId);
  const imageUrl = camera?.imageUrl;
  const streamUrl = camera?.streamUrl;
  
  // If no imageUrl, it's a video/iframe stream (YouTube)
  if (!imageUrl) {
    return {
      cameraId,
      thumbnail: `https://picsum.photos/seed/${cameraId}/400/300`,
      liveUrl: streamUrl,
      recordingUrl: streamUrl,
      isImageStream: false, // Video/iframe stream
      isYouTube: streamUrl?.includes('youtube.com') // Flag for iframe handling
    };
  }
  
  // Use backend proxy for image streams
  const timestamp = Date.now();
  const urlWithTimestamp = imageUrl.includes('?') 
    ? `${imageUrl}&t=${timestamp}` 
    : `${imageUrl}?t=${timestamp}`;
  const proxyUrl = `/api/camera-proxy?url=${encodeURIComponent(urlWithTimestamp)}`;
  
  return {
    cameraId,
    thumbnail: proxyUrl,
    liveUrl: proxyUrl,
    recordingUrl: streamUrl,
    isImageStream: true,
    isYouTube: false
  };
};
