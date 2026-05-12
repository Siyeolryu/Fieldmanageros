import React, { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import type { Site } from '@prisma/client'

const SiteSelector: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const { selectedSite, setSelectedSite } = useAppStore()

  const fetchSites = useCallback(async () => {
    try {
      const response = await fetch('/api/sites')
      if (!response.ok) throw new Error('Failed to fetch sites')
      const data = await response.json()
      setSites(data)

      // 초기 사이트 설정 (이미 선택된 게 없으면 첫 번째 사이트로)
      if (!selectedSite && data.length > 0) {
        setSelectedSite(data[0])
      }
    } catch (error) {
      console.error('Error fetching sites:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedSite, setSelectedSite])

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  if (loading) {
    return (
      <div className="h-11 w-48 bg-gray-100 animate-pulse rounded-xl" />
    )
  }

  return (
    <div className="relative inline-block w-full max-w-xs">
      <select
        value={selectedSite?.id || ''}
        onChange={(e) => {
          const site = sites.find(s => s.id === e.target.value)
          if (site) setSelectedSite(site)
        }}
        className="block w-full h-11 pl-4 pr-10 py-2 text-base font-semibold border-2 border-transparent bg-white shadow-sm ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl appearance-none transition-all cursor-pointer hover:bg-gray-50"
      >
        <option value="" disabled>현장 선택</option>
        {sites.map((site) => (
          <option key={site.id} value={site.id}>
            🏢 {site.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

export default SiteSelector
