/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react'
import RequestCard from '../components/RequestCard';
import { useUserId } from '@/lib/hooks/useUserId';
import { URL } from "@/api/config";
import VIPBadge from "@/components/VIPBadge";
import { useActivityNotificationIndicator } from "@/hooks/useActivityNotificationIndicator";
import { useDispatch, useSelector } from "react-redux";
import { markActivityNotificationsSeen } from "@/store/profile";
import { RootState, AppDispatch } from "@/store/store";
import { useAuth } from "@/lib/context/auth-context";
import { getImageSource } from "@/lib/imageUtils";

interface Request {
  requestId: string;
  type: 'fan' | 'creator';
  status: "request" | "expired" | "completed" | "accepted" | "declined" | "cancelled";
  otherUser?: {
    name: string;
    username?: string; // Add username field
    firstname?: string; // Add first name field
    lastname?: string; // Add last name field
    photolink: string;
    isCreator: boolean;
    isVip?: boolean;
    vipEndDate?: string | null;
    fanVerified?: boolean;
  };
  timeRemaining?: string;
  price: number;
  createdAt: string;
  date?: string;
  time?: string;
  venue?: string;
  userid?: string;
  creator_portfolio_id?: string;
  targetUserId?: string; // Add target user ID for profile navigation
  targetUsername?: string; // Username for profile URL (e.g. @handle)
  hosttype?: string;
  fanVerified?: boolean;
}

