import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const client = await pool.connect()
  const userId = parseInt(params.userId)

  try {
    const result = await client.query(
      `
      SELECT users.id, users.username, users.avatar_url
      FROM followers
      JOIN users ON followers.following_id = users.id
      WHERE followers.follower_id = $1
      ORDER BY users.username
      `,
      [userId]
    )

    return NextResponse.json({ following: result.rows }, { status: 200 })
  } catch (err) {
    console.error('❌ Following list error:', err)
    return NextResponse.json({ error: 'Failed to fetch following list' }, { status: 500 })
  } finally {
    client.release()
  }
}
