/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  postCount: number;
  lazyLoadCount: number;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    postCount: 0,
    lazyLoadCount: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false); // Disabled by default

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const startTime = performance.now();
    let renderStartTime = 0;

    // Monitor performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          if (entry.name === 'render-start') {
            renderStartTime = entry.startTime;
          } else if (entry.name === 'render-end') {
            const renderTime = entry.startTime - renderStartTime;
            setMetrics(prev => ({
              ...prev,
              renderTime: Math.round(renderTime)
            }));
          }
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    // Monitor memory usage
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
        }));
      }
    };

    // Update load time
    const updateLoadTime = () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({
        ...prev,
        loadTime: Math.round(loadTime)
      }));
    };

    // Initial measurements
    updateLoadTime();
    updateMemoryUsage();

    // Update memory usage periodically
    const memoryInterval = setInterval(updateMemoryUsage, 5000);

    // Cleanup
    return () => {
      observer.disconnect();
      clearInterval(memoryInterval);
    };
  }, []);

  const startRenderMeasure = () => {
    performance.mark('render-start');
  };

  const endRenderMeasure = () => {
    performance.mark('render-end');
    performance.measure('render-duration', 'render-start', 'render-end');
  };

  const updatePostCount = useCallback((count: number) => {
    setMetrics(prev => ({
      ...prev,
      postCount: count
    }));
  }, []);

  const updateLazyLoadCount = useCallback((count: number) => {
    setMetrics(prev => ({
      ...prev,
      lazyLoadCount: count
    }));
  }, []);

  const toggleMonitoring = () => {
    setIsMonitoring(prev => !prev);
  };

  return {
    metrics,
    isMonitoring,
    startRenderMeasure,
    endRenderMeasure,
    updatePostCount,
    updateLazyLoadCount,
    toggleMonitoring
  };
};
