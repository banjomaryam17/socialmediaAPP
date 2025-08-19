import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(req: NextRequest) {
  const client = await pool.connect()

  try {
    const { username, password, firstName, lastName, avatarUrl } = await req.json()
    const bcrypt = await import('bcrypt')

    if (!username || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Check if username already exists
    const existingUser = await client.query('SELECT * FROM users WHERE username = $1', [username])
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await client.query(
      'INSERT INTO users (username, password, first_name, last_name, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, avatar_url',
      [username, hashedPassword, firstName, lastName, avatarUrl || null]
    )

    return NextResponse.json(
      { message: 'Signup successful', user: result.rows[0] },
      { status: 201 }
    )
  } catch (err) {
    console.error('❌ Signup error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  } finally {
    client.release()
  }
}
