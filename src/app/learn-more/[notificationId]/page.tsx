"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { URL } from '@/api/config';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

interface NotificationDetails {
  _id: string;
  title: string;
  message: string;
  fullContent?: string;
  createdAt: string;
}

const LearnMorePage = () => {
  const { notificationId } = useParams();
  const [notification, setNotification] = useState<NotificationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const userid = useSelector((s: RootState) => s.register.userID);
  const token = useSelector((s: RootState) => s.register.refreshtoken);

  useEffect(() => {
    const fetchNotificationDetails = async () => {
      // Fallback to localStorage if Redux state is not yet hydrated
      let effectiveUserId = userid;
      let effectiveToken = token;
      if ((!effectiveUserId || !effectiveToken) && typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("login");
          if (raw) {
            const saved = JSON.parse(raw);
            effectiveUserId = effectiveUserId || saved.userID;
            effectiveToken = effectiveToken || saved.refreshtoken || saved.accesstoken;
          }
        } catch (error) {
          console.error('Error reading localStorage:', error);
        }
      }

      if (!notificationId || !effectiveUserId || !effectiveToken) {
        console.log('Missing required data:', { notificationId, effectiveUserId, effectiveToken });
        setError('Missing authentication data');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching notification details for:', notificationId);
        
        const response = await fetch(`${URL}/getNotificationDetails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveToken}`,
          },
          body: JSON.stringify({ 
            notificationId: notificationId,
            userid: effectiveUserId 
          })
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Response data:', data);
          
          if (data.success) {
            setNotification(data.notification);
          } else {
            setError(data.message || 'Notification not found');
          }
        } else {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          setError('Failed to load notification details');
        }
      } catch (error) {
        console.error('Error fetching notification details:', error);
        setError('Failed to load notification details');
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationDetails();
  }, [notificationId, userid, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading notification details...</div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <div className="text-white text-lg">{error || 'Notification not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-blue-500 mb-6">{notification.title}</h1>
          
          <div className="prose prose-invert max-w-none">
            <div className="text-white text-lg leading-relaxed whitespace-pre-wrap">
              {notification.message}
            </div>
            
            {notification.fullContent && notification.fullContent !== notification.message && (
              <div className="mt-6 text-white text-base leading-relaxed whitespace-pre-wrap">
                {notification.fullContent}
              </div>
            )}
            
            {/* If there's a learnMoreUrl, show it as additional content */}
            {notification.learnMoreUrl && !notification.learnMoreUrl.startsWith('http') && (
              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <h4 className="text-blue-500 font-semibold mb-2">Additional Information:</h4>
                <div className="text-white text-base leading-relaxed whitespace-pre-wrap">
                  {notification.learnMoreUrl}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="text-gray-400 text-sm">
              Published: {new Date(notification.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnMorePage;
