import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(req: NextRequest) {
  const client = await pool.connect()

  try {
    const { username, password } = await req.json()
    const bcrypt = await import('bcrypt')

    const result = await client.query('SELECT * FROM users WHERE username = $1', [username])
    const user = result.rows[0]

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Optional: set a session/cookie here later
    return NextResponse.json({ message: 'Login successful', user }, { status: 200 })
  } catch (err: any) {
    console.error('❌ Login error:', err.message)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  } finally {
    client.release()
  }
}