export default function Activity() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const userid = useUserId();
  const dispatch = useDispatch<AppDispatch>();
  const { session } = useAuth();
  const token = session?.token;

  // Get notification data from Redux store
  const { notifications } = useSelector((state: RootState) => state.profile);

  // Get activity notification indicator data
  const { hasUnread, unreadCount, totalCount } = useActivityNotificationIndicator();

  useEffect(() => {
    // Helper function to normalize status values
    const normalizeStatus = (status: string): Request['status'] => {
      const statusMap: Record<string, Request['status']> = {
        'decline': 'declined',
        'pending': 'request',
        'accept': 'accepted',
        'request': 'request',
        'accepted': 'accepted',
        'declined': 'declined',
        'cancelled': 'cancelled',
        'expired': 'expired',
        'completed': 'completed'
      };

      return statusMap[status] || 'request'; // Default to 'request' if status is unknown
    };

    // Helper function to calculate time remaining based on request type and status
    const calculateTimeRemaining = (createdAt: string, type: string, status: string) => {
      try {
        const created = new Date(createdAt);
        const now = new Date();
        const isFanCall = (type || "").toLowerCase().includes("fan call");

        let daysToExpire: number;

        // Determine expiration period based on status
        if (status === 'pending' || status === 'request') {
          // Pending requests expire in 23 hours 14 minutes
          daysToExpire = (23 * 60 + 14) / (24 * 60); // Convert 23h14m to fraction of days (0.9680555...)
        } else if (status === 'accepted' || status === 'accept') {
          // Accepted requests:
          // - Fan Call: 10 days
          // - Fan Meet/Date: 14 days
          daysToExpire = isFanCall ? 10 : 20;
        } else {
          // For other statuses (declined, cancelled, expired, completed), show no time remaining
          return "No action needed";
        }

        const expireTime = new Date(created.getTime() + daysToExpire * 24 * 60 * 60 * 1000);
        const diffMs = expireTime.getTime() - now.getTime();

        if (diffMs <= 0) return "Expiring soon";

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        // For pending requests (24 hours), show hours and minutes
        if (daysToExpire === 1) {
          if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}m left`;
          } else {
            return `${diffMinutes}m left`;
          }
        }

        // For accepted requests, show days and hours
        if (diffDays > 0) {
          return `${diffDays}d ${diffHours}h left`;
        } else {
          return `${diffHours}h left`;
        }
      } catch (e) {
        return "Requires action";
      }
    };

    const fetchRequests = async () => {
      if (!userid) return;

      try {
        // Use the dedicated fan meet requests endpoint
        const response = await fetch(`${URL}/getallfanrequests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userid: userid
          })
        });

        const data = await response.json();

        if (data.ok && data.requests) {
          if (data.requests.length === 0) {
            setRequests([]);
            return;
          }

          // Transform the data to match our Request interface
          const transformedRequests: Request[] = data.requests.map((req: any) => {
            // Calculate time remaining based on creation date, type, and status
            const calculatedTimeRemaining = calculateTimeRemaining(req.createdAt, req.type || req.hosttype, req.status);

            return {
              requestId: req.requestId,
              type: req.type, // Already determined by backend
              status: normalizeStatus(req.status),
              otherUser: req.otherUser,
              timeRemaining: calculatedTimeRemaining, // Use calculated time
              price: req.price || 0,
              createdAt: req.createdAt,
              date: req.date,
              time: req.time,
              venue: req.place,
              userid: req.userid,
              creator_portfolio_id: req.creator_portfolio_id,
              targetUserId: req.targetUserId,
              targetUsername: req.targetUsername || req.otherUser?.username,
              hosttype: req.hosttype,
              fanVerified: req.otherUser?.fanVerified || false, 
            };
          });

          // Sort by createdAt (most recent first) as a fallback
          transformedRequests.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA; // Most recent first
          });

          setRequests(transformedRequests);
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userid]);

  // Mark activity notifications as seen when component mounts
  useEffect(() => {
    if (userid && token && notifications && notifications.length > 0) {
      // Only mark activity-related notifications as seen (request, request, fan meet related)
      const activityNotifications = notifications.filter(notification => {
        const message = notification.message.toLowerCase();
        return (message.includes('request') ||
          message.includes('request') ||
          message.includes('fan meet') ||
          message.includes('accepted') ||
          message.includes('declined') ||
          message.includes('cancelled') ||
          message.includes('expired') ||
          message.includes('completed')) && !notification.seen;
      });

      if (activityNotifications.length > 0) {
        // Mark only activity notifications as seen
        dispatch(markActivityNotificationsSeen({ userid: userid, token }));
      }
    }
  }, [dispatch, userid, token, notifications]);

  const handleStatusChange = (requestId: string, newStatus: string) => {
    setRequests(prev => prev.map(req =>
      req.requestId === requestId ? { ...req, status: newStatus as Request['status'] } : req
    ));
  };

  if (loading) {
    return (
      <div className='flex flex-col gap-8 max-w-[26rem] mx-auto'>
        <div className="text-center text-white">Loading requests...</div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className='flex flex-col gap-8 max-w-[26rem] mx-auto'>
        <div className="text-center text-white">No fan requests yet</div>
        <div className="text-center text-gray-400 text-sm">
          Fan meet requests will appear here when you send or receive them
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-8 max-w-[26rem] mx-auto'>
      {/* Activity Header */}
      <div className="w-full max-w-md mb-4">
        <div className="bg-[#0B0F1A]/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Activity</h2>
            <div className="flex items-center gap-2">
              {hasUnread && (
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  {unreadCount} new
                </div>
              )}
              <span className="text-slate-400 text-sm">
                {requests.length} total
              </span>
            </div>
          </div>
        </div>
      </div>

      {requests.map((request: Request) => {
        // Determine the correct bucket based on user type (creator vs fan)
        const isCreator = request.otherUser?.isCreator || false;
        const bucket = isCreator ? 'creator' : 'profile';
        const photolink = request.otherUser?.photolink || '';
        const name = request.otherUser?.name || "Unknown User";
        const username = request.otherUser?.username || '';
        const firstName = request.otherUser?.firstname || '';
        const lastName = request.otherUser?.lastname || '';

        // Get image source with correct bucket
        // Try with the determined bucket first, then fallback to 'profile' if that doesn't work
        const imageSource = getImageSource(photolink, bucket);
        let imageSrc = imageSource.src || photolink;

        // If no src and photolink exists, try with 'profile' bucket as fallback
        if (!imageSrc && photolink && bucket === 'creator') {
          const fallbackSource = getImageSource(photolink, 'profile');
          imageSrc = fallbackSource.src || photolink;
        }

        // Final fallback to default image
        if (!imageSrc || imageSrc.trim() === '') {
          imageSrc = "/picture-1.jfif";
        }

        return (
          <div key={request.requestId} className="relative">
            <RequestCard
              type={request.type}
              img={imageSrc}
              originalPhotoLink={photolink}
              status={request.status}
              fanVerified={request.fanVerified || false}
              name={name}
              username={username}
              firstName={firstName}
              lastName={lastName}
              titles={request.otherUser?.isCreator ? ["Creator"] : ["Fan"]}
              exp={request.timeRemaining || "Expiring soon"}
              requestId={request.requestId}
              price={request.price}
              details={
                request.date && request.time ? {
                  date: request.date,
                  time: request.time,
                  venue: request.venue || "" // Empty venue for Fan Call
                } : undefined
              }
              userid={request.userid}
              creator_portfolio_id={request.creator_portfolio_id}
              targetUserId={request.targetUserId}
              targetUsername={request.targetUsername}
              hosttype={request.hosttype}
              isVip={request.otherUser?.isVip || false}
              vipEndDate={request.otherUser?.vipEndDate}
              createdAt={request.createdAt} // Add createdAt prop
              onStatusChange={handleStatusChange}
            />

            {/* VIP Badge - positioned outside the card */}
            {request.otherUser?.isVip && (
              <VIPBadge
                size="xl"
                className="absolute top-2 left-12 z-10"
                isVip={request.otherUser.isVip}
                vipEndDate={request.otherUser.vipEndDate || undefined}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
