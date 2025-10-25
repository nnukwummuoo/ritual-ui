"use client";
import { useEffect, useRef, useState } from 'react';

interface UseVideoAutoPlayOptions {
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  postId?: string;
}

// Global video manager for volume synchronization
class VideoManager {
  private static instance: VideoManager;
  private videos: Map<string, HTMLVideoElement> = new Map();
  private isVolumeOn: boolean = false; // Simple boolean: has user ever unmuted?
  private readonly STORAGE_KEY = 'video_volume_on';

  static getInstance(): VideoManager {
    if (!VideoManager.instance) {
      VideoManager.instance = new VideoManager();
      VideoManager.instance.loadVolumePreference();
    }
    return VideoManager.instance;
  }

  // Load volume preference from localStorage
  private loadVolumePreference() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          this.isVolumeOn = JSON.parse(saved) === true;
        }
      } catch (error) {
        // Silent error handling
      }
    }
  }

  // Save volume preference to localStorage
  private saveVolumePreference() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.isVolumeOn));
      } catch (error) {
        // Silent error handling
      }
    }
  }

  registerVideo(postId: string, video: HTMLVideoElement) {
    this.videos.set(postId, video);
    
    // Apply saved volume settings
    if (this.isVolumeOn) {
      // User has previously unmuted, so unmute this video
      video.muted = false;
    } else {
      // First time user, start with muted (default behavior)
      video.muted = true;
    }
  }

  unregisterVideo(postId: string) {
    this.videos.delete(postId);
  }

  setGlobalVolumeOn(isVolumeOn: boolean) {
    this.isVolumeOn = isVolumeOn;
    
    // Save preference when user changes volume state
    this.saveVolumePreference();
    
    // Apply to all registered videos
    this.videos.forEach((video) => {
      try {
        video.muted = !isVolumeOn;
      } catch (error) {
        // Silent error handling
      }
    });
  }

  pauseAllVideos() {
    this.videos.forEach((video) => {
      if (!video.paused) {
        video.pause();
      }
    });
  }

  playVideo(postId: string) {
    // Pause all other videos first
    this.videos.forEach((video, id) => {
      if (id !== postId && !video.paused) {
        video.pause();
      }
    });
    
    // Play the requested video with error handling
    const video = this.videos.get(postId);
    if (video && video.paused) {
      video.play().catch((error) => {
        // Ignore AbortError - it's expected when play() is interrupted
        if (error.name !== 'AbortError') {
          console.log('Video play error:', error);
        }
      });
    }
  }

  // Get current volume state
  getVolumeState() {
    return {
      isVolumeOn: this.isVolumeOn
    };
  }

  // Reset volume preference (for testing or user reset)
  resetVolumePreference() {
    this.isVolumeOn = false;
    this.saveVolumePreference();
    
    // Apply to all registered videos
    this.videos.forEach((video) => {
      try {
        video.muted = true;
      } catch (error) {
        // Silent error handling
      }
    });
  }
}

