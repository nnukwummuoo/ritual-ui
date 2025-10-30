'use client';

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { useParams, useRouter } from "next/navigation";
import { URL as API_BASE } from "@/api/config";
import { fetchsinglepost } from "@/store/post";
import { postlike } from "@/store/like";
import { getpostcomment, postcomment } from "@/store/comment";
const PROD_BASE = "https://backendritual.work"; // fallback when local proxy is down
import { toast } from "material-react-toastify";
import PostActions from "../../../components/home/PostActions";
import { getImageSource } from "@/lib/imageUtils";
import Image from "next/image";
import { X } from "lucide-react";
import VIPBadge from "@/components/VIPBadge";
import axios from "axios";
import ExpandableText from "@/components/ExpandableText";
import { generateInitials } from "@/utils/generateInitials";

function PostSingle() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { postId } = useParams();
    
    // Fix for concatenated post IDs - extract the first valid ID
    const extractPostId = (id: string | string[] | undefined): string => {
        if (!id) return "";
        const idStr = Array.isArray(id) ? id[0] : String(id);
        
        // If the ID contains multiple IDs concatenated (like "68d934b10f183828b1fafaf268d934b11d185344db9e")
        // Extract the first valid MongoDB ObjectId (24 characters)
        if (idStr.length > 24) {
            // Try to find the first valid ObjectId
            const match = idStr.match(/^[a-f\d]{24}/);
            if (match) {
                return match[0];
            }
        }
        
        return idStr;
    };
    
    const cleanPostId = extractPostId(postId);
    
    // Get auth data
    const loggedInUserId = useSelector((s: RootState) => s.register.userID);
    const authToken = useSelector((s: RootState) => s.register.refreshtoken || s.register.accesstoken);
    const { username, firstname, lastname, photolink } = useSelector((s: RootState) => s.profile);
    
    // State for the post
    const [thePost, setThePost] = React.useState<any>({});
    const [postAuthorData, setPostAuthorData] = React.useState<any>(null);
    
    // State for post interactions (exactly like profile modal)
    const [modalUi, setModalUi] = React.useState({
        liked: false,
        likeCount: 0,
        comments: [] as any[],
        commentCount: 0,
        open: false,
        input: "",
        loadingComments: false,
        sending: false
    });

    // Function to get media source with fallbacks (same as in profile page)
    const getMediaSource = (post: any) => {
        // Only process images when we have actual post data
        const hasPostData = post && Object.keys(post).length > 0 && post._id;
        
        
        // Infer post type: prefer explicit fields if present
        let postType: string = hasPostData ? (post?.posttype || post?.type || "text") : "text";
        if (!postType && hasPostData) {
            if (post?.postphoto || post?.image) postType = "image";
            else if (post?.postvideo || post?.video) postType = "video";
        }

        // Resolve media reference (cover more backend key variants) - same as profile page
        // Prioritize full URLs over public IDs for better image display
    const mediaRef = hasPostData ? (
            post?.postfilelink ||  // Use full URL first
            post?.postphoto ||
            post?.postvideo ||
            post?.postlink ||
            post?.postFile ||
            post?.file ||
            post?.proxy_view ||
            post?.file_link ||
            post?.media ||
            post?.image ||
            post?.video ||
            post?.thumblink ||
        // support top-level identifiers
            post?.publicId ||
            post?.public_id ||
            post?.imageId ||
            post?.postfilepublicid ||  // Use public ID as fallback
            ""
        ) : "";
        
    const asString = typeof mediaRef === "string" ? mediaRef : (mediaRef?.publicId || mediaRef?.public_id || mediaRef?.url || "");
    
    
    // Use bucket detection for Storj URLs (only when we have data)
    // For direct URLs (like Appwrite), use them as-is. For Storj URLs, process through proxy
    const imageSource = hasPostData ? getImageSource(asString, 'post') : { src: '', isStorj: false, bucket: 'post', key: '', originalUrl: '' };
    
    // If it's a direct URL (not Storj), use it directly. Otherwise use the processed source
    const src = hasPostData && asString && !imageSource.isStorj && (asString.startsWith('http://') || asString.startsWith('https://')) 
        ? asString 
        : imageSource.src;
    
    
    
    // Keep fallback URLs for error handling
    const queryUrlPrimary = asString ? `${API_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
    const pathUrlPrimary = asString ? `${API_BASE}/api/image/view/${encodeURIComponent(asString)}` : "";
    const queryUrlFallback = asString ? `${PROD_BASE}/api/image/view?publicId=${encodeURIComponent(asString)}` : "";
    const pathUrlFallback = asString ? `${PROD_BASE}/api/image/view/${encodeURIComponent(asString)}` : "";

        return {
            src,
            postType,
            asString,
            queryUrlPrimary,
            pathUrlPrimary,
            queryUrlFallback,
            pathUrlFallback
        };
    };

    // Function to fetch post author data (same as profile page)
    const fetchPostAuthorData = React.useCallback(async (userId: string) => {
        try {
            const response = await axios.post(`${API_BASE}/getprofilebyID`, 
                { userid: userId }, 
                { 
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );
            
            if (response.data && response.data.profile) {
                setPostAuthorData(response.data.profile);
            }
        } catch (error) {
            console.error('Error fetching post author data:', error);
        }
    }, [authToken]);

    // Handle like for post (same as profile modal)
    const handleModalLike = async () => {
        const uid = String(loggedInUserId || "");
        
        if (!postId || !authToken) {
            toast.error("Please login to like posts");
            return;
        }
        
        const currentLiked = modalUi.liked;
        const currentCount = modalUi.likeCount;
        
        // Optimistic update
        setModalUi(prev => ({
            ...prev,
            liked: !currentLiked,
            likeCount: Math.max(0, currentCount + (!currentLiked ? 1 : -1)),
        }));

        try {
            await dispatch(postlike({
                userid: uid,
                postid: String(postId),
                token: authToken
            } as any)).unwrap();
        } catch (error) {
            console.error('Like error:', error);
            // Revert on error
            setModalUi(prev => ({
                ...prev,
                liked: currentLiked,
                likeCount: currentCount,
            }));
            toast.error("Failed to update like. Please try again.");
        }
    };

    // Handle comment toggle (same as profile modal)
    const handleModalCommentToggle = () => {
        setModalUi(prev => ({
            ...prev,
            open: !prev.open
        }));

        // If comments are already loaded, don't fetch again
        if (!modalUi.open && modalUi.comments.length > 0) {
            return;
        }

        // Only fetch if comments are not already loaded
        if (!modalUi.open && modalUi.comments.length === 0) {
            setModalUi(prev => ({ ...prev, loadingComments: true }));
            dispatch(getpostcomment({ postid: String(postId) } as any))
                .unwrap()
                .then((res: any) => {
                    const arr = (res && (res.comment || res.comments)) || [];
                    setModalUi(prev => ({
                        ...prev,
                        comments: arr,
                        commentCount: arr.length,
                        loadingComments: false
                    }));
                })
                .catch(() => {
                    setModalUi(prev => ({
                        ...prev,
                        loadingComments: false
                    }));
                });
        }
    };

    // Handle comment submission (same as profile modal)
    const handleModalCommentSubmit = () => {
        const text = modalUi.input.trim();
        if (!text || !postId) return;

        const tempComment = {
            content: text,
            comment: text,
            username: username || 'you',
            commentusername: username || 'you',
            commentuserphoto: photolink || '',
            userid: String(loggedInUserId || ''),
            createdAt: new Date().toISOString(),
            commenttime: Date.now(),
            temp: true,
            initials: generateInitials(firstname, lastname, username)
        };

        // Optimistic update
        setModalUi(prev => ({
            ...prev,
            input: "",
            sending: true,
            comments: [...prev.comments, tempComment],
            commentCount: prev.comments.length + 1,
        }));

        const uid = String(loggedInUserId || "");
        
        if (uid && authToken) {
            dispatch(postcomment({
                userid: uid,
                postid: String(postId),
                content: text,
                token: authToken
            } as any))
                .unwrap()
                .then(() => {
                    // Refresh comments after successful post
                    dispatch(getpostcomment({ postid: String(postId) } as any))
                        .unwrap()
                        .then((commentRes: any) => {
                            const serverComments = (commentRes && (commentRes.comment || commentRes.comments)) || [];
                            setModalUi(prev => ({
                                ...prev,
                                sending: false,
                                comments: serverComments,
                                commentCount: serverComments.length,
                            }));
                        })
                        .catch(() => {
                            setModalUi(prev => ({
                                ...prev,
                                sending: false,
                            }));
                        });
                })
                .catch(() => {
                    setModalUi(prev => ({
                        ...prev,
                        sending: false,
                    }));
                    toast.error("Failed to post comment");
                });
        } else {
            setModalUi(prev => ({
                ...prev,
                sending: false,
            }));
        }
    };

    // Fetch the post data
    React.useLayoutEffect(() => {
        const fetchPost = async () => {
                try {
                const res = await fetchsinglepost(cleanPostId);
                    setThePost(res);
                
                // Fetch likes and comments separately (same as main post component)
                try {
                    // Get likes for this post
                    const likeResponse = await fetch(`${API_BASE}/like?postid=${res._id || res.postid || res.id}`);
                    const likeData = likeResponse.ok ? await likeResponse.json() : { likeCount: 0, likedBy: [] };
                    
                    // Get comments for this post
                    const commentResponse = await fetch(`${API_BASE}/getpostcomment`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ postid: res._id || res.postid || res.id })
                    });
                    const commentData = commentResponse.ok ? await commentResponse.json() : { comment: [] };
                    const comments = commentData.comment || commentData.comments || [];
                    
                    // Update modal UI with fetched like/comment data
                    setModalUi({
                        liked: likeData.likedBy?.includes(loggedInUserId) || false,
                        likeCount: likeData.likeCount || 0,
                        comments: comments,
                        commentCount: comments.length,
                        open: false,
                        input: "",
                        loadingComments: false,
                        sending: false
                    });
                } catch (likeCommentError) {
                    console.error('Error fetching likes/comments:', likeCommentError);
                    // Fallback to basic post data
                    setModalUi({
                        liked: res.likedBy?.includes(loggedInUserId) || res.likes?.some((like: any) => like.userid === loggedInUserId) || false,
                        likeCount: res.likeCount || res.likes?.length || 0,
                        comments: res.comments || [],
                        commentCount: res.commentCount || res.comments?.length || 0,
                        open: false,
                        input: "",
                        loadingComments: false,
                        sending: false
                    });
                }

                // If post doesn't have user data, fetch it separately
                if (!res.user && res.userid) {
                    fetchPostAuthorData(res.userid);
                } else {
                    setPostAuthorData(res.user);
                }
                } catch (err) {
                    console.error(err);
                toast.error("Failed to load post");
            }
        };
        
        fetchPost();
    }, [cleanPostId, loggedInUserId, authToken, fetchPostAuthorData]);

    if (!thePost || Object.keys(thePost).length === 0) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    const { src, postType, pathUrlPrimary, queryUrlFallback, pathUrlFallback } = getMediaSource(thePost);
    
    // Use the primary URL if src is just a public ID
    const imageSrc = src && !src.startsWith('http') ? pathUrlPrimary || queryUrlFallback || pathUrlFallback : src;

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
                <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-0.5">
                                <div className="w-full h-full rounded-full overflow-hidden bg-gray-700">
                                    {(() => {
                                        const userData = postAuthorData || thePost.user;
                                        const profileImage = userData?.photolink;
                                        const userName = `${userData?.firstname || ""} ${userData?.lastname || ""}`.trim();
                                        const initials = userName.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || "?";
                                        
                                        if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                                            const imageSource = getImageSource(profileImage, 'profile');
                                            return (
                                                <Image 
                                                    src={imageSource.src} 
                                                    alt="Profile" 
                                                    width={48} 
                                                    height={48} 
                          className="object-cover w-full h-full"
                                                />
                                            );
                                        }
                                        
                                        return (
                                            <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-lg font-semibold">
                                                {initials}
                                            </div>
                                        );
                                    })()}
                                </div>
                                
                                {/* VIP Lion Badge - show if the post author has VIP status */}
                                {(() => {
                                    const userData = postAuthorData || thePost.user;
                                    const isVipActive = userData?.isVip && userData?.vipEndDate && new Date(userData.vipEndDate) > new Date();
                                    return isVipActive && (
                                        <VIPBadge size="lg" className="absolute -top-2 -right-2" isVip={userData.isVip} vipEndDate={userData.vipEndDate} />
                                    );
                                })()}
                      </div>
                      <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-lg">
                                        {(postAuthorData || thePost.user)?.firstname || ''} {(postAuthorData || thePost.user)?.lastname || ''}
                                    </p>
                                    {/* {(() => {
                                        const userData = postAuthorData || thePost.user;
                                        const isVipActive = userData?.isVip && userData?.vipEndDate && new Date(userData.vipEndDate) > new Date();
                                        return isVipActive && (
                                            <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full font-medium">
                                                VIP
                                            </span>
                                        );
                                    })()} */}
                                </div>
                                <p className="text-sm text-blue-400 font-medium">
                                    {(postAuthorData || thePost.user)?.username || (postAuthorData || thePost.user)?.username || 'No username'}
                                </p>
                            </div>
                      </div>
                        <button 
                            onClick={() => router.back()}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 overflow-auto">
                        {/* Media display with proper fallbacks */}
                        {postType === "image" && imageSrc && (
                            <div className="relative bg-black flex items-center justify-center min-h-[400px]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imageSrc}
                                    alt={thePost?.content || "post image"}
                                    className="max-w-full max-h-[70vh] object-contain"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement & { dataset: any };
                                        
                          if (!img.dataset.fallback1 && pathUrlPrimary) {
                            img.dataset.fallback1 = "1";
                            img.src = pathUrlPrimary;
                            return;
                          }
                          if (!img.dataset.fallback2 && queryUrlFallback) {
                            img.dataset.fallback2 = "1";
                            img.src = queryUrlFallback;
                            return;
                          }
                          if (!img.dataset.fallback3 && pathUrlFallback) {
                            img.dataset.fallback3 = "1";
                            img.src = pathUrlFallback;
                          }
                        }}
                      />
                            </div>
                    )}
                        
                        {postType === "video" && imageSrc && (
                            <div className="relative bg-black flex items-center justify-center min-h-[400px]">
                      <video
                                    src={imageSrc}
                        controls
                                    className="max-w-full max-h-[70vh]"
                        onError={(e) => {
                          const video = e.currentTarget as HTMLVideoElement & { dataset: any };
                                        
                          if (!video.dataset.fallback1 && pathUrlPrimary) {
                            video.dataset.fallback1 = "1";
                            video.src = pathUrlPrimary;
                            video.load();
                            return;
                          }
                          if (!video.dataset.fallback2 && queryUrlFallback) {
                            video.dataset.fallback2 = "1";
                            video.src = queryUrlFallback;
                            video.load();
                            return;
                          }
                          if (!video.dataset.fallback3 && pathUrlFallback) {
                            video.dataset.fallback3 = "1";
                            video.src = pathUrlFallback;
                            video.load();
                          }
                        }}
                      />
                            </div>
                        )}
                        
                        {/* Post content and actions */}
                        <div className="p-4">
                            {/* Post content */}
                            <ExpandableText 
                              text={thePost.content}
                              maxLength={100}
                              className="mb-4"
                            />
                            
                            {/* Post date */}
                            {thePost.createdAt && (
                                <p className="text-sm text-gray-400 mb-4">
                                    {new Date(thePost.createdAt).toLocaleString()}
                                </p>
                            )}
                            
                            {/* Post Actions - WITHOUT star button */}
                    <PostActions
                      className="mt-3 border-t border-gray-700 pt-2"
                                liked={modalUi.liked}
                                likeCount={modalUi.likeCount}
                                commentCount={modalUi.commentCount}
                                post={thePost}
                                onLike={handleModalLike}
                                onComment={handleModalCommentToggle}
                                // Remove the star-related props entirely
                            />
                            
                            {/* Comments section */}
                            {modalUi.open && (
                                <div className="mt-4 border-t border-gray-700 pt-4">
                                    {modalUi.loadingComments ? (
                                        <div className="flex justify-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {/* Comments list */}
                                            {modalUi.comments.length > 0 ? (
                                                modalUi.comments.map((comment: any, index: number) => (
                                                    <div key={index} className="flex gap-3">
                                                        <div className="flex-shrink-0">
                                                            <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-teal-600 p-0.5">
                                                                <div className="w-full h-full rounded-full overflow-hidden bg-gray-700">
                                                                    {(() => {
                                                                        const profileImage = comment.commentuserphoto || comment.user?.photolink;
                                                                        const userName = comment.commentusername || comment.user?.username || comment.username || "User";
                                                                        const initials = comment.initials || userName.split(/\s+/).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || "?";
                                                                        
                                                                        if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                                                                            return (
                                                                                <Image
                                                                                    src={profileImage}
                                                                                    alt="Commenter"
                                                                                    width={40}
                                                                                    height={40}
                                                                                    className="object-cover w-full h-full rounded-full"
                                                                                    onError={(e) => {
                                                                                        const target = e.target as HTMLImageElement;
                                                                                        target.style.display = 'none';
                                                                                        const parent = target.parentElement;
                                                                                        if (parent) {
                                                                                            const fallbackDiv = document.createElement('div');
                                                                                            fallbackDiv.className = 'w-full h-full rounded-full bg-gray-600 flex items-center justify-center text-sm text-white font-semibold';
                                                                                            fallbackDiv.textContent = initials;
                                                                                            parent.appendChild(fallbackDiv);
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            );
                                                                        }
                                                                        
                                                                        return (
                                                                            <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center text-sm text-white font-semibold">
                                                                                {initials}
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                                
                                                                {/* VIP Lion Badge - show if the commenter has VIP status */}
                                                                {(() => {
                                                                    const isVipActive = comment.isVip && comment.vipEndDate && new Date(comment.vipEndDate) > new Date();
                                                                    return isVipActive && (
                                                                        <VIPBadge size="md" className="absolute -top-1 -right-1" isVip={comment.isVip} vipEndDate={comment.vipEndDate} />
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="bg-gray-800 rounded-lg p-3">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <p className="font-semibold text-sm text-white">
                                                                        {comment.commentusername || comment.user?.username || comment.username || 'User'}
                                                                    </p>
                                                                </div>
                                                                <p className="text-gray-200 text-sm leading-relaxed">
                                                                    {comment.comment || comment.content || String(comment)}
                                                                </p>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1 ml-1">
                                                                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Just now'}
                                                            </p>
                                                        </div>
                                </div>
                              ))
                            ) : (
                                                <p className="text-center text-gray-500 py-4">No comments yet.</p>
                                            )}
                                            
                                            {/* Comment input */}
                                            <div className="flex items-center gap-3 pt-2">
                                                <div className="relative w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 p-0.5 flex-shrink-0">
                                                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-700">
                                                        {(() => {
                                                            const profileImage = photolink;
                                                            const userName = `${firstname || ""} ${lastname || ""}`.trim();
                                                            const initials = userName.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || "?";
                                                            
                                                            if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                                                                const imageSource = getImageSource(profileImage, 'profile');
                                                                return (
                                                                    <Image
                                                                        src={imageSource.src}
                                                                        alt="Your profile"
                                                                        width={32}
                                                                        height={32}
                                                                        className="object-cover w-full h-full"
                                                                    />
                                                                );
                                                            }
                                                            
                                                            return (
                                                                <div className="w-full h-full bg-gray-600 flex items-center justify-center text-xs text-white font-semibold">
                                                                    {initials}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                              <input
                                                    value={modalUi.input}
                                                    onChange={(e) => setModalUi(prev => ({
                                    ...prev,
                                                        input: e.target.value
                                                    }))}
                                                    placeholder="Write a comment…"
                                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleModalCommentSubmit();
                                                        }
                                                    }}
                              />
                              <button
                                                    disabled={!modalUi.input.trim() || modalUi.sending}
                                                    onClick={handleModalCommentSubmit}
                                                    className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-colors"
                                                >
                                                    {modalUi.sending ? "..." : "Post"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PostSingle