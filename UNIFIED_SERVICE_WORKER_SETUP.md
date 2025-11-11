# Unified Service Worker Setup

This document explains the unified service worker setup that combines both PWA caching and push notification functionality.

## Overview

Previously, the application used two separate service workers:
- `sw-pwa.js` - For PWA functionality (caching, offline support)
- `sw-push.js` - For push notifications

This caused conflicts because only one service worker can be active per scope. The solution is to use a **unified service worker** that combines both functionalities.

## Solution

### 1. Unified Service Worker Source (`public/worker.js`)

Created a custom service worker source file that includes:
- Push notification event handlers (`push`, `notificationclick`, `pushsubscriptionchange`)
- Workbox injection point (next-pwa will inject PWA caching logic during build)

### 2. Next.js Configuration (`next.config.ts`)

Updated the PWA configuration to use the custom source file:
```typescript
const pwaConfig = withPWA({
  // ... other config
  swSrc: 'public/worker.js', // Custom source file
  sw: 'sw.js', // Output file name
  // ... runtime caching config
});
```

### 3. Updated Registration Code

All service worker registration code now uses the unified service worker (`/sw.js`):
- `src/utils/serviceWorkerManager.ts` - Updated to register unified worker
- `src/lib/pushNotifications.ts` - Updated to use unified worker
- `src/utils/sw-registration.ts` - Updated to use unified worker
- `src/components/ServiceWorkerProvider.tsx` - Simplified to register unified worker

## How It Works

1. **Build Time**: When you run `npm run build`, next-pwa will:
   - Read `public/worker.js` (your custom source)
   - Inject Workbox code (precache manifest, routing strategies)
   - Generate the final `public/sw.js` file

2. **Runtime**: The generated `sw.js` contains:
   - Your push notification logic
   - Workbox PWA caching logic
   - All runtime caching strategies from `next.config.ts`

3. **Registration**: The app registers `/sw.js` once, and it handles both:
   - PWA features (caching, offline support)
   - Push notifications

## Migration Notes

### Old Service Workers

The old service worker files (`sw-pwa.js` and `sw-push.js`) are still in the `public` folder but are no longer used. They will be automatically unregistered when the unified worker is registered.

### Cleanup

You can optionally delete the old files after confirming everything works:
- `public/sw-pwa.js`
- `public/sw-push.js`

However, it's recommended to keep them for now as a backup.

## Testing

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Verify the generated service worker**:
   - Check that `public/sw.js` exists after build
   - The file should contain both push notification code and Workbox code

3. **Test in production mode**:
   ```bash
   npm start
   ```

4. **Verify functionality**:
   - PWA features (offline support, caching) should work
   - Push notifications should work
   - Only one service worker should be registered (check DevTools > Application > Service Workers)

## Troubleshooting

### Service Worker Not Updating

If you make changes to `public/worker.js` and they don't appear:
1. Clear browser cache and service workers
2. Rebuild the application
3. Hard refresh the page (Ctrl+Shift+R)

### Both Old and New Workers Registered

The code automatically unregisters old workers, but if you see both:
1. Open DevTools > Application > Service Workers
2. Unregister all service workers
3. Refresh the page

### Push Notifications Not Working

1. Verify the service worker is registered: `navigator.serviceWorker.getRegistration('/sw.js')`
2. Check browser console for errors
3. Verify push notification permissions are granted
4. Check that the VAPID key is correct in `public/worker.js`

## Benefits

✅ **No conflicts** - Only one service worker handles everything
✅ **Simpler code** - No need to manage two separate workers
✅ **Better performance** - Single worker is more efficient
✅ **Easier maintenance** - All service worker logic in one place

