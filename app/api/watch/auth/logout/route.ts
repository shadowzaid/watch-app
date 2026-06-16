import { NextRequest, NextResponse } from 'next/server'
import { deleteToken } from '@/lib/db'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ', '').trim()
  if (token) deleteToken(token)
  return NextResponse.json({ success: true })
}
