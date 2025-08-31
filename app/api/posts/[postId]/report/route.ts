import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  let client
  try {
    client = await pool.connect()
    const { postId } = await context.params
    const { user_id, reason } = await req.json()
    
    await client.query(
      'INSERT INTO post_reports (reporter_id, post_id, reason) VALUES ($1, $2, $3)',
      [user_id, parseInt(postId), reason || 'No reason provided']
    )

    return NextResponse.json({ message: 'Post reported' })
  } catch (err) {
    console.error('Report error:', err)
    return NextResponse.json({ error: 'Failed to report post' }, { status: 500 })
  } finally {
    if (client) client.release()
  }
}