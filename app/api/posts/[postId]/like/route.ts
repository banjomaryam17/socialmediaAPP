import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(req: NextRequest) {
  const client = await pool.connect()

  try {
    const url = new URL(req.url)
    // Better path extraction - get the last segment before '/like'
    const pathSegments = url.pathname.split('/').filter(segment => segment !== '')
    const postId = parseInt(pathSegments[pathSegments.length - 2] || '') 
    
    console.log('🔍 URL pathname:', url.pathname)
    console.log('🔍 Extracted postId:', postId)
    
    const { user_id } = await req.json()

    if (!user_id || !postId || isNaN(postId)) {
      console.error('❌ Missing or invalid data:', { user_id, postId })
      return NextResponse.json({ error: 'Missing user_id or invalid postId' }, { status: 400 })
    }

    // Check if already liked
    const existing = await client.query(
      'SELECT 1 FROM post_likes WHERE user_id = $1 AND post_id = $2',
      [user_id, postId]
    )

    if (existing.rowCount && existing.rowCount > 0) {
      // Unlike if already liked
      await client.query(
        'DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2',
        [user_id, postId]
      )
      return NextResponse.json({ message: 'Post unliked' }, { status: 200 })
    }

    // Like the post
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