/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { getImageSource } from "@/lib/imageUtils";

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
  onError?: (e: any) => void;
  fallbackUrls?: string[];
  priority?: boolean;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width = 800,
  height = 480,
  className = "",
  onClick,
  onError,
  fallbackUrls = [],
  priority = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [errorCount, setErrorCount] = useState(0);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        });
      },
      {
        rootMargin: '100px', // Start loading when image is 100px away from viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Handle image error with fallback URLs
  const handleError = (e: any) => {
    if (errorCount < fallbackUrls.length) {
      setCurrentSrc(fallbackUrls[errorCount]);
      setErrorCount(prev => prev + 1);
    } else {
      if (onError) {
        onError(e);
      }
    }
  };

  // Skeleton placeholder
  const SkeletonPlaceholder = () => (
    <div 
      className={`bg-gray-700 animate-pulse rounded ${className}`}
      style={{ width, height }}
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
      </div>
    </div>
  );

  return (
    <div ref={imgRef} className="relative">
      {!isInView ? (
        <SkeletonPlaceholder />
      ) : (
        <div className="relative">
          {!isLoaded && <SkeletonPlaceholder />}
          <Image
            src={currentSrc}
            alt={alt}
            width={width}
            height={height}
            className={`${className} ${!isLoaded ? 'opacity-0 absolute top-0 left-0' : 'opacity-100 transition-opacity duration-300'}`}
            onClick={onClick}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </div>
      )}
    </div>
  );
};

export default LazyImage;
