"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Megaphone, AlertTriangle, Bell } from 'lucide-react';
import { URL } from '@/api/config';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

interface NotificationDetails {
  _id: string;
  title: string;
  message: string;
  fullContent?: string;
  createdAt: string;
  hasLearnMore?: boolean;
  learnMoreUrl?: string | null;
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

const LoadingState = () => (
  <div className="min-h-screen bg-[#080b14] relative overflow-hidden">
    <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-[#a89cff]/10 blur-[120px]" />
    <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="h-5 w-24 rounded-full bg-white/5 animate-pulse mb-8" />
      <div className="bg-[#0d1220] border border-white/5 rounded-2xl p-6 sm:p-10">
        <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse mb-6" />
        <div className="h-7 w-3/4 rounded-lg bg-white/5 animate-pulse mb-3" />
        <div className="h-4 w-32 rounded-lg bg-white/5 animate-pulse mb-8" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-[#080b14] flex items-center justify-center px-4">
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[360px] h-[360px] rounded-full bg-red-500/10 blur-[100px]" />
      <div className="relative bg-[#0d1220] border border-white/5 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="text-white text-lg font-semibold mb-2">
          Couldn&apos;t load this notification
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-7">
          {message}
        </p>
        <Link
          href="/notifications"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                     text-[#080b14] bg-[#a89cff] hover:bg-[#9384ff] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to notifications
        </Link>
      </div>
    </div>
  </div>
);

const LearnMorePage = () => {
  const { notificationId } = useParams();
  const router = useRouter();
  const [notification, setNotification] = useState<NotificationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userid = useSelector((s: RootState) => s.register.userID);
  const token = useSelector((s: RootState) => s.register.accesstoken);

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
            effectiveToken = effectiveToken || saved.accesstoken || saved.refreshtoken;
          }
        } catch (error) {
          console.error('Error reading localStorage:', error);
        }
      }

      if (!notificationId || !effectiveUserId || !effectiveToken) {
        setError('We couldn\u2019t verify your session for this notification. Please try opening it again from your notifications list.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

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

        if (response.ok) {
          const data = await response.json();

          if (data.success) {
            setNotification(data.notification);
          } else {
            setError(data.message || 'This notification could not be found.');
          }
        } else {
          setError('This notification could not be found. It may have been deleted.');
        }
      } catch (error) {
        console.error('Error fetching notification details:', error);
        setError('Something went wrong while loading this notification. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationDetails();
  }, [notificationId, userid, token]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !notification) {
    return <ErrorState message={error || 'Notification not found'} />;
  }

  // `fullContent` already equals `learnMoreUrl` (the extended body text an
  // admin wrote for this broadcast) or falls back to `message` server-side.
  // Only render it as a separate block when it actually adds something new,
  // so the opening message is never duplicated underneath itself.
  const extendedContent =
    notification.fullContent && notification.fullContent !== notification.message
      ? notification.fullContent
      : null;

  return (
    <div className="min-h-screen bg-[#080b14] relative overflow-hidden">
      {/* Ambient brand glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[620px] h-[620px] rounded-full bg-[#a89cff]/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-[#6c5ce7]/5 blur-[110px]" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Top bar */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white
                     transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>

        {/* Card */}
        <article className="bg-[#0d1220] border border-white/5 rounded-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Header strip */}
          <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 border-b border-white/5">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#a89cff]/10 border border-[#a89cff]/20 flex items-center justify-center shrink-0">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="MMEKO"
                  width={26}
                  height={26}
                  className="rounded-md object-cover"
                />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold
                               uppercase tracking-wider text-[#a89cff] bg-[#a89cff]/10 border border-[#a89cff]/20">
                <Megaphone className="w-3 h-3" />
                Announcement
              </span>
            </div>

            <h1 className="text-white text-2xl sm:text-3xl font-bold leading-tight mb-3">
              {notification.title}
            </h1>

            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(notification.createdAt)}</span>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 sm:px-10 py-8 sm:py-10">
            <p className="text-slate-100 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
              {notification.message}
            </p>

            {extendedContent && (
              <p className="mt-6 text-slate-300 text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap">
                {extendedContent}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-10 pb-8 sm:pb-10 pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/notifications"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                         text-[#080b14] bg-[#a89cff] hover:bg-[#9384ff] transition-colors"
            >
              <Bell className="w-4 h-4" />
              All notifications
            </Link>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                         text-slate-300 border border-white/10 hover:bg-white/5 transition-colors"
            >
              Go back
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};

export default LearnMorePage;