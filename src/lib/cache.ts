'use client';

// Simple in-memory cache with TTL support
class Cache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = 300000): void { // Default 5 minutes TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// API response cache with request deduplication
class APICache {
  private cache = new Cache();
  private pendingRequests = new Map<string, Promise<any>>();

  async get<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number = 300000
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    // Make new request
    const promise = fetcher().then(data => {
      this.cache.set(key, data, ttl);
      this.pendingRequests.delete(key);
      return data;
    }).catch(error => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

// React hook for caching
export const useCache = () => {
  const cache = new Cache();

  return {
    get: cache.get.bind(cache),
    set: cache.set.bind(cache),
    delete: cache.delete.bind(cache),
    clear: cache.clear.bind(cache),
    cleanup: cache.cleanup.bind(cache),
    getStats: cache.getStats.bind(cache)
  };
};

// Global API cache instance
export const apiCache = new APICache();

// Cache key generators
export const cacheKeys = {
  dashboard: () => 'dashboard_overview',
  projects: (params?: any) => `projects_${JSON.stringify(params || {})}`,
  project: (id: string) => `project_${id}`,
  finances: (params?: any) => `finances_${JSON.stringify(params || {})}`,
  budget: (id: string) => `budget_${id}`,
  resources: (params?: any) => `resources_${JSON.stringify(params || {})}`,
  revenue: (params?: any) => `revenue_${JSON.stringify(params || {})}`,
  risks: (params?: any) => `risks_${JSON.stringify(params || {})}`,
  analytics: (params?: any) => `analytics_${JSON.stringify(params || {})}`,
  user: (id: string) => `user_${id}`,
  notifications: () => 'notifications'
};

// Cache invalidation helpers
export const invalidateCache = {
  dashboard: () => apiCache.invalidate(cacheKeys.dashboard()),
  projects: () => apiCache.invalidate(cacheKeys.projects()),
  project: (id: string) => apiCache.invalidate(cacheKeys.project(id)),
  finances: () => apiCache.invalidate(cacheKeys.finances()),
  budget: (id: string) => apiCache.invalidate(cacheKeys.budget(id)),
  resources: () => apiCache.invalidate(cacheKeys.resources()),
  revenue: () => apiCache.invalidate(cacheKeys.revenue()),
  risks: () => apiCache.invalidate(cacheKeys.risks()),
  analytics: () => apiCache.invalidate(cacheKeys.analytics()),
  user: (id: string) => apiCache.invalidate(cacheKeys.user(id)),
  notifications: () => apiCache.invalidate(cacheKeys.notifications()),
  all: () => apiCache.clear()
};

// Performance monitoring
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();

  startTimer(key: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(key)) {
        this.metrics.set(key, []);
      }
      
      this.metrics.get(key)!.push(duration);
      
      // Keep only last 100 measurements
      const measurements = this.metrics.get(key)!;
      if (measurements.length > 100) {
        measurements.shift();
      }
    };
  }

  getAverageTime(key: string): number {
    const measurements = this.metrics.get(key) || [];
    if (measurements.length === 0) return 0;
    
    const sum = measurements.reduce((acc, time) => acc + time, 0);
    return sum / measurements.length;
  }

  getMetrics(): Record<string, { avg: number; count: number }> {
    const result: Record<string, { avg: number; count: number }> = {};
    
    for (const [key, measurements] of this.metrics.entries()) {
      const sum = measurements.reduce((acc, time) => acc + time, 0);
      result[key] = {
        avg: sum / measurements.length,
        count: measurements.length
      };
    }
    
    return result;
  }

  clear(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Lazy loading utility
export const lazyLoad = <T>(
  loader: () => Promise<T>,
  cacheKey?: string
): Promise<T> => {
  if (cacheKey) {
    return apiCache.get(cacheKey, loader);
  }
  
  return loader();
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memory usage monitoring (in development only)
export const getMemoryUsage = (): number => {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
};

// Image lazy loading helper
export const lazyLoadImage = (src: string, callback?: () => void): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      callback?.();
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
};

// Virtual scrolling helper for large lists
export const virtualScroll = {
  getVisibleItems: <T>(
    items: T[],
    scrollTop: number,
    containerHeight: number,
    itemHeight: number
  ): { items: T[]; startIndex: number; endIndex: number } => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length - 1
    );
    
    return {
      items: items.slice(startIndex, endIndex + 1),
      startIndex,
      endIndex
    };
  },
  
  getTotalHeight: (items: any[], itemHeight: number): number => {
    return items.length * itemHeight;
  }
};
