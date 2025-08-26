import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type Params = { postId: string }

export async function GET(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const client = await pool.connect()
  try {
    const { postId } = await context.params
    const result = await client.query(
      `
      SELECT c.id, c.text, c.created_at, u.username, u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
      `,
      [postId]
    )
    return NextResponse.json({ comments: result.rows }, { status: 200 })
  } catch (err) {
    console.error('❌ Fetch comments error:', err)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const client = await pool.connect()
  try {
    const { user_id, text } = await req.json()
    const { postId } = await context.params

    if (!user_id || !text) {
      return NextResponse.json({ error: 'Missing user_id or text' }, { status: 400 })
    }

    const result = await client.query(
      'INSERT INTO comments (post_id, user_id, text) VALUES ($1, $2, $3) RETURNING *',
      [postId, user_id, text]
    )

    return NextResponse.json({ message: 'Comment added', comment: result.rows[0] }, { status: 201 })
  } catch (err) {
    console.error('❌ Comment creation error:', err)
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
  } finally {
    client.release()
  }
}
