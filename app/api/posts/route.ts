import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  const client = await pool.connect()

  try {
    const { searchParams } = new URL(req.url)
    const viewerId = parseInt(searchParams.get('viewer_id') || '0')
    const result = await client.query(
      `
      SELECT 
        posts.id,
        posts.text,
        posts.created_at,
        posts.user_id,
        users.username,
        users.avatar_url,
        COUNT(pl.post_id) AS like_count,
        COUNT(DISTINCT c.id) AS comment_count,
        CASE
          WHEN f.follower_id IS NOT NULL THEN TRUE
          ELSE FALSE
        END AS is_following
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN followers f ON f.follower_id = $1 AND f.following_id = users.id
      LEFT JOIN post_likes pl ON posts.id = pl.post_id
      LEFT JOIN comments c ON posts.id = c.post_id
      WHERE posts.user_id = $1 OR f.follower_id = $1
      GROUP BY posts.id, users.username, users.avatar_url, posts.user_id, f.follower_id
      ORDER BY posts.created_at DESC
      `,
      [viewerId]
    )
    
  
    return NextResponse.json({ posts: result.rows }, { status: 200 })
  } catch (err) {
    console.error('Fetch posts error:', err)
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function POST(req: NextRequest) {
  const client = await pool.connect()

  try {
    const { user_id, text } = await req.json()

    if (!user_id || !text) {
      return NextResponse.json({ error: 'Missing user_id or text' }, { status: 400 })
    }

    const result = await client.query(
      'INSERT INTO posts (user_id, text) VALUES ($1, $2) RETURNING *',
      [user_id, text]
    )

    return NextResponse.json({ message: 'Post created', post: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Post creation error:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  } finally {
    client.release()
  }
}