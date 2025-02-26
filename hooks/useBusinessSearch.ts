import { useState, useEffect } from 'react'
import { useDebounce } from './useDebounce'

interface BusinessSearchParams {
  lat: number
  lng: number
  maxDistance?: number
  categoryId?: string
  query?: string
  minRating?: number
  sortBy?: 'distance' | 'rating' | 'name'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

interface Business {
  id: string
  name: string
  description: string | null
  address: string
  latitude: number
  longitude: number
  distance: number
  avgRating: number
  mainImage: string | null
  category: {
    id: string
    name: string
  }
}

interface SearchResponse {
  businesses: Business[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function useBusinessSearch(params: BusinessSearchParams) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })

  const debouncedQuery = useDebounce(params.query, 500)

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true)
        setError(null)

        const searchParams = new URLSearchParams({
          lat: params.lat.toString(),
          lng: params.lng.toString(),
          ...(params.maxDistance && { maxDistance: params.maxDistance.toString() }),
          ...(params.categoryId && { categoryId: params.categoryId }),
          ...(debouncedQuery && { query: debouncedQuery }),
          ...(params.minRating && { minRating: params.minRating.toString() }),
          ...(params.sortBy && { sortBy: params.sortBy }),
          ...(params.sortOrder && { sortOrder: params.sortOrder }),
          ...(params.page && { page: params.page.toString() }),
          ...(params.limit && { limit: params.limit.toString() })
        })

        const response = await fetch(`/api/businesses/search?${searchParams}`)
        
        if (!response.ok) {
          throw new Error('İşletmeler getirilemedi')
        }

        const data: SearchResponse = await response.json()
        setBusinesses(data.businesses)
        setPagination(data.pagination)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [
    params.lat,
    params.lng,
    params.maxDistance,
    params.categoryId,
    debouncedQuery,
    params.minRating,
    params.sortBy,
    params.sortOrder,
    params.page,
    params.limit
  ])

  return {
    businesses,
    loading,
    error,
    pagination
  }
} 