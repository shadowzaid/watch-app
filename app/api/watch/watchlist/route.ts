import { NextRequest, NextResponse } from 'next/server'
import { db, getUserIdFromToken } from '@/lib/db'

function getUser(req: NextRequest) {
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '').trim()
  return token ? getUserIdFromToken(token) : null
}

export async function GET(req: NextRequest) {
  const userId = getUser(req)
  if (!userId) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(db.watchlist.getByUser(userId))
}

export async function POST(req: NextRequest) {
  const userId = getUser(req)
  if (!userId) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  const movie = await req.json()
  db.watchlist.add(userId, movie)
  return NextResponse.json({ success: true })
}
