"use client";

import React, { useState } from 'react';
import { CameraData } from '@/types/camera';
import { Button } from '@/components/ui/button';
import { Play, Download, Settings } from 'lucide-react';

interface ComputationsTabProps {
  camera: CameraData;
}

interface ComputationResult {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  result?: string;
  timestamp: string;
}

export const ComputationsTab: React.FC<ComputationsTabProps> = ({ camera }) => {
  const [computations, setComputations] = useState<ComputationResult[]>([
    {
      id: '1',
      name: 'Object Detection',
      status: 'completed',
      progress: 100,
      result: '12 objects detected',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: '2',
      name: 'Motion Analysis',
      status: 'running',
      progress: 67,
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: '3',
      name: 'Face Recognition',
      status: 'completed',
      progress: 100,
      result: '3 faces identified',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [selectedComputation, setSelectedComputation] = useState<string | null>('1');

  const runComputation = (type: string) => {
    const newComputation: ComputationResult = {
      id: Date.now().toString(),
      name: type,
      status: 'running',
      progress: 0,
      timestamp: new Date().toLocaleTimeString(),
    };
    setComputations([newComputation, ...computations]);
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        setComputations(prev => 
          prev.map(c => 
            c.id === newComputation.id 
              ? { ...c, status: 'completed', progress: 100, result: 'Analysis complete' }
              : c
          )
        );
      } else {
        setComputations(prev => 
          prev.map(c => c.id === newComputation.id ? { ...c, progress } : c)
        );
      }
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="w-full h-full flex bg-background">
      {/* Computations List */}
      <div className="w-64 border-r flex flex-col">
        <div className="p-3 border-b bg-muted/30">
          <h4 className="text-sm font-semibold">Computations</h4>
          <p className="text-xs text-muted-foreground">Camera: {camera.name}</p>
        </div>
        
        <div className="flex-1 overflow-auto">
          {computations.map((comp) => (
            <button
              key={comp.id}
              onClick={() => setSelectedComputation(comp.id)}
              className={`w-full p-3 border-b text-left hover:bg-accent/50 transition-colors ${
                selectedComputation === comp.id ? 'bg-accent' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{comp.name}</span>
                <span className={`text-[10px] ${getStatusColor(comp.status)}`}>
                  {comp.status}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground">{comp.timestamp}</div>
              {comp.status === 'running' && (
                <div className="mt-2 w-full bg-muted rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all"
                    style={{ width: `${comp.progress}%` }}
                  />
                </div>
              )}
            </button>
          ))}
        </div>
        
        <div className="p-2 border-t bg-muted/30 space-y-1">
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full h-8"
            onClick={() => runComputation('Object Detection')}
          >
            <Play className="h-3 w-3 mr-1" />
            Object Detection
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full h-8"
            onClick={() => runComputation('Motion Analysis')}
          >
            <Play className="h-3 w-3 mr-1" />
            Motion Analysis
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full h-8"
            onClick={() => runComputation('Face Recognition')}
          >
            <Play className="h-3 w-3 mr-1" />
            Face Recognition
          </Button>
        </div>
      </div>

      {/* Computation Details */}
      <div className="flex-1 flex flex-col">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h4 className="text-sm font-semibold">Computation Details</h4>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-7">
              <Settings className="h-3 w-3 mr-1" />
              Config
            </Button>
            <Button size="sm" variant="outline" className="h-7">
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {selectedComputation ? (
            <>
              {computations.find(c => c.id === selectedComputation) && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h5 className="text-sm font-semibold">
                      {computations.find(c => c.id === selectedComputation)?.name}
                    </h5>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Status:</span>
                      <span className={`text-xs font-medium ${getStatusColor(
                        computations.find(c => c.id === selectedComputation)?.status || ''
                      )}`}>
                        {computations.find(c => c.id === selectedComputation)?.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  {computations.find(c => c.id === selectedComputation)?.status === 'running' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span>{computations.find(c => c.id === selectedComputation)?.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${computations.find(c => c.id === selectedComputation)?.progress}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Results */}
                  {computations.find(c => c.id === selectedComputation)?.result && (
                    <div className="space-y-2">
                      <h6 className="text-xs font-semibold">Results</h6>
                      <div className="p-3 bg-muted rounded text-xs">
                        {computations.find(c => c.id === selectedComputation)?.result}
                      </div>
                    </div>
                  )}

                  {/* Logs */}
                  <div className="space-y-2">
                    <h6 className="text-xs font-semibold">Logs</h6>
                    <div className="p-3 bg-muted rounded font-mono text-[10px] space-y-1 max-h-48 overflow-auto">
                      <div className="text-green-500">[{new Date().toLocaleTimeString()}] Computation started</div>
                      <div className="text-blue-500">[{new Date().toLocaleTimeString()}] Loading model...</div>
                      <div className="text-blue-500">[{new Date().toLocaleTimeString()}] Processing frame...</div>
                      {computations.find(c => c.id === selectedComputation)?.status === 'completed' && (
                        <div className="text-green-500">[{new Date().toLocaleTimeString()}] Computation completed successfully</div>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2">
                    <h6 className="text-xs font-semibold">Metadata</h6>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-muted rounded">
                        <div className="text-muted-foreground">Camera</div>
                        <div className="font-medium">{camera.name}</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="text-muted-foreground">Timestamp</div>
                        <div className="font-medium">
                          {computations.find(c => c.id === selectedComputation)?.timestamp}
                        </div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="text-muted-foreground">Duration</div>
                        <div className="font-medium">2.3s</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="text-muted-foreground">Frames</div>
                        <div className="font-medium">45</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Select a computation to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
