import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(
  req: NextRequest,
  context: { params: { userId: string } }
) {
  const client = await pool.connect()

  try {
    const { user_id } = await req.json()
    const following_id = parseInt(context.params.userId, 10)

    if (!user_id || !following_id) {
      return NextResponse.json({ error: 'Missing IDs' }, { status: 400 })
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
