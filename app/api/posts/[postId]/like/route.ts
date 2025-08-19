import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { QueryResult } from 'pg'

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  const client = await pool.connect()

  try {
    const { user_id } = await req.json()
    const postId = parseInt(params.postId)

    if (!user_id || !postId) {
      return NextResponse.json({ error: 'Missing user_id or postId' }, { status: 400 })
    }

    // Check if user already liked this post
    const existing: QueryResult = await client.query(
      'SELECT * FROM post_likes WHERE user_id = $1 AND post_id = $2',
      [user_id, postId]
    )

    if ((existing as any).rowCount > 0) {
      return NextResponse.json({ message: 'Already liked' }, { status: 200 })
    }

    // Add new like
    await client.query('INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)', [user_id, postId])

    return NextResponse.json({ message: 'Post liked' }, { status: 201 })
  } catch (err) {
    console.error('❌ Like error:', err)
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 })
  } finally {
    client.release()
  }
}
