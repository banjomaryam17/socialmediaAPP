import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  const client = await pool.connect()
  try {
    const { searchParams } = new URL(req.url)
    const viewerId = parseInt(searchParams.get('viewer_id') || '0')

    const result = await client.query(`
      SELECT 
        users.id, users.username, users.avatar_url,
        COUNT(DISTINCT f1.follower_id) AS follower_count,
        COUNT(DISTINCT f2.following_id) AS following_count,
        COUNT(DISTINCT p.id) AS post_count,
        CASE 
          WHEN f3.follower_id IS NOT NULL THEN true
          ELSE false
        END AS is_following
      FROM users
      LEFT JOIN followers f1 ON f1.following_id = users.id
      LEFT JOIN followers f2 ON f2.follower_id = users.id
      LEFT JOIN posts p ON p.user_id = users.id
      LEFT JOIN followers f3 ON f3.follower_id = $1 AND f3.following_id = users.id
      WHERE users.id != $1
      GROUP BY users.id, f3.follower_id
      ORDER BY users.username
    `, [viewerId])

    return NextResponse.json({ users: result.rows }, { status: 200 })

  } catch (err) {
    console.error('❌ Failed to fetch users:', err)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  } finally {
    client.release()
  }
}
