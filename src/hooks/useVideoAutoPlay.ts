"use client";
import { useEffect, useRef, useState } from 'react';

interface UseVideoAutoPlayOptions {
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  postId?: string;
}

// Global video manager for volume synchronization and coordination across components
class VideoManager {
  private static instance: VideoManager;
  private videos: Map<string, HTMLVideoElement> = new Map();
  private isVolumeOn: boolean = false; // Simple boolean: has user ever unmuted?
  private readonly STORAGE_KEY = 'video_volume_on';
  activeVideoId: string | null = null; // Track currently active video - public for coordination

  static getInstance(): VideoManager {
    if (!VideoManager.instance) {
      VideoManager.instance = new VideoManager();
      VideoManager.instance.loadVolumePreference();
      VideoManager.instance.setupGlobalEvents();
    }
    return VideoManager.instance;
  }
  
  // Setup global events to coordinate videos across components
  private setupGlobalEvents() {
    // Listen for visibility change at document level
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        const isTabActive = document.visibilityState === 'visible';
        console.log('🌍 [GLOBAL VISIBILITY] Document visibility changed:', { 
          isTabActive, 
          activeVideoCount: this.videos.size 
        });
        
        // Pause all videos when tab becomes inactive
        if (!isTabActive) {
          this.pauseAllVideos();
        }
      });
    }
  }

  // Load volume preference from localStorage
  private loadVolumePreference() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          this.isVolumeOn = JSON.parse(saved) === true;
        }
      } catch {
        // Silent error handling - no error variable needed
      }
    }
  }

  // Save volume preference to localStorage
  private saveVolumePreference() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.isVolumeOn));
      } catch {
        // Silent error handling - no error variable needed
      }
    }
  }

  registerVideo(postId: string, video: HTMLVideoElement) {
    console.log('📝 [VIDEO MANAGER] Registering video:', { postId, totalVideos: this.videos.size + 1 });
    this.videos.set(postId, video);
    
    // Apply saved volume settings
    if (this.isVolumeOn) {
      // User has previously unmuted, so unmute this video
      video.muted = false;
    } else {
      // First time user, start with muted (default behavior)
      video.muted = true;
    }
    
    // Add video-specific event listeners for better coordination
    video.addEventListener('play', () => {
      if (this.activeVideoId !== postId) {
        console.log('🎬 [VIDEO MANAGER] Video started playing, updating active video:', postId);
        this.activeVideoId = postId;
        
        // Ensure all other videos are paused
        this.pauseAllExcept(postId);
      }
    });
    
    video.addEventListener('pause', () => {
      if (this.activeVideoId === postId) {
        console.log('⏸️ [VIDEO MANAGER] Active video paused:', postId);
        this.activeVideoId = null;
      }
    });
  }

  unregisterVideo(postId: string) {
    console.log('🗑️ [VIDEO MANAGER] Unregistering video:', { postId, remainingVideos: this.videos.size - 1 });
    
    // Clear active video reference if needed
    if (this.activeVideoId === postId) {
      this.activeVideoId = null;
    }
    
    // Remove video from Map
    this.videos.delete(postId);
  }

  setGlobalVolumeOn(isVolumeOn: boolean) {
    this.isVolumeOn = isVolumeOn;
    console.log('🔊 [VIDEO MANAGER] Setting global volume:', { isVolumeOn, videoCount: this.videos.size });
    
    // Save preference when user changes volume state
    this.saveVolumePreference();
    
    // Apply to all registered videos
    this.videos.forEach((video, videoId) => {
      try {
        const oldMutedState = video.muted;
        const newMutedState = !isVolumeOn;
        
        // Only change if needed
        if (oldMutedState !== newMutedState) {
          console.log(`🔊 [VIDEO MANAGER] ${newMutedState ? 'Muting' : 'Unmuting'} video:`, videoId);
          video.muted = newMutedState;
        }
      } catch (error) {
        console.error('❌ [VIDEO MANAGER] Error setting muted state:', error);
      }
    });
  }

  pauseAllVideos() {
    console.log('⏹️ [VIDEO MANAGER] Pausing ALL videos:', { count: this.videos.size });
    this.videos.forEach((video, id) => {
      if (!video.paused) {
        console.log('⏸️ [VIDEO MANAGER] Pausing video:', id);
        try {
          video.pause();
        } catch (error) {
          console.error('❌ [VIDEO MANAGER] Error pausing video:', error);
        }
      }
    });
    
    // Clear active video
    this.activeVideoId = null;
  }
  
  pauseAllExcept(excludeId: string) {
    console.log('⏯️ [VIDEO MANAGER] Pausing all videos except:', excludeId);
    this.videos.forEach((video, id) => {
      if (id !== excludeId && !video.paused) {
        console.log('⏸️ [VIDEO MANAGER] Pausing video:', id);
        try {
          video.pause();
        } catch (error) {
          console.error('❌ [VIDEO MANAGER] Error pausing video:', error);
        }
      }
    });
  }

  playVideo(postId: string) {
    console.log('▶️ [VIDEO MANAGER] Request to play video:', postId);
    
    // Update active video ID
    if (this.activeVideoId !== postId) {
      this.activeVideoId = postId;
      
      // Pause all other videos first
      this.pauseAllExcept(postId);
    }
    
    // Play the requested video with error handling
    const video = this.videos.get(postId);
    if (video && video.paused) {
      console.log('▶️ [VIDEO MANAGER] Playing video:', postId);
      video.play().catch((error) => {
        // Ignore AbortError - it's expected when play() is interrupted
        if (error.name !== 'AbortError') {
          console.error('❌ [VIDEO MANAGER] Error playing video:', error);
        }
      });
    } else if (!video) {
      console.warn('⚠️ [VIDEO MANAGER] Attempted to play non-registered video:', postId);
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
      } catch {
        // Silent error handling - no error variable needed
      }
    });
  }
}