export const useVideoAutoPlay = (options: UseVideoAutoPlayOptions = {}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const videoManager = VideoManager.getInstance();

  const {
    autoPlay = true,
    muted = true,
    loop = true,
    postId = 'default'
  } = options;


  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Register video with global manager
    videoManager.registerVideo(postId, video);

    // Facebook-style approach: Check if user has interacted before
    const hasUserInteracted = localStorage.getItem('user_has_interacted') === 'true';
    const isVolumeOn = videoManager.getVolumeState().isVolumeOn;

    // Set video attributes for auto-play
    video.muted = !(hasUserInteracted && isVolumeOn); // Only unmute if user has interacted AND prefers sound
    video.loop = loop;
    video.playsInline = true;

    // Enhanced Intersection Observer with better scroll detection
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting;
          const intersectionRatio = entry.intersectionRatio;
          setIsVisible(isIntersecting);

          if (isIntersecting && intersectionRatio >= 0.5 && autoPlay && !hasUserInteracted) {
            // Video is significantly in viewport and should auto-play
            videoManager.playVideo(postId);
            video.play().then(() => {
              setIsPlaying(true);
            }).catch((error) => {
              // Ignore AbortError - it's expected when play() is interrupted
              if (error.name !== 'AbortError') {
                // Silent error handling
              }
            });
          } else if (!isIntersecting || intersectionRatio < 0.3) {
            // Video is out of viewport or barely visible, pause it
            if (!video.paused) {
              video.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      {
        threshold: [0, 0.1, 0.3, 0.5, 0.7, 1.0], // Multiple thresholds for better detection
        rootMargin: '0px 0px -20% 0px' // Start playing when 20% from bottom
      }
    );

    observer.observe(video);

    // Handle user interaction with volume sync
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
      if (video.paused) {
        videoManager.playVideo(postId);
        video.play().catch((error) => {
          if (error.name !== 'AbortError') {
            // Silent error handling
          }
        }).then(() => setIsPlaying(true));
      } else {
        video.pause();
        setIsPlaying(false);
      }
    };

    // Handle volume changes and sync globally - Facebook style
    const handleVolumeChange = () => {
      // Mark that user has interacted (Facebook-style)
      localStorage.setItem('user_has_interacted', 'true');
      
      // Check if user has unmuted this video
      const newVolumeState = !video.muted;
      const currentGlobalState = videoManager.getVolumeState().isVolumeOn;
      
      // Only update global state if it's different
      if (newVolumeState !== currentGlobalState) {
        videoManager.setGlobalVolumeOn(newVolumeState);
      }
    };


    // Add event listeners with better volume control handling
    video.addEventListener('click', (e) => {
      // Mark user interaction (Facebook-style)
      localStorage.setItem('user_has_interacted', 'true');
      
      // Don't interfere with volume controls
      const target = e.target as HTMLElement;
      if (target.closest('input[type="range"]') || target.closest('button')) {
        return; // Let volume controls work normally
      }
      handleUserInteraction();
    });
    
    video.addEventListener('play', () => {
      setIsPlaying(true);
      
      // Apply volume state when video starts playing
      const volumeState = videoManager.getVolumeState();
      if (volumeState.isVolumeOn && video.muted) {
        console.log('🔊 [VIDEO PLAY] Fixing muted video on play:', {
          postId,
          shouldBeUnmuted: volumeState.isVolumeOn,
          currentlyMuted: video.muted
        });
        video.muted = false;
      }
    });
    
    video.addEventListener('pause', () => setIsPlaying(false));
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('loadedmetadata', () => {
      // Facebook-style: Check if user has interacted and prefers sound
      const hasUserInteracted = localStorage.getItem('user_has_interacted') === 'true';
      const volumeState = videoManager.getVolumeState();
      
      if (hasUserInteracted && volumeState.isVolumeOn) {
        // User has interacted before and prefers sound
        video.muted = false;
      } else {
        // First time user or no sound preference, start muted
        video.muted = true;
      }
    });

    // Also apply volume settings when video can play
    video.addEventListener('canplay', () => {
      const hasUserInteracted = localStorage.getItem('user_has_interacted') === 'true';
      const volumeState = videoManager.getVolumeState();
      
      if (hasUserInteracted && volumeState.isVolumeOn) {
        video.muted = false;
      }
    });

    // Prevent interference with video controls
    const controls = video.querySelector('.video-controls, input[type="range"], button');
    if (controls) {
      controls.addEventListener('click', (e) => e.stopPropagation());
    }

    // Periodic check to ensure volume state is correct
    const volumeCheckInterval = setInterval(() => {
      const volumeState = videoManager.getVolumeState();
      if (volumeState.isVolumeOn && video.muted) {
        video.muted = false;
      }
    }, 1000); // Check every second

    // Cleanup
    return () => {
      observer.disconnect();
      clearInterval(volumeCheckInterval);
      videoManager.unregisterVideo(postId);
      video.removeEventListener('click', handleUserInteraction);
      video.removeEventListener('play', () => setIsPlaying(true));
      video.removeEventListener('pause', () => setIsPlaying(false));
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [autoPlay, muted, loop, isPlaying, hasUserInteracted, postId, videoManager]);

  return {
    videoRef,
    isPlaying,
    isVisible,
    hasUserInteracted
  };
};
