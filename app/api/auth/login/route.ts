import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(req: NextRequest) {
  console.log('📥 Login request received')

  const client = await pool.connect()

  try {
    const { username, password } = await req.json()
    console.log('👤 Username:', username)

    const bcrypt = await import('bcrypt')
    console.log('🔐 Bcrypt imported')

    const result = await client.query('SELECT * FROM users WHERE username = $1', [username])
    const user = result.rows[0]
    console.log('📄 User from DB:', user)

    if (!user) {
      console.log('❌ No user found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    console.log('🔐 Password match:', isMatch)

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    return NextResponse.json(
      { message: 'Login successful', user: { id: user.id, username: user.username } },
      { status: 200 }
    )
  } catch (err: unknown) {
    console.error('❌ Login error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  } finally {
    client.release()
  }
}
