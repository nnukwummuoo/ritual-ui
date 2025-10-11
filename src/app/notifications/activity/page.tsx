/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react'
import RequestCard from '../components/RequestCard';
import { useUserId } from '@/lib/hooks/useUserId';
import {URL} from "@/api/config";
import VIPBadge from "@/components/VIPBadge";

interface Request {
  bookingId: string;
  type: 'fan' | 'creator';
  status: "request" | "expired" | "completed" | "accepted" | "declined" | "cancelled";
  otherUser?: {
    name: string;
    photolink: string;
    isCreator: boolean;
    isVip?: boolean;
    vipEndDate?: string | null;
  };
  timeRemaining?: string;
  price: number;
  createdAt: string;
  date?: string;
  time?: string;
  venue?: string;
  userid?: string;
  creator_portfolio_id?: string;
  hosttype?: string;
}

export default function Activity() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const userid = useUserId();

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

  const fetchRequests = async () => {
      if (!userid) return;
      
      try {
        // Use the dedicated fan meet requests endpoint
        const response = await fetch(`${URL}/getallfanmeetrequests`, {
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
            return {
              bookingId: req.bookingId,
              type: req.type, // Already determined by backend
              status: normalizeStatus(req.status),
              otherUser: req.otherUser,
              timeRemaining: req.timeRemaining,
              price: req.price || 0,
              createdAt: req.createdAt,
              date: req.date,
              time: req.time,
              venue: req.place,
              userid: req.userid,
              creator_portfolio_id: req.creator_portfolio_id,
              hosttype: req.hosttype // Include the host type from backend
            };
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

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    setRequests(prev => prev.map(req => 
      req.bookingId === bookingId ? { ...req, status: newStatus as Request['status'] } : req
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
        <div className="text-center text-white">No fan meet requests yet</div>
        <div className="text-center text-gray-400 text-sm">
          Fan meet requests will appear here when you send or receive them
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-8 max-w-[26rem] mx-auto'>
      {requests.map((request: Request) => (
        <div key={request.bookingId} className="relative">
          <RequestCard
            type={request.type}
            img={request.otherUser?.photolink || "/picture-1.jfif"}
            status={request.status}
            name={request.otherUser?.name || "Unknown User"}
            titles={request.otherUser?.isCreator ? ["Creator"] : ["Fan"]}
            exp={request.timeRemaining || "Expired"}
            bookingId={request.bookingId}
            price={request.price}
            details={request.date && request.time && request.venue ? {
              date: request.date,
              time: request.time,
              venue: request.venue
            } : undefined}
            userid={request.userid}
            creator_portfolio_id={request.creator_portfolio_id}
            hosttype={request.hosttype}
            isVip={request.otherUser?.isVip || false}
            vipEndDate={request.otherUser?.vipEndDate}
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
      ))}
  </div>
  );
}

