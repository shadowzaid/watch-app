'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Bell, ChevronDown, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const AVATAR_COLORS = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
  'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500',
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const avatarColor = user ? AVATAR_COLORS[user.avatar % AVATAR_COLORS.length] : 'bg-red-500'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 py-4 transition-all duration-500 ${
        scrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-8">
        <Link href="/browse">
          <span className="text-[#E50914] font-black text-2xl md:text-3xl tracking-tight select-none">
            WATCH
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-4 text-sm text-gray-300">
          <Link href="/browse" className="hover:text-white transition-colors">Home</Link>
          <Link href="/browse?genre=tv" className="hover:text-white transition-colors">TV Shows</Link>
          <Link href="/browse?genre=movies" className="hover:text-white transition-colors">Movies</Link>
          <Link href="/browse?genre=new" className="hover:text-white transition-colors">New &amp; Popular</Link>
          <Link href="/search?q=&list=watchlist" className="hover:text-white transition-colors">My List</Link>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex items-center">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2 border border-white/50 bg-black/80 px-3 py-1">
              <Search size={16} className="text-white" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Titles, people, genres"
                className="bg-transparent text-white text-sm outline-none w-40 md:w-56 placeholder:text-gray-400"
              />
              <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery('') }}>
                <X size={16} className="text-white/70 hover:text-white" />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="text-white hover:text-gray-300 transition-colors">
              <Search size={20} />
            </button>
          )}
        </div>

        {/* Notifications */}
        <button className="text-white hover:text-gray-300 transition-colors hidden md:block">
          <Bell size={20} />
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(p => !p)}
            className="flex items-center gap-1 group"
          >
            <div className={`w-8 h-8 rounded ${avatarColor} flex items-center justify-center text-white text-sm font-bold`}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <ChevronDown
              size={14}
              className={`text-white transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-10 w-48 bg-[#141414] border border-white/10 py-2 shadow-xl">
              <div className="px-4 py-2 border-b border-white/10">
                <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                <p className="text-gray-400 text-xs truncate">{user?.email}</p>
              </div>
              <Link
                href="/profiles"
                className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                Switch Profiles
              </Link>
              <Link
                href="/search?q=&list=watchlist"
                className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                My List
              </Link>
              <hr className="border-white/10 my-1" />
              <button
                onClick={() => { setProfileOpen(false); logout() }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                Sign out of Watch
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
