import { useEffect, useRef } from 'react';
import { URL } from '@/api/config';

/**
 * Hook to track website visitors (for both logged-in and anonymous users)
 */
export const useVisitorTracking = (userId?: string | null) => {
  const visitorIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastActivityRef = useRef<number>(Date.now());
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now()); // Track last time we sent an update

  useEffect(() => {
    // Always run tracking, even for anonymous users
    console.log('🔍 [Tracking] Hook initialized, userId:', userId || 'undefined (anonymous)');
    
    // Generate or retrieve persistent temporary visitor ID
    // This ID is ALWAYS created on first visit and persists across browser sessions
    // It's used for tracking anonymous users
    const getTemporaryVisitorId = () => {
      const STORAGE_KEY = 'mmeko_temporary_visitor_id';
      
      try {
        // Check if we already have a temporary visitor ID in localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          visitorIdRef.current = stored;
          console.log('✅ [Tracking] Retrieved existing temporary visitor ID:', stored);
          return stored;
        }
        
        // Generate a new temporary visitor ID
        // Format: temp_<timestamp>_<random>
        const newTempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Store in localStorage (persists across sessions)
        localStorage.setItem(STORAGE_KEY, newTempId);
        visitorIdRef.current = newTempId;
        
        console.log('✅ [Tracking] Created new temporary visitor ID:', newTempId);
        return newTempId;
      } catch (error) {
        // Fallback to sessionStorage if localStorage is not available
        console.warn('⚠️ [Tracking] localStorage not available, using sessionStorage fallback');
        const sessionStored = sessionStorage.getItem('visitor_session_id');
        if (sessionStored) {
          visitorIdRef.current = sessionStored;
          return sessionStored;
        }
        
        const fallbackId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('visitor_session_id', fallbackId);
        visitorIdRef.current = fallbackId;
        return fallbackId;
      }
    };

    // Get session ID for current session (used for tracking purposes)
    const getSessionId = () => {
      const sessionStored = sessionStorage.getItem('visitor_session_id');
      if (sessionStored) {
        return sessionStored;
      }
      
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('visitor_session_id', newSessionId);
      return newSessionId;
    };

    // Always create/get temporary visitor ID (created on first visit, persists across sessions)
    const temporaryVisitorId = getTemporaryVisitorId();
    const sessionId = getSessionId();
    
    // For logged-in users, use userId as visitorId for tracking
    // For anonymous users, use temporary visitor ID from localStorage (format: temp_xxx)
    // This ensures anonymous users are tracked consistently across sessions
    const visitorId = userId || temporaryVisitorId || sessionId;
    
    // Get or set session start time (persists across page navigations in same session)
    const getSessionStartTime = (): number => {
      const STORAGE_KEY = `mmeko_session_start_${visitorId}`;
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const startTime = parseInt(stored, 10);
          if (!isNaN(startTime)) {
            startTimeRef.current = startTime;
            return startTime;
          }
        }
      } catch (error) {
        console.warn('⚠️ [Tracking] Could not access sessionStorage for session start time');
      }
      
      // Set new session start time
      const now = Date.now();
      startTimeRef.current = now;
      try {
        sessionStorage.setItem(STORAGE_KEY, now.toString());
      } catch (error) {
        // Ignore if can't store
      }
      return now;
    };
    
    // Initialize session start time
    const sessionStartTime = getSessionStartTime();
    lastUpdateTimeRef.current = sessionStartTime;
    
    // Log for debugging
    if (!userId) {
      console.log('✅ [Tracking] Using temporary visitor ID for anonymous user:', temporaryVisitorId);
    }
    console.log('🕐 [Tracking] Session start time:', new Date(sessionStartTime).toISOString());


    // Get device information
    const getDeviceInfo = () => {
      const ua = navigator.userAgent;
      let deviceType = 'desktop';
      let browser = 'Unknown';
      let os = 'Unknown';

      // Detect device type
      if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
        deviceType = 'mobile';
      } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
        deviceType = 'tablet';
      }

      // Detect browser
      if (ua.includes('Chrome') && !ua.includes('Edg')) {
        browser = 'Chrome';
      } else if (ua.includes('Firefox')) {
        browser = 'Firefox';
      } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
        browser = 'Safari';
      } else if (ua.includes('Edg')) {
        browser = 'Edge';
      } else if (ua.includes('Opera') || ua.includes('OPR')) {
        browser = 'Opera';
      }

      // Detect OS
      if (ua.includes('Windows')) {
        os = 'Windows';
      } else if (ua.includes('Mac')) {
        os = 'macOS';
      } else if (ua.includes('Linux')) {
        os = 'Linux';
      } else if (ua.includes('Android')) {
        os = 'Android';
      } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
        os = 'iOS';
      }

      return {
        type: deviceType,
        browser,
        os,
        userAgent: ua,
      };
    };

    // Track initial visit
    const trackVisit = async () => {
      try {
        const device = getDeviceInfo();

        const payload = {
          visitorId: visitorId, // Use userId for logged-in users, persistent anonymous ID for anonymous
          userid: userId || null,
          sessionId: userId ? null : sessionId, // Session ID for current session
          device,
          visitTime: new Date().toISOString(),
        };
        
        // Use the same URL helper as the rest of the codebase
        // Fallback to localhost if URL is empty (development)
        const API_URL = URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3100' : '');
        
        if (!API_URL) {
          console.error('❌ [Frontend] API URL is not configured. Cannot track visitor.');
          return;
        }
        
        const trackUrl = `${API_URL}/api/track-visitor`;
        
        console.log('📤 [Frontend] Sending tracking request:', {
          url: trackUrl,
          API_URL,
          visitorId: payload.visitorId,
          userid: payload.userid || 'null',
          sessionId: payload.sessionId || 'null',
          isAnonymous: !userId,
        });

        const response = await fetch(trackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ [Frontend] Tracking request failed:', response.status, errorData);
          throw new Error(`HTTP ${response.status}: ${errorData.message || 'Unknown error'}`);
        }

        const result = await response.json();
        console.log('✅ [Frontend] Tracking response:', result);
      } catch (error) {
        console.error('❌ [Frontend] Error tracking visitor:', error);
      }
    };

    // Track time spent periodically (send incremental time since last update)
    const trackTimeSpent = async () => {
      try {
        const now = Date.now();
        // Calculate time since last update (not since last activity)
        const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
        
        // Only send if at least 5 seconds have passed (to avoid too many requests)
        if (timeSinceLastUpdate >= 5000) {
          const API_URL = URL;
          if (!API_URL) {
            console.error('❌ [Frontend] API URL is not configured. Cannot update visitor time.');
            return;
          }
          
          console.log(`⏱️ [Tracking] Updating visitor time: ${Math.round(timeSinceLastUpdate / 1000)}s (${Math.round(timeSinceLastUpdate / 1000 / 60)} minutes)`);
          
          const response = await fetch(`${API_URL}/api/update-visitor-time`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              visitorId: visitorId, // Use userId for logged-in users, persistent anonymous ID for anonymous
              timeSpent: timeSinceLastUpdate, // Send incremental time
            }),
          });
          
          if (response.ok) {
            // Update last update time only if request was successful
            lastUpdateTimeRef.current = now;
            console.log(`✅ [Tracking] Visitor time updated successfully`);
          } else {
            console.error('❌ [Tracking] Failed to update visitor time:', response.status);
          }
        }
      } catch (error) {
        console.error('❌ [Tracking] Error updating visitor time:', error);
      }
    };

    // Track page view immediately when component mounts
    // This ensures visitors are tracked even if they don't connect via socket
    trackVisit()
      .then(() => {
        console.log('✅ [Frontend] Visitor tracked successfully:', visitorId, userId ? '(logged in)' : '(anonymous)');
      })
      .catch(err => {
        console.error('❌ [Frontend] Error tracking initial visit:', err);
      });

    // Update activity on user interaction
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Set up activity tracking
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Track time spent every 30 seconds (send incremental updates)
    trackingIntervalRef.current = setInterval(trackTimeSpent, 30000);

    // Track time spent on page unload
    const handleBeforeUnload = () => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
      
      // Only send if there's time to report (at least 1 second)
      if (timeSinceLastUpdate >= 1000) {
        // Use sendBeacon for reliable tracking on page unload
        const API_URL = URL;
        if (API_URL) {
          const data = JSON.stringify({
            visitorId: visitorId, // Use userId for logged-in users, persistent anonymous ID for anonymous
            timeSpent: timeSinceLastUpdate, // Send incremental time since last update
          });
          navigator.sendBeacon(
            `${API_URL}/api/update-visitor-time`,
            new Blob([data], { type: 'application/json' })
          );
          console.log(`📤 [Tracking] Sent final time update on unload: ${Math.round(timeSinceLastUpdate / 1000)}s`);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
      
      // Track final time spent on cleanup
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
      
      // Only send if there's time to report (at least 1 second)
      if (timeSinceLastUpdate >= 1000) {
        const API_URL = URL;
        if (API_URL) {
          const data = JSON.stringify({
            visitorId: visitorId, // Use userId for logged-in users, persistent anonymous ID for anonymous
            timeSpent: timeSinceLastUpdate, // Send incremental time since last update
          });
          navigator.sendBeacon(
            `${API_URL}/api/update-visitor-time`,
            new Blob([data], { type: 'application/json' })
          );
          console.log(`📤 [Tracking] Sent final time update on cleanup: ${Math.round(timeSinceLastUpdate / 1000)}s`);
        }
      }
    };
  }, [userId]);
};

