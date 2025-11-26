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

  // 1. Load initial data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setInitialData(parsed);
          // Optimistically set query data if not already present
          if (!queryClient.getQueryData([key])) {
            queryClient.setQueryData([key], parsed);
          }
        } catch (e) {
          console.error("Failed to parse cached data for key:", key, e);
        }
      }
    }
  }, [key, queryClient]);

  // 2. Use React Query
  const queryResult = useQuery({
    queryKey: [key],
    queryFn: fetchFn,
    initialData: initialData, // Use localStorage data as initial
    staleTime: 5 * 60 * 1000, // Default 5 mins
    ...options,
  });

  // 3. Sync successful fetch to localStorage
  useEffect(() => {
    if (queryResult.isSuccess && queryResult.data) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(key, JSON.stringify(queryResult.data));
        } catch (e) {
          console.error("Failed to save data to localStorage for key:", key, e);
        }
      }
    }
  }, [queryResult.isSuccess, queryResult.data, key]);

  return queryResult;
}
