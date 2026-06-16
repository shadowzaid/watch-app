'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Pencil } from 'lucide-react'

const AVATAR_COLORS = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
  'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500',
]

const EXTRA_PROFILES = [
  { name: 'Kids', avatar: 2, color: 'bg-green-400' },
]

export default function ProfilesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login')
  }, [user, isLoading, router])

  if (isLoading || !user) return null

  const avatarColor = AVATAR_COLORS[user.avatar % AVATAR_COLORS.length]
  const allProfiles = [
    { name: user.name, avatar: user.avatar, color: avatarColor, isMain: true },
    ...EXTRA_PROFILES.map(p => ({ ...p, isMain: false })),
  ]

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl md:text-5xl font-light mb-10">Who's watching?</h1>

      <div className="flex flex-wrap justify-center gap-6 mb-12">
        {allProfiles.map((profile, i) => (
          <button
            key={i}
            onClick={() => router.push('/browse')}
            className="group flex flex-col items-center gap-3"
          >
            <div
              className={`w-28 h-28 md:w-32 md:h-32 rounded-md ${profile.color} flex items-center justify-center text-5xl font-black group-hover:ring-4 group-hover:ring-white transition-all`}
            >
              {profile.name[0].toUpperCase()}
            </div>
            <span className="text-gray-400 group-hover:text-white transition-colors text-sm font-medium">
              {profile.name}
            </span>
          </button>
        ))}

        {/* Add profile */}
        <button className="group flex flex-col items-center gap-3">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-md border-2 border-gray-600 flex items-center justify-center group-hover:border-white transition-all">
            <span className="text-gray-600 group-hover:text-white text-5xl font-light transition-colors">+</span>
          </div>
          <span className="text-gray-400 group-hover:text-white transition-colors text-sm font-medium">
            Add Profile
          </span>
        </button>
      </div>

      <button className="flex items-center gap-2 border-2 border-gray-500 text-gray-400 hover:border-white hover:text-white transition-all px-8 py-2 text-sm font-medium uppercase tracking-widest">
        <Pencil size={14} />
        Manage Profiles
      </button>
    </div>
  )
}
