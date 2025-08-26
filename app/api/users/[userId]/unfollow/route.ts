import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface Params {
  params: Promise<{ userId: string }>
}

export async function POST(req: NextRequest, { params }: Params) {
  const client = await pool.connect()

  try {
    const { user_id } = await req.json()
    const { userId } = await params // Await the params
    const following_id = parseInt(userId, 10)

    if (!user_id || !following_id || Number.isNaN(following_id)) {
      return NextResponse.json({ error: 'Missing IDs' }, { status: 400 })
    }

    // Is there already a follow?
    const existing = await client.query(
      'SELECT 1 FROM followers WHERE follower_id = $1 AND following_id = $2',
      [user_id, following_id]
    )

    if (!existing.rowCount) {
      // Nothing to unfollow
      return NextResponse.json({ message: 'Not following' }, { status: 200 })
    }

    await client.query(
      'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2',
      [user_id, following_id]
    )

    return NextResponse.json({ message: 'Unfollowed successfully' }, { status: 200 })
  } catch (err) {
    console.error('❌ Unfollow error:', err)
    return NextResponse.json({ error: 'Failed to unfollow' }, { status: 500 })
  } finally {
    client.release()
  }
}