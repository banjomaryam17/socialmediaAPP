import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  const client = await pool.connect()

  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const viewerId = parseInt(searchParams.get('viewer_id') || '0')

    const result = await client.query(
      `
      SELECT 
        id, username, avatar_url,
        EXISTS (
          SELECT 1 FROM followers 
          WHERE follower_id = $1 AND following_id = users.id
        ) AS is_following
      FROM users
      WHERE LOWER(username) LIKE LOWER($2) AND id != $1
      LIMIT 20
      `,
      [viewerId, `%${query}%`]
    )

    return NextResponse.json({ users: result.rows }, { status: 200 })
  } catch (err) {
    console.error('❌ Search users error:', err)
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
  } finally {
    client.release()
  }
}
