import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(req: NextRequest) {
  const client = await pool.connect()

  try {
    const url = new URL(req.url)
    const postId = parseInt(url.pathname.split('/').at(-2) || '') // safely extract postId
    const { user_id } = await req.json()

    if (!user_id || !postId) {
      return NextResponse.json({ error: 'Missing user_id or postId' }, { status: 400 })
    }

    const existing = await client.query(
      'SELECT 1 FROM post_likes WHERE user_id = $1 AND post_id = $2',
      [user_id, postId]
    )

    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json({ message: 'Already liked' }, { status: 200 })
    }

    await client.query(
      'INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)',
      [user_id, postId]
    )

    return NextResponse.json({ message: 'Post liked' }, { status: 201 })
  } catch (err) {
    console.error('❌ Like error:', err)
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 })
  } finally {
    client.release()
  }
}
