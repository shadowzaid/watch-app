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
    if (err) {
      setError(err)
    } else {
      router.push('/profiles')
    }
  }

  return (
    <div className="w-full max-w-md bg-black/75 rounded-md px-10 py-12">
      <h1 className="text-3xl font-black mb-8">Sign In</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email or phone number"
            required
            className="w-full px-4 py-4 bg-[#333] text-white rounded placeholder:text-gray-400 focus:outline-none focus:bg-[#444] transition-colors"
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-4 bg-[#333] text-white rounded placeholder:text-gray-400 focus:outline-none focus:bg-[#444] transition-colors"
          />
        </div>

        {error && (
          <div className="bg-[#e87c03] text-white text-sm px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#E50914] hover:bg-red-700 text-white font-bold rounded text-base transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="accent-gray-400" defaultChecked />
          Remember me
        </label>
        <a href="#" className="hover:underline">Need help?</a>
      </div>

      <div className="mt-8 text-gray-400 text-base">
        New to Watch?{' '}
        <Link href="/signup" className="text-white hover:underline font-medium">
          Sign up now.
        </Link>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        This page is protected by Google reCAPTCHA to ensure you're not a bot.
      </p>
    </div>
  )
}
