// src/utils/performanceUtils.js

/**
 * Performance optimization utilities for production dashboard
 */

// Advanced caching system
class AdvancedCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100; // Maximum number of cached items
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
    
    // Start cleanup interval
    this.startCleanup();
  }

  set(key, data, ttl = this.defaultTTL) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      lastAccessed: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    item.hits++;
    item.lastAccessed = Date.now();
    
    return item.data;
  }

  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check expiration
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      totalHits: entries.reduce((sum, item) => sum + item.hits, 0),
      averageAge: entries.length > 0 
        ? entries.reduce((sum, item) => sum + (Date.now() - item.timestamp), 0) / entries.length 
        : 0,
      hitRate: entries.length > 0 
        ? entries.reduce((sum, item) => sum + item.hits, 0) / entries.length 
        : 0
    };
  }

  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  startCleanup() {
    // Run cleanup every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 2 * 60 * 1000);
  }

  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Request deduplication to prevent multiple identical requests
class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
  }

  async dedupe(key, requestFn) {
    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Create new request
    const promise = requestFn()
      .finally(() => {
        // Remove from pending requests when complete
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  cancel(key) {
    this.pendingRequests.delete(key);
  }

  clear() {
    this.pendingRequests.clear();
  }
}

// Rate limiter for API requests
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  canMakeRequest(key = 'default') {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const keyRequests = this.requests.get(key);
    
    // Remove old requests outside window
    const validRequests = keyRequests.filter(time => time > windowStart);
    this.requests.set(key, validRequests);
    
    return validRequests.length < this.maxRequests;
  }

  recordRequest(key = 'default') {
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    this.requests.get(key).push(Date.now());
  }

  getRemainingRequests(key = 'default') {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      return this.maxRequests;
    }
    
    const keyRequests = this.requests.get(key);
    const validRequests = keyRequests.filter(time => time > windowStart);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// Retry mechanism for failed requests
class RetryManager {
  constructor(maxRetries = 3, baseDelay = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
  }

  async executeWithRetry(operation, retryConfig = {}) {
    const {
      maxRetries = this.maxRetries,
      baseDelay = this.baseDelay,
      backoffMultiplier = 2,
      shouldRetry = (error) => error.name === 'NetworkError' || error.status >= 500
    } = retryConfig;

    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry if this is the last attempt or if we shouldn't retry this error
        if (attempt === maxRetries || !shouldRetry(error)) {
          break;
        }

        // Wait with exponential backoff
        const delay = baseDelay * Math.pow(backoffMultiplier, attempt);
        await this.sleep(delay + (Math.random() * 1000)); // Add jitter
      }
    }
    
    throw lastError;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Data compression utilities
class DataCompressor {
  static compress(data) {
    try {
      // Simple compression using JSON and string manipulation
      const jsonString = JSON.stringify(data);
      
      // Basic compression by removing unnecessary whitespace and replacing common patterns
      const compressed = jsonString
        .replace(/\s+/g, '') // Remove whitespace
        .replace(/"([^"]+)":/g, '$1:') // Remove quotes from keys where possible
        .replace(/,"/g, ',"') // Normalize quotes
        .replace(/":"/g, ':"'); // Normalize quotes
        
      return {
        data: compressed,
        originalSize: jsonString.length,
        compressedSize: compressed.length,
        ratio: (1 - compressed.length / jsonString.length) * 100
      };
    } catch (error) {
      console.error('Compression error:', error);
      return { data: JSON.stringify(data), originalSize: 0, compressedSize: 0, ratio: 0 };
    }
  }

  static decompress(compressedData) {
    try {
      return JSON.parse(compressedData);
    } catch (error) {
      console.error('Decompression error:', error);
      return null;
    }
  }
}

// Memory usage monitor
class MemoryMonitor {
  constructor() {
    this.measurements = [];
    this.maxMeasurements = 100;
  }

  measure() {
    if (performance && performance.memory) {
      const memory = performance.memory;
      const measurement = {
        timestamp: Date.now(),
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };

      this.measurements.push(measurement);
      
      // Keep only recent measurements
      if (this.measurements.length > this.maxMeasurements) {
        this.measurements.shift();
      }

      return measurement;
    }
    return null;
  }

  getStats() {
    if (this.measurements.length === 0) {
      return null;
    }

    const latest = this.measurements[this.measurements.length - 1];
    const earliest = this.measurements[0];
    
    return {
      current: latest,
      trend: {
        usedMemoryChange: latest.usedJSHeapSize - earliest.usedJSHeapSize,
        timespan: latest.timestamp - earliest.timestamp
      },
      average: {
        usedJSHeapSize: this.measurements.reduce((sum, m) => sum + m.usedJSHeapSize, 0) / this.measurements.length,
        totalJSHeapSize: this.measurements.reduce((sum, m) => sum + m.totalJSHeapSize, 0) / this.measurements.length
      }
    };
  }

  isMemoryPressureHigh() {
    const latest = this.measurements[this.measurements.length - 1];
    if (!latest) return false;

    // Consider memory pressure high if using more than 80% of available heap
    return (latest.usedJSHeapSize / latest.jsHeapSizeLimit) > 0.8;
  }
}

// Performance metrics collector
class PerformanceMetrics {
  constructor() {
    this.metrics = new Map();
    this.startTime = performance.now();
  }

  startTimer(name) {
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  endTimer(name) {
    const metric = this.metrics.get(name);
    if (metric && !metric.endTime) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
    }
    return metric?.duration || 0;
  }

  recordCustomMetric(name, value, unit = 'ms') {
    this.metrics.set(name, {
      value,
      unit,
      timestamp: performance.now()
    });
  }

  getMetric(name) {
    return this.metrics.get(name);
  }

  getAllMetrics() {
    const result = {};
    for (const [key, value] of this.metrics.entries()) {
      result[key] = value;
    }
    return result;
  }

  getUptime() {
    return performance.now() - this.startTime;
  }

  // Get browser performance information
  getBrowserPerformance() {
    if (!performance.getEntriesByType) {
      return null;
    }

    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    return {
      navigation: navigation ? {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        pageLoad: navigation.loadEventEnd - navigation.fetchStart
      } : null,
      paint: paint.reduce((acc, entry) => {
        acc[entry.name.replace('-', '')] = entry.startTime;
        return acc;
      }, {}),
      memory: this.getMemoryInfo()
    };
  }

  getMemoryInfo() {
    if (performance.memory) {
      return {
        usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
        totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
        jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) // MB
      };
    }
    return null;
  }
}

// Create singleton instances
export const advancedCache = new AdvancedCache();
export const requestDeduplicator = new RequestDeduplicator();
export const rateLimiter = new RateLimiter();
export const retryManager = new RetryManager();
export const memoryMonitor = new MemoryMonitor();
export const performanceMetrics = new PerformanceMetrics();

// Utility functions
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const measureAsyncPerformance = async (name, asyncFunction) => {
  performanceMetrics.startTimer(name);
  try {
    const result = await asyncFunction();
    performanceMetrics.endTimer(name);
    return result;
  } catch (error) {
    performanceMetrics.endTimer(name);
    throw error;
  }
};

// Error boundary helper - removed to avoid React import issues
// Use React.ErrorBoundary directly in components instead

// Cleanup function for when the app unmounts
export const cleanup = () => {
  advancedCache.stopCleanup();
  advancedCache.clear();
  requestDeduplicator.clear();
  rateLimiter = new RateLimiter();
  performanceMetrics = new PerformanceMetrics();
};

export default {
  advancedCache,
  requestDeduplicator,
  rateLimiter,
  retryManager,
  memoryMonitor,
  performanceMetrics,
  DataCompressor,
  debounce,
  throttle,
  formatBytes,
  measureAsyncPerformance,
  cleanup
};
