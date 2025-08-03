import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// ✅ Safe: bcrypt dynamically imported inside server function
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { username, password, firstName, lastName, avatarUrl } = body
  const client = await pool.connect()

  try {
    const bcrypt = await import('bcrypt') // ✅ avoids webpack bundling
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
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  } finally {
    client.release()
  }
}
