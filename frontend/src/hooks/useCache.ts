import { useState, useEffect, useRef, useCallback } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

export class CacheManager {
  private static cache = new Map<string, CacheEntry<unknown>>()
  
  static set<T>(key: string, data: T, ttlMs: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttlMs
    })
  }
  
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry || entry.expiry < Date.now()) {
      this.cache.delete(key)
      return null
    }
    return entry.data
  }
  
  static invalidate(key: string) {
    this.cache.delete(key)
  }
  
  static clear() {
    this.cache.clear()
  }
}

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    refreshInterval?: number
    enabled?: boolean
  } = {}
) {
  const {
    ttl = 300000, // 5 minutes
    refreshInterval,
    enabled = true
  } = options

  const [data, setData] = useState<T | null>(() => CacheManager.get<T>(key))
  const [isLoading, setIsLoading] = useState(!data && enabled)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async (useCache = true) => {
    if (!enabled) return

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Check cache first
    if (useCache) {
      const cached = CacheManager.get<T>(key)
      if (cached) {
        setData(cached)
        setIsLoading(false)
        setError(null)
        return
      }
    }

    setIsLoading(true)
    setError(null)

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const result = await fetcher()
      
      if (!abortController.signal.aborted) {
        setData(result)
        setError(null)
        CacheManager.set(key, result, ttl)
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data'
        setError(errorMessage)
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [enabled, key, fetcher, ttl])

  const refetch = () => fetchData(false)
  const invalidate = () => {
    CacheManager.invalidate(key)
    fetchData(false)
  }

  useEffect(() => {
    fetchData()

    // Set up refresh interval if specified
    let interval: number | undefined
    if (refreshInterval && refreshInterval > 0) {
      interval = setInterval(() => fetchData(false), refreshInterval)
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [key, enabled, fetchData, refreshInterval])

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidate
  }
}