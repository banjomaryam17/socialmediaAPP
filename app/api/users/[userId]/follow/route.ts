import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface Params {
  params: Promise<{ userId: string }>
}

export async function POST(req: NextRequest, { params }: Params) {
  const client = await pool.connect()

  try {
    const { user_id } = await req.json()
    const { userId } = await params 
    const following_id = parseInt(userId, 10)

    if (!user_id || !following_id || Number.isNaN(following_id)) {
      return NextResponse.json({ error: 'Missing IDs' }, { status: 400 })
    }

    // already following?
    const existing = await client.query(
      'SELECT 1 FROM followers WHERE follower_id = $1 AND following_id = $2',
      [user_id, following_id]
    )

    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json({ message: 'Already following' }, { status: 200 })
    }

    await client.query(
      'INSERT INTO followers (follower_id, following_id) VALUES ($1, $2)',
      [user_id, following_id]
    )

    return NextResponse.json({ message: 'Followed successfully' }, { status: 201 })
  } catch (err) {
    console.error('❌ Follow error:', err)
    return NextResponse.json({ error: 'Failed to follow' }, { status: 500 })
  } finally {
    client.release()
  }
}