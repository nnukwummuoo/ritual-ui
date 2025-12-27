'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoSend } from 'react-icons/io5';
import { useStory } from '@/contexts/StoryContext';

interface Comment {
    userId: string;
    username: string;
    text: string;
    createdAt: string;
}

interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    storyId: string;
    storyTitle: string;
    userId: string;
    username: string;
}

export default function CommentModal({ isOpen, onClose, storyId, storyTitle, userId, username }: CommentModalProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { getStoryComments, addComment } = useStory();

    useEffect(() => {
        if (isOpen) {
            loadComments();
            // Focus input when modal opens
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen, storyId]);

    const loadComments = async () => {
        setLoading(true);
        try {
            const fetchedComments = await getStoryComments(storyId);
            setComments(fetchedComments);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || submitting) return;

        setSubmitting(true);
        try {
            await addComment(storyId, userId, username, newComment.trim());
            setNewComment('');
            await loadComments(); // Reload comments
        } catch (error) {
            console.error('Error submitting comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-black rounded-t-3xl z-50 max-h-[80vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div>
                                <h3 className="text-lg font-bold text-white">Comments</h3>
                                <p className="text-sm text-gray-400 line-clamp-1">{storyTitle}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                            >
                                <IoClose className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-400">No comments yet</p>
                                    <p className="text-sm text-gray-500 mt-2">Be the first to comment!</p>
                                </div>
                            ) : (
                                comments.map((comment, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex gap-3"
                                    >
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-bold text-sm">
                                                {comment.username?.[1]?.toUpperCase() || '?'}
                                            </span>
                                        </div>

                                        {/* Comment Content */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-white font-semibold text-sm">
                                                    {comment.username}
                                                </span>
                                                <span className="text-gray-500 text-xs">
                                                    {formatDate(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-gray-200 text-sm leading-relaxed">
                                                {comment.text}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Input Form */}
                        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/50">
                            <div className="flex gap-3">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    maxLength={500}
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || submitting}
                                    className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                                >
                                    {submitting ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <IoSend className="w-5 h-5 text-white" />
                                    )}
                                </button>
                            </div>
                            {newComment.length > 400 && (
                                <p className="text-xs text-gray-400 mt-2 text-right">
                                    {500 - newComment.length} characters remaining
                                </p>
                            )}
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
