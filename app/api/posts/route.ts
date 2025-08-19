import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

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
    console.error('❌ Post creation error:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  } finally {
    client.release()
  }
}
