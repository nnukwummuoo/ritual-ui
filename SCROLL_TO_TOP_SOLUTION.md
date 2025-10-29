# Scroll to Top Solution for Next.js App Router

## 🎯 Problem Solved
When users scroll to the bottom of a page and then navigate to another page, the new page starts from the bottom instead of the top.

## ✅ Solution Implemented

### 1. **Basic ScrollToTop Component** (`src/components/ScrollToTop.tsx`)
- Simple solution using `usePathname` hook
- Scrolls to top on every route change
- Works with Next.js App Router

### 2. **Enhanced ScrollToTop Component** (`src/components/ScrollToTopEnhanced.tsx`)
- More configuration options
- Smooth scrolling support
- Delay support for page transitions
- Route preservation options

### 3. **Advanced ScrollToTop Component** (`src/components/ScrollToTopAdvanced.tsx`)
- Full-featured solution with all options
- Debug logging
- Browser back/forward support
- Custom scroll positions
- Performance optimizations

### 4. **Custom Hook** (`src/hooks/useScrollToTop.ts`)
- Reusable hook for custom implementations
- Programmatic scroll control
- Flexible configuration

## 🚀 Current Implementation

### In `src/app/layout.tsx`:
```tsx
<ScrollToTopAdvanced
  smooth={true}
  delay={100}
  preserveScrollRoutes={[
    "/message",
    "/settings", 
    "/profile"
  ]}
  scrollOnSearchChange={false}
  scrollOnPopState={true}
  debug={process.env.NODE_ENV === "development"}
/>
```

## 📋 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `smooth` | boolean | `true` | Use smooth scrolling animation |
| `delay` | number | `0` | Delay before scrolling (ms) |
| `preserveScrollRoutes` | string[] | `[]` | Routes that should NOT scroll to top |
| `scrollOnSearchChange` | boolean | `false` | Scroll on URL search params change |
| `scrollOnPopState` | boolean | `true` | Scroll on browser back/forward |
| `scrollPosition` | `{x: number, y: number}` | `{x: 0, y: 0}` | Custom scroll position |
| `debug` | boolean | `false` | Enable debug logging |

## 🎛️ Usage Examples

### Basic Usage:
```tsx
import ScrollToTop from "@/components/ScrollToTop";

// Simple scroll to top on route change
<ScrollToTop />
```

### Advanced Usage:
```tsx
import ScrollToTopAdvanced from "@/components/ScrollToTopAdvanced";

<ScrollToTopAdvanced
  smooth={true}
  delay={200}
  preserveScrollRoutes={["/chat", "/settings"]}
  scrollOnSearchChange={true}
  debug={true}
/>
```

### Custom Hook Usage:
```tsx
import { useScrollToTop } from "@/hooks/useScrollToTop";

const MyComponent = () => {
  const { scrollToTop, scrollToPosition } = useScrollToTop({
    smooth: true,
    preserveScrollRoutes: ["/dashboard"]
  });

  const handleButtonClick = () => {
    scrollToTop(); // Manual scroll to top
    // or
    scrollToPosition(0, 100); // Scroll to specific position
  };

  return <button onClick={handleButtonClick}>Scroll to Top</button>;
};
```

## 🔧 Customization

### Preserve Scroll for Specific Routes:
```tsx
preserveScrollRoutes={[
  "/message",     // Don't scroll in message threads
  "/settings",    // Don't scroll in settings tabs
  "/profile",     // Don't scroll in profile sections
  "/admin"        // Don't scroll in admin panels
]}
```

### Different Scroll Behaviors:
```tsx
// Instant scroll (no animation)
<ScrollToTopAdvanced smooth={false} />

// Delayed scroll (for page transitions)
<ScrollToTopAdvanced delay={300} />

// Custom scroll position
<ScrollToTopAdvanced scrollPosition={{ x: 0, y: 100 }} />
```

## 🐛 Debugging

Enable debug mode to see scroll events in console:
```tsx
<ScrollToTopAdvanced debug={true} />
```

Debug output example:
```
[ScrollToTop] Executing scroll due to: pathname change
[ScrollToTop] Scrolling to position: {x: 0, y: 0}
[ScrollToTop] Skipping scroll for preserved route: /message
```

## ⚡ Performance Notes

- Uses `useRef` to prevent unnecessary re-renders
- Clears timeouts on unmount to prevent memory leaks
- Only scrolls when pathname actually changes
- Minimal impact on bundle size

## 🔄 Migration from Pages Router

If migrating from Pages Router, replace:
```tsx
// Old (Pages Router)
import { useRouter } from "next/router";
router.events.on("routeChangeComplete", handleRouteChange);

// New (App Router)
import { usePathname } from "next/navigation";
useEffect(() => {
  // Scroll logic here
}, [pathname]);
```

## ✅ Benefits

1. **Better UX**: Users always start at the top of new pages
2. **Configurable**: Preserve scroll for specific routes when needed
3. **Performance**: Optimized for Next.js App Router
4. **Flexible**: Multiple implementation options
5. **Debug-friendly**: Easy to troubleshoot issues

## 🎯 Result

Now when users navigate between pages:
- ✅ New pages start at the top
- ✅ Smooth scrolling animation
- ✅ Preserved scroll position for specific routes
- ✅ Works with browser back/forward buttons
- ✅ No more "stuck at bottom" issue
