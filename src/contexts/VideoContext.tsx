"use client";
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

interface VideoContextType {
  isGlobalMuted: boolean;
  hasUserInteracted: boolean;
  firstVideoId: string | null;
  setFirstVideoId: (id: string | null) => void;
  toggleGlobalMute: () => void;
  setUserInteracted: () => void;
  registerVideo: (postId: string, video: HTMLVideoElement) => void;
  unregisterVideo: (postId: string) => void;
  syncAllVideos: () => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const useVideoContext = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideoContext must be used within a VideoProvider');
  }
  return context;
};

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGlobalMuted, setIsGlobalMuted] = useState(true); // Start muted by default
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [firstVideoId, setFirstVideoId] = useState<string | null>(null);
  const videosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const isGlobalMutedRef = useRef(isGlobalMuted);
  const firstVideoIdRef = useRef(firstVideoId);

  // Load user interaction state from localStorage
  useEffect(() => {
    const globalInteraction = localStorage.getItem('videoUserInteraction') === 'true';
    setHasUserInteracted(globalInteraction);
  }, []);

  // Update refs when state changes
  useEffect(() => {
    isGlobalMutedRef.current = isGlobalMuted;
  }, [isGlobalMuted]);

  useEffect(() => {
    firstVideoIdRef.current = firstVideoId;
  }, [firstVideoId]);

  const setUserInteracted = useCallback(() => {
    setHasUserInteracted(true);
    localStorage.setItem('videoUserInteraction', 'true');
  }, []);

      const toggleGlobalMute = useCallback(() => {
        setIsGlobalMuted(prev => {
          const newMuted = !prev;
          
          // Sync all videos immediately
          videosRef.current.forEach((video) => {
            video.muted = newMuted;
          });
          
          return newMuted;
        });
      }, []);

  const registerVideo = useCallback((postId: string, video: HTMLVideoElement) => {
    // Check if this is the first video (only if no first video has been set yet)
    const isFirstVideo = firstVideoIdRef.current === null;
    
    if (isFirstVideo) {
      setFirstVideoId(postId);
      // First video starts unmuted
      video.muted = false;
      setIsGlobalMuted(false);
    } else {
      // Other videos follow global state
      video.muted = isGlobalMutedRef.current;
    }
    
    videosRef.current.set(postId, video);
  }, []); // No dependencies - uses refs instead

  const unregisterVideo = useCallback((postId: string) => {
    // Don't clear firstVideoId when unregistering - keep it persistent
    // This prevents re-registration from being treated as first video again
    
    videosRef.current.delete(postId);
  }, []);

  const syncAllVideos = useCallback(() => {
    videosRef.current.forEach((video) => {
      video.muted = isGlobalMutedRef.current;
    });
  }, []); // No dependencies - uses refs instead

  const value: VideoContextType = {
    isGlobalMuted,
    hasUserInteracted,
    firstVideoId,
    setFirstVideoId,
    toggleGlobalMute,
    setUserInteracted,
    registerVideo,
    unregisterVideo,
    syncAllVideos,
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};
