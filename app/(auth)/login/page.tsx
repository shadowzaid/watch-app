'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) router.replace('/browse')
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const err = await login(email, password)
    setLoading(false)
    if (err) setError(err)
    else router.push('/profiles')
  }

  return (
    <div className="w-full max-w-[460px] bg-black/85 backdrop-blur-sm rounded-2xl px-14 py-14 shadow-2xl">

      {/* Title */}
      <h1 className="text-[34px] font-bold text-white mb-2">Sign In</h1>
      <p className="text-gray-400 text-sm mb-8">Welcome back. Enter your details below.</p>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Email field */}
        <div className="relative">
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder=" "
            className="peer w-full px-5 pt-6 pb-2 bg-[#2a2a2a] text-white rounded-xl border border-[#3a3a3a] focus:outline-none focus:border-[#E50914] transition-colors text-base"
          />
          <label
            htmlFor="email"
            className="absolute left-5 top-2 text-[10px] font-semibold tracking-widest uppercase text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:tracking-widest peer-focus:text-[#E50914] transition-all pointer-events-none"
          >
            Email
          </label>
        </div>

        {/* Password field */}
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder=" "
            className="peer w-full px-5 pt-6 pb-2 pr-14 bg-[#2a2a2a] text-white rounded-xl border border-[#3a3a3a] focus:outline-none focus:border-[#E50914] transition-colors text-base"
          />
          <label
            htmlFor="password"
            className="absolute left-5 top-2 text-[10px] font-semibold tracking-widest uppercase text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:tracking-widest peer-focus:text-[#E50914] transition-all pointer-events-none"
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-xs font-semibold tracking-wide"
          >
            {showPassword ? 'HIDE' : 'SHOW'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-[#E50914]/10 border border-[#E50914]/30 text-[#ff6b6b] text-sm px-4 py-3 rounded-lg">
            <span className="mt-0.5 shrink-0">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#E50914] hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in…
            </span>
          ) : 'Sign In'}
        </button>
      </form>

      {/* Remember + Help */}
      <div className="mt-4 flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 select-none">
          <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-[#E50914]" />
          Remember me
        </label>
        <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">Need help?</a>
      </div>

      {/* Divider */}
      <div className="my-8 flex items-center gap-3">
        <div className="flex-1 h-px bg-[#2a2a2a]" />
        <span className="text-gray-600 text-xs">OR</span>
        <div className="flex-1 h-px bg-[#2a2a2a]" />
      </div>

      {/* Sign up link */}
      <p className="text-center text-sm text-gray-400">
        New to Watch?{' '}
        <Link href="/signup" className="text-white font-semibold hover:text-[#E50914] transition-colors">
          Create an account
        </Link>
      </p>
    </div>
  )
}
