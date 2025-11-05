"use client";

import { useEffect } from "react";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import { useUserId } from "@/lib/hooks/useUserId";

/**
 * Global component to track website visitors
 * This should be added to the root layout
 * Ensures temporary visitor ID is created on first visit
 */
export default function GlobalVisitorTracker() {
  const userId = useUserId();
  
  // Ensure temporary visitor ID is created immediately on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const STORAGE_KEY = 'mmeko_temporary_visitor_id';
      const existing = localStorage.getItem(STORAGE_KEY);
      
      if (!existing) {
        // Create temporary visitor ID immediately if it doesn't exist
        const newTempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(STORAGE_KEY, newTempId);
        console.log('✅ [GlobalTracker] Created temporary visitor ID on mount:', newTempId);
      } else {
        console.log('✅ [GlobalTracker] Found existing temporary visitor ID:', existing);
      }
    }
  }, []); // Run once on mount
  
  // Track visitor (works for both logged-in and anonymous users)
  // Pass undefined instead of null if userId is undefined
  useVisitorTracking(userId);

  // This component doesn't render anything
  return null;
}

