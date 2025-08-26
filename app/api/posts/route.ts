import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  const client = await pool.connect()
  try {
    const { searchParams } = new URL(req.url)
    const viewerId = parseInt(searchParams.get('viewer_id') || '')

    const result = await client.query(
      `
      SELECT 
        p.id,
        p.text,
        p.created_at,
        p.user_id,
        u.username,
        u.avatar_url,
        COUNT(DISTINCT pl.post_id) AS like_count,
        COUNT(DISTINCT c.id)       AS comment_count,
        CASE WHEN f.follower_id IS NOT NULL THEN true ELSE false END AS is_following
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      LEFT JOIN comments c    ON p.id = c.post_id
      LEFT JOIN followers f   ON f.follower_id = $1 AND f.following_id = u.id
      GROUP BY p.id, u.username, u.avatar_url, p.user_id, f.follower_id
      ORDER BY p.created_at DESC
      `,
      [Number.isFinite(viewerId) ? viewerId : null]
    )

    return NextResponse.json({ posts: result.rows }, { status: 200 })
  } catch (err) {
    console.error('❌ Fetch posts error:', err)
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 })
  } finally {
    client.release()
  }
}
