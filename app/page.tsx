'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function RootPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (user) router.replace('/browse')
    else router.replace('/login')
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center">
      <div className="text-[#E50914] text-5xl font-black tracking-wider animate-pulse">WATCH</div>
    </div>
  )
}
