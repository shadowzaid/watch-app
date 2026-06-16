import { NextRequest, NextResponse } from 'next/server'
import { db, getUserIdFromToken } from '@/lib/db'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ', '').trim()
  const userId = token ? getUserIdFromToken(token) : null
  if (!userId) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  const user = db.users.findById(userId)
  if (!user) return NextResponse.json({ detail: 'User not found' }, { status: 404 })
  const { passwordHash: _, ...safeUser } = user
  return NextResponse.json(safeUser)
}
