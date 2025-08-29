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
        COALESCE(COUNT(DISTINCT pl.user_id), 0) AS like_count,
        COALESCE(COUNT(DISTINCT pc.id), 0) AS comment_count,
        CASE 
          WHEN viewer_likes.post_id IS NOT NULL THEN true
          ELSE false
        END AS is_liked,
        CASE 
          WHEN f.follower_id IS NOT NULL THEN true
          ELSE false
        END AS is_following
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN post_likes pl ON posts.id = pl.post_id
      LEFT JOIN comments pc ON posts.id = pc.post_id
      LEFT JOIN post_likes viewer_likes ON posts.id = viewer_likes.post_id AND viewer_likes.user_id = $1
      LEFT JOIN followers f ON f.follower_id = $1 AND f.following_id = users.id
      LEFT JOIN blocked_users bu ON bu.blocker_id = $1 AND bu.blocked_id = posts.user_id
      WHERE bu.blocked_id IS NULL
      GROUP BY posts.id, users.username, users.avatar_url, posts.user_id, viewer_likes.post_id, f.follower_id
      ORDER BY posts.created_at DESC
      `,
      [viewerId || null]
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