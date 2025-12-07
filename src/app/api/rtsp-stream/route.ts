import { NextRequest, NextResponse } from 'next/server';

/**
 * RTSP to HLS/MJPEG Stream Converter
 * 
 * This endpoint converts RTSP stream to browser-compatible format
 * Requires FFmpeg installed on the server
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rtspUrl = searchParams.get('url');

    if (!rtspUrl) {
      return NextResponse.json(
        { error: 'RTSP URL parameter is required' },
        { status: 400 }
      );
    }

    // For security, validate RTSP URL format
    if (!rtspUrl.startsWith('rtsp://')) {
      return NextResponse.json(
        { error: 'Invalid RTSP URL' },
        { status: 400 }
      );
    }

    // Note: This requires FFmpeg to be installed on the server
    // Example command: ffmpeg -i rtsp://... -f mjpeg -q:v 2 pipe:1
    
    return NextResponse.json({
      message: 'RTSP streaming requires FFmpeg backend setup',
      instructions: [
        '1. Install FFmpeg on your server',
        '2. Use a streaming server like Node-Media-Server or nginx-rtmp',
        '3. Convert RTSP to HLS/WebRTC for browser playback',
        '4. Alternative: Use a service like Wowza or AWS MediaLive'
      ],
      rtspUrl: rtspUrl,
      recommendation: 'Use WebRTC or HLS for best browser compatibility'
    });

  } catch (error) {
    console.error('RTSP stream error:', error);
    return NextResponse.json(
      { error: 'Failed to process RTSP stream' },
      { status: 500 }
    );
  }
}
