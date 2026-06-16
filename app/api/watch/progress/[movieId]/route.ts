import { NextRequest, NextResponse } from 'next/server'
import { db, getUserIdFromToken } from '@/lib/db'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ movieId: string }> }) {
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '').trim()
  const userId = token ? getUserIdFromToken(token) : null
  if (!userId) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  const { movieId } = await params
  db.progress.remove(userId, Number(movieId))
  return NextResponse.json({ success: true })
}
