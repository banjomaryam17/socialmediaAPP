import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(req: NextRequest) {
  console.log('📥 Incoming signup request')  // ✅ Add this line here

  const client = await pool.connect()

  try {
    const body = await req.json()
    const { username, password, firstName, lastName, avatarUrl } = body

    const bcrypt = await import('bcrypt') // ✅ Safe with Webpack

    const userCheck = await client.query('SELECT * FROM users WHERE username = $1', [username])
    if (userCheck.rows.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await client.query(
      'INSERT INTO users (username, password, first_name, last_name, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username, hashedPassword, firstName, lastName, avatarUrl]
    )

    return NextResponse.json({ message: 'User created', user: result.rows[0] }, { status: 201 })

  } catch (error: any) {
    console.error('❌ Signup error:', error.message)
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 })
  } finally {
    client.release()
  }
}
