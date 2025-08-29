import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  let client
  try {
    client = await pool.connect()
    const { userId: blockedUserId } = await context.params
    const { user_id: blockerId } = await req.json()

    // Simple insert - duplicate blocks are ignored
    await client.query(
      'INSERT INTO blocked_users (blocker_id, blocked_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [blockerId, parseInt(blockedUserId)]
    )

    return NextResponse.json({ message: 'User blocked' })
  } catch (err) {
    console.error('Block error:', err)
    return NextResponse.json({ error: 'Failed to block user' }, { status: 500 })
  } finally {
    if (client) client.release()
  }
}