export const useVideoAutoPlay = (options: UseVideoAutoPlayOptions = {}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  // Track if user manually paused to prevent autoplay override
  const [manuallyPaused, setManuallyPaused] = useState(false);
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
    const shouldBeMuted = !(hasUserInteracted && isVolumeOn); // Only unmute if user has interacted AND prefers sound
    video.muted = shouldBeMuted;
    video.loop = loop;
    video.playsInline = true;
    video.preload = 'metadata'; // Preload metadata for faster autoplay
    
    // Log initial volume state
    console.log('🎬 [VIDEO INIT] Setting initial volume state:', { 
      postId,
      hasUserInteracted,
      isVolumeOn,
      shouldBeMuted, 
      actuallyMuted: video.muted 
    });

    // Track if tab/window is active
    let isTabActive = document.visibilityState === 'visible';
    
    // These variables are no longer needed since we immediately stop background playback
    // but we're keeping them as placeholders in case we need to implement more sophisticated logic later
    
    // Page visibility change detection - this catches tab changes and minimizing the browser
    const handleVisibilityChange = () => {
      const wasActive = isTabActive;
      isTabActive = document.visibilityState === 'visible';
      
      console.log('👁️ [VISIBILITY] Tab visibility changed:', { 
        postId, 
        wasActive, 
        isNowActive: isTabActive, 
        videoPaused: video.paused 
      });
      
      // If tab becomes inactive, immediately pause all videos
      if (!isTabActive && !video.paused) {
        console.log('⏸️ [VISIBILITY] Pausing video because tab inactive:', postId);
        video.pause();
        setIsPlaying(false);
      }
    };
    
    // Check if user is truly interacting with the page
    let userIdleTimeout: ReturnType<typeof setTimeout> | null = null;
    let lastUserActivity = Date.now();
    const USER_IDLE_TIMEOUT = 30000; // 30 seconds without interaction = idle
    
    const resetIdleTimer = () => {
      lastUserActivity = Date.now();
      if (userIdleTimeout) clearTimeout(userIdleTimeout);
      
      userIdleTimeout = setTimeout(() => {
        // If user hasn't interacted for a while and video is still playing, pause it
        if (!video.paused && Date.now() - lastUserActivity > USER_IDLE_TIMEOUT) {
          console.log('⏸️ [IDLE] Pausing video due to user inactivity:', postId);
          video.pause();
          setIsPlaying(false);
        }
      }, USER_IDLE_TIMEOUT);
    };
    
    // Monitor user activity
    const handleUserActivity = () => resetIdleTimer();
    document.addEventListener('mousemove', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('scroll', handleUserActivity);
    document.addEventListener('click', handleUserActivity);
    
    // Initial setup
    resetIdleTimer();
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Enhanced Intersection Observer with better scroll detection
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting;
          const intersectionRatio = entry.intersectionRatio;
          
          // Update visibility state
          setIsVisible(isIntersecting);
          
          // No need to track visible time anymore

          // ONLY allow videos to play if they are FULLY visible (100%) and other conditions are met
          if (isIntersecting && intersectionRatio >= 0.95 && autoPlay && isTabActive && !manuallyPaused) {
            // Video is FULLY in viewport and should auto-play
            console.log('🎥 [AUTOPLAY] Video fully in viewport, attempting to play:', {
              postId,
              component: postId.includes('first') ? 'FirstPost' : 'RemainingPosts',
              intersectionRatio,
              isIntersecting,
              videoPaused: video.paused,
              manuallyPaused
            });
            
            // Only play if user hasn't manually paused
            if (!manuallyPaused) {
              // Use VideoManager to coordinate video playback globally
              videoManager.playVideo(postId);
              setIsPlaying(true);
            } else {
              console.log('⏸️ [AUTOPLAY] Skipping autoplay because video was manually paused:', postId);
            }
          } else {
            // Video is not FULLY in viewport - ALWAYS pause it immediately
            if (!video.paused) {
              console.log('⏸️ [AUTOPLAY] Pausing video not fully in viewport:', {
                postId,
                component: postId.includes('first') ? 'FirstPost' : 'RemainingPosts',
                intersectionRatio, 
                isIntersecting,
                isTabActive
              });
              video.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      {
        threshold: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 0.95, 0.99, 1.0], // More precise thresholds at high visibility
        rootMargin: '0px' // No margin - video must be fully in viewport
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

    // Aggressive periodic check to ENSURE videos NEVER play in background
    const volumeCheckInterval = setInterval(() => {
      // Apply volume state if needed
      const volumeState = videoManager.getVolumeState();
      if (volumeState.isVolumeOn && video.muted) {
        video.muted = false;
      }
      
      // ALWAYS check if video is playing when it shouldn't be
      if (!video.paused) {
        // A video should ONLY play if ALL these conditions are met:
        // 1. It's 95%+ visible in viewport
        // 2. The tab/browser is active
        // 3. User hasn't manually paused it
        // 4. It's the actively selected video in the VideoManager
        const isActiveVideo = videoManager.activeVideoId === postId;
        const shouldBePlaying = isVisible && isTabActive && !manuallyPaused && isActiveVideo;
        
        if (!shouldBePlaying) {
          console.log('🛑 [AGGRESSIVE PREVENTION] Force stopping video:', {
            postId,
            component: postId.includes('first') ? 'FirstPost' : 'RemainingPosts',
            isVisible,
            isTabActive,
            manuallyPaused,
            isActiveVideo
          });
          
          // Immediately pause the video
          try {
            video.pause();
            setIsPlaying(false);
          } catch (error) {
            console.error('❌ Error pausing video in background:', error);
          }
        }
      }
    }, 100); // Check VERY aggressively (every 100ms)

    // Cleanup
    return () => {
      observer.disconnect();
      clearInterval(volumeCheckInterval);
      videoManager.unregisterVideo(postId);
      video.removeEventListener('click', handleUserInteraction);
      video.removeEventListener('play', () => setIsPlaying(true));
      video.removeEventListener('pause', () => setIsPlaying(false));
      video.removeEventListener('volumechange', handleVolumeChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Clean up user activity listeners
      if (userIdleTimeout) clearTimeout(userIdleTimeout);
      document.removeEventListener('mousemove', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
      document.removeEventListener('click', handleUserActivity);
    };
  }, [autoPlay, muted, loop, isPlaying, hasUserInteracted, postId, videoManager, isVisible, manuallyPaused]);

  // Custom video controls handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      // When user manually plays, ALWAYS reset the manually paused flag
      setManuallyPaused(false);
      
      // Force pause all other videos first
      videoManager.pauseAllVideos();
      
      // Try to play this video
      try {
        console.log('🎮 [MANUAL PLAY] User clicked play button:', postId);
        
        // Set playing state immediately for UI responsiveness
        setIsPlaying(true);
        
        // Mark that user has interacted
        localStorage.setItem('user_has_interacted', 'true');
        setHasUserInteracted(true);
        
        // Tell the video manager which video should be playing
        videoManager.playVideo(postId);
        
        // Actually play the video
        videoRef.current.play()
          .then(() => {
            console.log('✅ [MANUAL PLAY] Video started playing successfully:', postId);
          })
          .catch((error) => {
            if (error.name !== 'AbortError') {
              console.error('❌ [MANUAL PLAY] Error playing video:', error);
              // Revert to paused state on error
              setIsPlaying(false);
            }
          });
      } catch (err) {
        console.error('❌ [MANUAL PLAY] Caught error playing video:', err);
        setIsPlaying(false);
      }
    } else {
      // If it's playing, pause it and mark as manually paused
      try {
        console.log('⏸️ [MANUAL PAUSE] User clicked pause button:', postId);
        videoRef.current.pause();
        setIsPlaying(false);
        
        // IMPORTANT: Set flag that user manually paused
        setManuallyPaused(true);
      } catch (err) {
        console.error('❌ [MANUAL PAUSE] Error pausing video:', err);
      }
    }
  };
  
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    // First, mark user interaction
    localStorage.setItem('user_has_interacted', 'true');
    setHasUserInteracted(true);
    
    try {
      // Get current muted state
      const currentMutedState = videoRef.current.muted;
      const newMutedState = !currentMutedState;
      
      console.log('🔊 [MUTE TOGGLE] User clicked volume button:', {
        postId,
        currentMutedState,
        newMutedState,
      });
      
      // Apply new state directly to this video
      videoRef.current.muted = newMutedState;
      
      // Force state update for React
      setLocalIsMuted(newMutedState);
      
      // Update global volume state - this will apply to all other videos
      videoManager.setGlobalVolumeOn(!newMutedState);
      
      // Additional debug to make sure the video is actually muted/unmuted
      setTimeout(() => {
        if (videoRef.current) {
          console.log('🔍 [MUTE CHECK] After toggle, video.muted =', videoRef.current.muted);
        }
      }, 100);
    } catch (error) {
      console.error('❌ [MUTE TOGGLE] Error toggling mute state:', error);
    }
  };
  
  // Use state for mute tracking to ensure component updates
  const [localIsMuted, setLocalIsMuted] = useState(true);
  
  // We no longer need this ref

  // Update local muted state whenever the video's muted property changes
  useEffect(() => {
    // Function to update the muted state from the video element
    const updateMutedState = () => {
      if (videoRef.current) {
        const videoMutedState = videoRef.current.muted;
        console.log('🔄 [MUTE SYNC] Updating muted state from video element:', {
          postId,
          videoMutedState
        });
        setLocalIsMuted(videoMutedState);
      }
    };
    
    // Set initial state when the ref is available
    updateMutedState();
    
    // Add listener for volume changes
    const video = videoRef.current;
    if (video) {
      video.addEventListener('volumechange', updateMutedState);
      
      // Check muted state directly after a short delay
      setTimeout(updateMutedState, 100);
      
      // Clean up the listener
      return () => {
        video.removeEventListener('volumechange', updateMutedState);
      };
    }
  }, [postId]); // Include postId to fix React warning and ensure proper cleanup
  
  // We don't need this effect anymore since we included postId in the first useEffect
  
  const isMuted = localIsMuted;

  return {
    videoRef,
    isPlaying,
    isVisible,
    hasUserInteracted,
    togglePlay,
    toggleMute,
    isMuted,
    manuallyPaused
  };
};
