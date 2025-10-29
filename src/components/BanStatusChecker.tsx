"use client";

import { useBanStatusCheck } from '@/hooks/useBanStatusCheck';

export default function BanStatusChecker() {
  useBanStatusCheck();
  return null; // This component doesn't render anything
}
