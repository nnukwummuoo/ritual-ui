"use client";
import { useEffect, useRef, useState } from 'react';
import { useVideoContext } from '@/contexts/VideoContext';

interface UseVideoAutoPlayOptions {
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  postId?: string;
}

export const useVideoAutoPlay = (options: UseVideoAutoPlayOptions = {}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [autoPlayBlocked, setAutoPlayBlocked] = useState(true); // Start as blocked until user interacts
  const initializedRef = useRef(false);
  
  
  const {
    isGlobalMuted,
    hasUserInteracted: globalUserInteracted,
    firstVideoId,
    toggleGlobalMute,
    setUserInteracted,
    registerVideo,
    unregisterVideo,
    pauseAllVideosExcept,
  } = useVideoContext();

  // Use refs to avoid dependency issues
  const registerVideoRef = useRef(registerVideo);
  const unregisterVideoRef = useRef(unregisterVideo);
  const setUserInteractedRef = useRef(setUserInteracted);

  // Update refs when functions change
  useEffect(() => {
    registerVideoRef.current = registerVideo;
    unregisterVideoRef.current = unregisterVideo;
    setUserInteractedRef.current = setUserInteracted;
  }, [registerVideo, unregisterVideo, setUserInteracted]);

  const {
    autoPlay = true,
    loop = true,
    postId = 'default'
  } = options;

  // Check if this is the first video
  const isFirstVideo = firstVideoId === postId;

  // Mark as initialized
  if (!initializedRef.current) {
    initializedRef.current = true;
  }

  // Initial setup effect - runs only once when video element is available
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    // Register video with context
    registerVideoRef.current(postId, video);

    // Set video attributes
    video.loop = loop;
    video.playsInline = true;
    video.preload = 'metadata';

    // Cleanup
    return () => {
      unregisterVideoRef.current(postId);
    };
  }, [postId, loop]); // Stable dependencies only

  // Volume sync effect - runs when global mute state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Only sync if the video's current muted state differs from global state
    if (video.muted !== isGlobalMuted) {
      video.muted = isGlobalMuted;
    }
    
  }, [isGlobalMuted, postId, isFirstVideo]);

  // Intersection observer and auto-play effect
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Track if tab/window is active
    let isTabActive = document.visibilityState === 'visible';

    // Handle visibility change
    const handleVisibilityChange = () => {
      isTabActive = document.visibilityState === 'visible';
      
      if (!isTabActive && !video.paused) {
        video.pause();
        setIsPlaying(false);
      }
    };

    // User interaction handler
    const handleUserActivity = () => {
      if (!hasUserInteracted) {
        setHasUserInteracted(true);
        setUserInteractedRef.current();
        // Don't set autoPlayBlocked to false here - let autoplay attempt decide
      }
    };

    // Monitor user activity
    document.addEventListener('mousemove', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('scroll', handleUserActivity);
    document.addEventListener('click', handleUserActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Intersection Observer for auto-play
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting;
          const intersectionRatio = entry.intersectionRatio;
          
          setIsVisible(isIntersecting);
          
          // Auto-play logic - only use global interaction to enable autoplay capability
          // Each video should only autoplay when it's in viewport AND user has interacted globally
          const shouldPlay = isIntersecting && 
                           intersectionRatio >= 0.8 && 
                           autoPlay && 
                           isTabActive && 
                           !manuallyPaused && 
                           globalUserInteracted; // Only use global state, not individual hasUserInteracted
          
          if (shouldPlay) {
            // Pause all other videos before autoplaying this one
            pauseAllVideosExcept(postId);
            
            video.play().then(() => {
              setIsPlaying(true);
              setAutoPlayBlocked(false);
            }).catch(() => {
              console.log('Autoplay blocked for video:', postId);
              setAutoPlayBlocked(true);
            });
          } else if (!isIntersecting || intersectionRatio < 0.8) {
            if (!video.paused) {
              video.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { 
        threshold: [0.8],
        rootMargin: '0px' // Don't trigger outside viewport
      }
    );

    observer.observe(video);

    // Video event listeners
    const handlePlay = () => {
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Cleanup
    return () => {
      observer.disconnect();
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      document.removeEventListener('mousemove', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
      document.removeEventListener('click', handleUserActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoPlay, postId, globalUserInteracted, manuallyPaused, hasUserInteracted, pauseAllVideosExcept]);

  // Manual play/pause controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      setManuallyPaused(false);
      setUserInteractedRef.current();
      
      // Pause all other videos before playing this one
      pauseAllVideosExcept(postId);
      
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setAutoPlayBlocked(false);
      }).catch(() => {
        setIsPlaying(false);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setManuallyPaused(true);
    }
  };

  // Mute toggle
  const toggleMute = () => {
    toggleGlobalMute();
  };

  return {
    videoRef,
    isPlaying,
    isVisible,
    autoPlayBlocked,
    hasUserInteracted: globalUserInteracted, // Only use global state
    togglePlay,
    toggleMute,
    isMuted: isGlobalMuted,
    manuallyPaused
  };
};
