import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  let client
  
  try {
    client = await pool.connect()
    
    // Extract postId from params (this matches your [postId] folder name)
    const postId = parseInt(params.postId)
    
    console.log('🔍 Params postId:', params.postId)
    console.log('🔍 Parsed postId:', postId)
    
    const { user_id } = await req.json()

    if (!user_id || !postId || isNaN(postId)) {
      console.error('❌ Invalid data:', { user_id, postId: params.postId })
      return NextResponse.json({ error: 'Missing user_id or invalid postId' }, { status: 400 })
    }

    // Check if already liked
    const existing = await client.query(
      'SELECT 1 FROM post_likes WHERE user_id = $1 AND post_id = $2',
      [user_id, postId]
    )

    if (existing.rowCount && existing.rowCount > 0) {
      // Unlike
      await client.query(
        'DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2',
        [user_id, postId]
      )
      console.log('✅ Post unliked:', { postId, user_id })
      return NextResponse.json({ message: 'Post unliked' }, { status: 200 })
    } else {
      // Like
      await client.query(
        'INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)',
        [user_id, postId]
      )
      console.log('✅ Post liked:', { postId, user_id })
      return NextResponse.json({ message: 'Post liked' }, { status: 201 })
    }
    
  } catch (err) {
    console.error('❌ Like error:', err)
    return NextResponse.json({ error: 'Failed to process like' }, { status: 500 })
  } finally {
    if (client) client.release()
  }
}