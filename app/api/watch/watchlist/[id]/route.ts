import { NextRequest, NextResponse } from 'next/server'
import { db, getUserIdFromToken } from '@/lib/db'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '').trim()
  const userId = token ? getUserIdFromToken(token) : null
  if (!userId) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  db.watchlist.remove(userId, Number(id))
  return NextResponse.json({ success: true })
}
