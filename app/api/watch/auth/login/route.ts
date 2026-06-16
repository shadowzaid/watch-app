import { NextRequest, NextResponse } from 'next/server'
import { db, hashPassword, generateToken, saveToken } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const user = db.users.findByEmail(email)
  if (!user || user.passwordHash !== hashPassword(password))
    return NextResponse.json({ detail: 'Invalid email or password' }, { status: 401 })

  const token = generateToken(user.id)
  saveToken(token, user.id)
  const { passwordHash: _, ...safeUser } = user
  return NextResponse.json({ token, user: safeUser })
}
