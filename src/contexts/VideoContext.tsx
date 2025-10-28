"use client";
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

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
  resetVideoState: () => void;
  pauseAllVideosExcept: (exceptPostId: string) => void;
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
  const pathname = usePathname();

  // Load user interaction state from localStorage
  useEffect(() => {
    const globalInteraction = localStorage.getItem('videoUserInteraction') === 'true';
    setHasUserInteracted(globalInteraction);
    
    // Reset user interaction state when user actually leaves the page
    const handlePageUnload = () => {
      setHasUserInteracted(false);
      localStorage.removeItem('videoUserInteraction');
    };

    // Listen for actual page navigation/unload
    window.addEventListener('beforeunload', handlePageUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handlePageUnload);
    };
  }, []);

  // Reset interaction state when pathname changes (user navigates to different page)
  useEffect(() => {
    setHasUserInteracted(false);
    localStorage.removeItem('videoUserInteraction');
  }, [pathname]);

  // Update refs when state changes
  useEffect(() => {
    isGlobalMutedRef.current = isGlobalMuted;
  }, [isGlobalMuted]);

  useEffect(() => {
    firstVideoIdRef.current = firstVideoId;
  }, [firstVideoId]);

  // Reset video state when component unmounts or page changes
  const resetVideoState = useCallback(() => {
    // Pause all videos
    videosRef.current.forEach((video) => {
      if (!video.paused) {
        video.pause();
      }
    });
    
    // Clear all video references
    videosRef.current.clear();
    
    // Reset first video ID to allow proper re-initialization
    setFirstVideoId(null);
    
    // Reset to muted state for safety
    setIsGlobalMuted(true);
  }, []);

  // Listen for page visibility changes and custom events
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      
      if (!isVisible) {
        // Pause all videos when page becomes hidden
        videosRef.current.forEach((video) => {
          if (!video.paused) {
            video.pause();
          }
        });
      }
    };

    const handleResetVideoState = () => {
      resetVideoState();
    };

    const handlePauseAllVideos = () => {
      videosRef.current.forEach((video) => {
        if (!video.paused) {
          video.pause();
        }
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resetVideoState', handleResetVideoState);
    window.addEventListener('pauseAllVideos', handlePauseAllVideos);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resetVideoState', handleResetVideoState);
      window.removeEventListener('pauseAllVideos', handlePauseAllVideos);
    };
  }, [resetVideoState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetVideoState();
    };
  }, [resetVideoState]);

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
    // Check if video is already registered to prevent duplicate registrations
    if (videosRef.current.has(postId)) {
      return;
    }
    
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
    
    // Add video event listeners to manage single video playback
    const handlePlay = () => {
      // Pause all other videos when this one starts playing
      videosRef.current.forEach((otherVideo, otherPostId) => {
        if (otherPostId !== postId && !otherVideo.paused) {
          otherVideo.pause();
        }
      });
    };

    video.addEventListener('play', handlePlay);
    
    // Store the cleanup function
    (video as HTMLVideoElement & { _playHandler?: () => void })._playHandler = handlePlay;
    
    videosRef.current.set(postId, video);
  }, []); // No dependencies - uses refs instead

  const unregisterVideo = useCallback((postId: string) => {
    // Pause the video before unregistering
    const video = videosRef.current.get(postId);
    if (video && !video.paused) {
      video.pause();
    }
    
    // Clean up event listeners
    if (video && (video as HTMLVideoElement & { _playHandler?: () => void })._playHandler) {
      video.removeEventListener('play', (video as HTMLVideoElement & { _playHandler?: () => void })._playHandler!);
      delete (video as HTMLVideoElement & { _playHandler?: () => void })._playHandler;
    }
    
    videosRef.current.delete(postId);
  }, []);

  const syncAllVideos = useCallback(() => {
    videosRef.current.forEach((video) => {
      video.muted = isGlobalMutedRef.current;
    });
  }, []); // No dependencies - uses refs instead

  const pauseAllVideosExcept = useCallback((exceptPostId: string) => {
    videosRef.current.forEach((video, postId) => {
      if (postId !== exceptPostId && !video.paused) {
        video.pause();
      }
    });
  }, []);

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
    resetVideoState,
    pauseAllVideosExcept,
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};
