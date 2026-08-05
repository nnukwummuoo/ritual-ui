'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface StoryContextType {
    likedStories: Set<string>;
    commentCounts: Map<string, number>;
    likeCounts: Map<string, number>;
    toggleLike: (storyId: string, userId: string, isCreatorRitual?: boolean) => Promise<void>;
    addComment: (storyId: string, userId: string, username: string, text: string, isCreatorRitual?: boolean) => Promise<void>;
    refreshStoryData: (storyId: string, isCreatorRitual?: boolean) => Promise<void>;
    getStoryComments: (storyId: string, isCreatorRitual?: boolean) => Promise<any[]>;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export function StoryProvider({ children }: { children: React.ReactNode }) {
    const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
    const [commentCounts, setCommentCounts] = useState<Map<string, number>>(new Map());
    const [likeCounts, setLikeCounts] = useState<Map<string, number>>(new Map());

    // Load liked stories and comment counts from localStorage on mount
    useEffect(() => {
        const savedLikes = localStorage.getItem('ritual_liked_stories');
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
        localStorage.setItem('ritual_liked_stories', JSON.stringify(Array.from(likedStories)));
    }, [likedStories]);

const toggleLike = async (storyId: string, userId: string, isCreatorRitual = false) => {
    try {
        if (isCreatorRitual) {
            // Creator rituals have their own endpoint — handled directly in RitualRow
            // This branch is a no-op; RitualRow calls axios directly with username
            return;
        }
        const response = await axios.post(`/api/proxy/api/ai-story/stories/${storyId}/like`, { userId });
        if (response.data.success) {
            setLikedStories(prev => {
                const newSet = new Set(prev);
                if (response.data.liked) newSet.add(storyId);
                else newSet.delete(storyId);
                return newSet;
            });
            setLikeCounts(prev => new Map(prev).set(storyId, response.data.likes));
        }
    } catch (error) {
        console.error('Error toggling like:', error);
    }
};

const addComment = async (storyId: string, userId: string, username: string, text: string, isCreatorRitual = false) => {
    try {
        if (isCreatorRitual) {
            const response = await axios.post(`/api/proxy/api/creator-rituals/${storyId}/comment`, {
                userId,
                username,
                text
            });
            if (response.data.ok) {
                setCommentCounts(prev => new Map(prev).set(storyId, response.data.totalComments));
            }
        } else {
            const response = await axios.post(`/api/proxy/api/ai-story/stories/${storyId}/comment`, {
                userId,
                username,
                text
            });
            if (response.data.success) {
                setCommentCounts(prev => new Map(prev).set(storyId, response.data.totalComments));
            }
        }
    } catch (error) {
        console.error('Error adding comment:', error);
    }
};

const refreshStoryData = async (storyId: string, isCreatorRitual = false) => {
    try {
        let likedBy: string[] = [];
        let commentCount = 0;

        if (isCreatorRitual) {
            const response = await axios.get(`/api/proxy/api/creator-rituals/${storyId}`);
            const ritual = response.data.ritual;
            likedBy = ritual.likedBy || [];
            commentCount = ritual.comments?.length || 0;
        } else {
            const response = await axios.get(`/api/proxy/api/ai-story/stories/${storyId}`);
            const story = response.data.story;
            likedBy = story.likedBy || [];
            commentCount = story.comments?.length || 0;
        }

        setCommentCounts(prev => new Map(prev).set(storyId, commentCount));

        let userId = '';
        try {
            const parsed = JSON.parse(localStorage.getItem('login') || '{}');
            userId = parsed.userID || '';
        } catch {}

        if (userId && likedBy.includes(userId)) {
            setLikedStories(prev => new Set(prev).add(storyId));
        }
    } catch (error) {
        console.error('Error refreshing story data:', error);
    }
};

const getStoryComments = async (storyId: string, isCreatorRitual = false) => {
    try {
        if (isCreatorRitual) {
            const response = await axios.get(`/api/proxy/api/creator-rituals/${storyId}`);
            return response.data.ritual?.comments || [];
        }
        const response = await axios.get(`/api/proxy/api/ai-story/stories/${storyId}`);
        return response.data.story?.comments || [];
    } catch (error) {
        console.error('Error fetching comments:', error);
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
