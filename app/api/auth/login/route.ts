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

    // ✅ Login successful
    return NextResponse.json(
      { message: 'Login successful', user: { id: user.id, username: user.username } },
      { status: 200 }
    )
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('❌ Login error:', err.message)
    } else {
      console.error('❌ Login error:', err)
    }

    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  } finally {
    client.release()
  }
}
