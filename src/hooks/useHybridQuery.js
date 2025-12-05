import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/**
 * Custom hook for Hybrid Caching (React Query + LocalStorage)
 * @param {string} key - Unique key for the query and localStorage
 * @param {Function} fetchFn - Function to fetch data from API
 * @param {Object} options - React Query options
 */
export function useHybridQuery(key, fetchFn, options = {}) {
  const queryClient = useQueryClient();
  const [initialData, setInitialData] = useState(undefined);

  // Determine keys for Storage and React Query
  const storageKey = Array.isArray(key) ? JSON.stringify(key) : key;
  const queryKey = Array.isArray(key) ? key : [key];

  // 1. Load initial data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setInitialData(parsed);
          // Optimistically set query data if not already present
          if (!queryClient.getQueryData(queryKey)) {
            queryClient.setQueryData(queryKey, parsed);
          }
        } catch (e) {
          console.error("Failed to parse cached data for key:", storageKey, e);
        }
      }
    }
  }, [storageKey, queryClient]); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Use React Query
  const queryResult = useQuery({
    queryKey: queryKey,
    queryFn: fetchFn,
    initialData: initialData, // Use localStorage data as initial
    staleTime: 3 * 60 * 1000, // Default 5 mins
    ...options,
  });

  // 3. Sync successful fetch to localStorage
  useEffect(() => {
    if (queryResult.isSuccess && queryResult.data) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(queryResult.data));
        } catch (e) {
          console.error("Failed to save data to localStorage for key:", storageKey, e);
        }
      }
    }
  }, [queryResult.isSuccess, queryResult.data, storageKey]);

  return queryResult;
}
