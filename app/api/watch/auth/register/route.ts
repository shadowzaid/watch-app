import { NextRequest, NextResponse } from 'next/server'
import { db, hashPassword, generateToken, saveToken } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()
  if (!name || !email || !password) return NextResponse.json({ detail: 'All fields required' }, { status: 400 })
  if (db.users.findByEmail(email)) return NextResponse.json({ detail: 'Email already registered' }, { status: 409 })
  if (password.length < 6) return NextResponse.json({ detail: 'Password must be at least 6 characters' }, { status: 400 })

  const user = db.users.create({
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash: hashPassword(password),
    avatar: Math.floor(Math.random() * 8),
    created_at: new Date().toISOString(),
  })

  const token = generateToken(user.id)
  saveToken(token, user.id)
  const { passwordHash: _, ...safeUser } = user
  return NextResponse.json({ token, user: safeUser }, { status: 201 })
}
