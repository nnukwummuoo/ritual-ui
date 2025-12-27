'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface StoryContextType {
    likedStories: Set<string>;
    commentCounts: Map<string, number>;
    likeCounts: Map<string, number>;
    toggleLike: (storyId: string, userId: string) => Promise<void>;
    addComment: (storyId: string, userId: string, username: string, text: string) => Promise<void>;
    refreshStoryData: (storyId: string) => Promise<void>;
    getStoryComments: (storyId: string) => Promise<any[]>;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export function StoryProvider({ children }: { children: React.ReactNode }) {
    const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
    const [commentCounts, setCommentCounts] = useState<Map<string, number>>(new Map());
    const [likeCounts, setLikeCounts] = useState<Map<string, number>>(new Map());

    // Load liked stories and comment counts from localStorage on mount
    useEffect(() => {
        const savedLikes = localStorage.getItem('anya_liked_stories');
        if (savedLikes) {
            try {
                const likesArray = JSON.parse(savedLikes);
                setLikedStories(new Set(likesArray));
            } catch (error) {
                console.error('Error loading liked stories:', error);
            }
        }
    }, []);

    // Save liked stories to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('anya_liked_stories', JSON.stringify(Array.from(likedStories)));
    }, [likedStories]);

    const toggleLike = async (storyId: string, userId: string) => {
        try {
            const response = await axios.post(`/api/proxy/api/ai-story/stories/${storyId}/like`, {
                userId
            });

            if (response.data.success) {
                setLikedStories(prev => {
                    const newSet = new Set(prev);
                    if (response.data.liked) {
                        newSet.add(storyId);
                    } else {
                        newSet.delete(storyId);
                    }
                    return newSet;
                });

                // Update like count
                setLikeCounts(prev => {
                    const newMap = new Map(prev);
                    newMap.set(storyId, response.data.likes);
                    return newMap;
                });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const addComment = async (storyId: string, userId: string, username: string, text: string) => {
        try {
            const response = await axios.post(`/api/proxy/api/ai-story/stories/${storyId}/comment`, {
                userId,
                username,
                text
            });

            if (response.data.success) {
                setCommentCounts(prev => {
                    const newMap = new Map(prev);
                    newMap.set(storyId, response.data.totalComments);
                    return newMap;
                });
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const refreshStoryData = async (storyId: string) => {
        try {
            const response = await axios.get(`/api/proxy/api/ai-story/stories/${storyId}`);
            const story = response.data.story;

            // Update comment count
            if (story.comments) {
                setCommentCounts(prev => {
                    const newMap = new Map(prev);
                    newMap.set(storyId, story.comments.length);
                    return newMap;
                });
            }

            // Update liked status - try to get userId from localStorage
            let userId = '';
            if (typeof window !== 'undefined') {
                try {
                    const loginData = localStorage.getItem('login');
                    if (loginData) {
                        const parsed = JSON.parse(loginData);
                        userId = parsed.userID || '';
                    }
                } catch (error) {
                    console.error('Error reading login data:', error);
                }
            }

            if (userId && story.likedBy && story.likedBy.includes(userId)) {
                setLikedStories(prev => new Set(prev).add(storyId));
            }
        } catch (error) {
            console.error('Error refreshing story data:', error);
        }
    };

    const getStoryComments = async (storyId: string) => {
        try {
            const response = await axios.get(`/api/proxy/api/ai-story/stories/${storyId}`);
            return response.data.story.comments || [];
        } catch (error) {
            console.error('Error fetching story comments:', error);
            return [];
        }
    };

    return (
        <StoryContext.Provider value={{ likedStories, commentCounts, likeCounts, toggleLike, addComment, refreshStoryData, getStoryComments }}>
            {children}
        </StoryContext.Provider>
    );
}

export function useStory() {
    const context = useContext(StoryContext);
    if (context === undefined) {
        throw new Error('useStory must be used within a StoryProvider');
    }
    return context;
}
