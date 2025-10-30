/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import LazyPost from "./LazyPost";

interface VirtualizedPostListProps {
  posts: any[];
  ui: any;
  setUi: any;
  dispatch: any;
  loggedInUserId: string;
  selfId: string;
  token: string;
  followingList: string[];
  vipStatus: any;
  firstname: string;
  lastname: string;
  username: string;
  photolink: string;
  itemHeight?: number;
  overscan?: number;
}

const VirtualizedPostList: React.FC<VirtualizedPostListProps> = ({
  posts,
  ui,
  setUi,
  dispatch,
  loggedInUserId,
  selfId,
  token,
  followingList,
  vipStatus,
  firstname,
  lastname,
  username,
  photolink,
  itemHeight = 600, // Estimated height per post
  overscan = 3 // Number of items to render outside viewport
}) => {
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (containerHeight === 0) return { start: 0, end: Math.min(overscan, posts.length) };
    
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      posts.length
    );
    
    return {
      start: Math.max(0, start - overscan),
      end
    };
  }, [scrollTop, containerHeight, itemHeight, overscan, posts.length]);

  // Get visible posts
  const visiblePosts = useMemo(() => {
    return posts.slice(visibleRange.start, visibleRange.end).map((post, index) => ({
      ...post,
      virtualIndex: visibleRange.start + index
    }));
  }, [posts, visibleRange]);

  // Handle scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Calculate total height
  const totalHeight = posts.length * itemHeight;

  // Calculate offset for visible items
  const offsetY = visibleRange.start * itemHeight;

  if (posts.length === 0) {
    return <div className="text-center text-gray-400 py-8">No posts available</div>;
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-auto"
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visiblePosts.map((post, index) => (
            <div
              key={post?.postid || post?.id || post?._id || post.virtualIndex}
              style={{ height: itemHeight }}
              className="flex items-center justify-center"
            >
              <LazyPost
                post={post}
                ui={ui}
                setUi={setUi}
                dispatch={dispatch}
                loggedInUserId={loggedInUserId}
                selfId={selfId}
                token={token}
                followingList={followingList}
                vipStatus={vipStatus}
                firstname={firstname}
                lastname={lastname}
                username={username}
                photolink={photolink}
                isFirstPost={post.virtualIndex === 0}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualizedPostList;
