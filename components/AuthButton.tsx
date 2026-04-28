'use client'

import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface User {
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

export default function AuthButton({ user }: { user: User | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm text-slate-300">
        <p className="font-medium">{user.email}</p>
        {user.user_metadata?.full_name && (
          <p className="text-xs text-slate-400">{user.user_metadata.full_name}</p>
        )}
      </div>
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '로그아웃 중...' : '로그아웃'}
      </button>
    </div>
  )
}
