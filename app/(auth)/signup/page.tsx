'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signup, user } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) router.replace('/browse')
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const err = await signup(name, email, password)
    setLoading(false)
    if (err) {
      setError(err)
    } else {
      router.push('/profiles')
    }
  }

  return (
    <div className="w-full max-w-md bg-black/75 rounded-md px-10 py-12">
      <h1 className="text-3xl font-black mb-2">Create your account</h1>
      <p className="text-gray-300 mb-8">Just a few more steps and you're done!</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Full name"
          required
          className="w-full px-4 py-4 bg-[#333] text-white rounded placeholder:text-gray-400 focus:outline-none focus:bg-[#444] transition-colors"
        />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email address"
          required
          className="w-full px-4 py-4 bg-[#333] text-white rounded placeholder:text-gray-400 focus:outline-none focus:bg-[#444] transition-colors"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password (min. 6 characters)"
          required
          className="w-full px-4 py-4 bg-[#333] text-white rounded placeholder:text-gray-400 focus:outline-none focus:bg-[#444] transition-colors"
        />

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
          {loading ? 'Creating account…' : 'Start Watching'}
        </button>
      </form>

      <div className="mt-8 text-gray-400 text-base">
        Already have an account?{' '}
        <Link href="/login" className="text-white hover:underline font-medium">
          Sign in.
        </Link>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
