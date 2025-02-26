import { useState, useEffect } from 'react'

interface DashboardStats {
  totalReviews: number
  avgRating: number
  totalMessages: number
  unreadMessages: number
  ratingDistribution: {
    [key: number]: number
  }
}

interface BusinessSettings {
  name: string
  description: string | null
  address: string
  latitude: number
  longitude: number
  maxDistance: number
  categoryId: string
}

export function useBusinessDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async () => {
    try {
      const [statsResponse, settingsResponse] = await Promise.all([
        fetch('/api/business/stats'),
        fetch('/api/business/settings')
      ])

      if (!statsResponse.ok || !settingsResponse.ok) {
        throw new Error('Veriler getirilemedi')
      }

      const [statsData, settingsData] = await Promise.all([
        statsResponse.json(),
        settingsResponse.json()
      ])

      setStats(statsData)
      setSettings(settingsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: Partial<BusinessSettings>) => {
    try {
      const response = await fetch('/api/business/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      })

      if (!response.ok) {
        throw new Error('Ayarlar güncellenemedi')
      }

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
      return false
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  return {
    stats,
    settings,
    loading,
    error,
    updateSettings,
    refreshDashboard: fetchDashboard
  }
} 