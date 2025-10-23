"use client";
import { useEffect, useRef, useState } from 'react';

interface UseVideoAutoPlayOptions {
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export const useVideoAutoPlay = (options: UseVideoAutoPlayOptions = {}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const {
    autoPlay = true,
    muted = true,
    loop = true
  } = options;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set video attributes for auto-play
    video.muted = muted;
    video.loop = loop;
    video.playsInline = true;

    // Intersection Observer to detect when video is in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting;
          setIsVisible(isIntersecting);

          if (isIntersecting && autoPlay && !hasUserInteracted) {
            // Video is in viewport and should auto-play
            video.play().then(() => {
              setIsPlaying(true);
            }).catch((error) => {
              console.log('Auto-play failed:', error);
              // Auto-play failed, user needs to interact
            });
          } else if (!isIntersecting && isPlaying) {
            // Video is out of viewport, pause it
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      {
        threshold: 0.5, // Video needs to be 50% visible
        rootMargin: '0px 0px -10% 0px' // Start playing when 10% from bottom
      }
    );

    observer.observe(video);

    // Handle user interaction
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
      if (video.paused) {
        video.play().then(() => setIsPlaying(true));
      } else {
        video.pause();
        setIsPlaying(false);
      }
    };

    // Add click event listener for user interaction
    video.addEventListener('click', handleUserInteraction);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));

    // Cleanup
    return () => {
      observer.disconnect();
      video.removeEventListener('click', handleUserInteraction);
      video.removeEventListener('play', () => setIsPlaying(true));
      video.removeEventListener('pause', () => setIsPlaying(false));
    };
  }, [autoPlay, muted, loop, isPlaying, hasUserInteracted]);

  return {
    videoRef,
    isPlaying,
    isVisible,
    hasUserInteracted
  };
};
