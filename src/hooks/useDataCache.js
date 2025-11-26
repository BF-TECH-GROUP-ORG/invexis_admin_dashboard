import { useState, useEffect, useCallback } from 'react';

const CACHE_PREFIX = 'invexis_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const useDataCache = (key, fetcher, dependencies = [], options = {}) => {
  const { ttl = DEFAULT_TTL, enabled = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cacheKey = `${CACHE_PREFIX}${key}`;

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      // Check cache first
      if (!force) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          const isValid = Date.now() - timestamp < ttl;
          
          if (isValid) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }
      }

      // Fetch fresh data
      const result = await fetcher();
      
      // Update state
      setData(result);
      
      // Update cache
      localStorage.setItem(cacheKey, JSON.stringify({
        data: result,
        timestamp: Date.now()
      }));

    } catch (err) {
      console.error(`Error fetching data for ${key}:`, err);
      setError(err);
      
      // Fallback to stale cache if available
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data: cachedData } = JSON.parse(cached);
        setData(cachedData);
      }
    } finally {
      setLoading(false);
    }
  }, [cacheKey, enabled, ttl, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const invalidate = useCallback(() => {
    localStorage.removeItem(cacheKey);
    fetchData(true);
  }, [cacheKey, fetchData]);

  const updateLocal = useCallback((newData) => {
    setData(newData);
    localStorage.setItem(cacheKey, JSON.stringify({
      data: newData,
      timestamp: Date.now()
    }));
  }, [cacheKey]);

  return { data, loading, error, refetch: () => fetchData(true), invalidate, updateLocal };
};
