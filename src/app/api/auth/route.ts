import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json()
    const correctPhone = process.env.ADMIN_PHONE || '9876543210'
    const correctPassword = process.env.ADMIN_PASSWORD || 'secretadmin'

    if (phone === correctPhone && password === correctPassword) {
      const cookieStore = await cookies()
      cookieStore.set('admin_session', 'authenticated_session_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 hours
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  return NextResponse.json({ success: true })
}
