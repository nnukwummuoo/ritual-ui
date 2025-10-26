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
  const [autoPlayBlocked, setAutoPlayBlocked] = useState(false);
  
  const {
    isGlobalMuted,
    hasUserInteracted: globalUserInteracted,
    firstVideoId,
    toggleGlobalMute,
    setUserInteracted,
    registerVideo,
    unregisterVideo,
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
    muted = true,
    loop = true,
    postId = 'default'
  } = options;

  // Check if this is the first video
  const isFirstVideo = firstVideoId === postId;

  // Initial setup effect - runs only once when video element is available
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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

    video.muted = isGlobalMuted;
    
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
          // But we don't want clicking one video to make ALL videos autoplay
          const shouldPlay = isIntersecting && 
                           intersectionRatio >= 0.8 && 
                           autoPlay && 
                           isTabActive && 
                           !manuallyPaused && 
                           globalUserInteracted; // Only use global state, not individual hasUserInteracted
          
          if (shouldPlay) {
            
            video.play().then(() => {
              setIsPlaying(true);
              setAutoPlayBlocked(false);
            }).catch((error) => {
              setAutoPlayBlocked(true);
              // Don't treat this as an error - it's expected behavior
              // The video will play when user clicks it
            });
          } else if (!isIntersecting || intersectionRatio < 0.8) {
            if (!video.paused) {
              video.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: [0.8] }
    );

    observer.observe(video);

    // Video event listeners
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
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
  }, [autoPlay, postId, globalUserInteracted, manuallyPaused]); // Removed hasUserInteracted since we only use globalUserInteracted

  // Manual play/pause controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      setManuallyPaused(false);
      setUserInteractedRef.current();
      
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setAutoPlayBlocked(false);
      }).catch((error) => {
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
    console.log('🔊 [MUTE TOGGLE] User clicked volume button:', { postId, currentMutedState: isGlobalMuted });
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
