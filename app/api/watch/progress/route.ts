import { NextRequest, NextResponse } from 'next/server'
import { db, getUserIdFromToken } from '@/lib/db'

function getUser(req: NextRequest) {
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '').trim()
  return token ? getUserIdFromToken(token) : null
}

export async function GET(req: NextRequest) {
  const userId = getUser(req)
  if (!userId) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  const items = db.progress.getByUser(userId).map(({ userId: _, ...rest }) => rest)
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const userId = getUser(req)
  if (!userId) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  db.progress.save({ userId, ...body })
  return NextResponse.json({ success: true })
}
