import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendApplicationNotification } from '../../../lib/email'

export async function POST(request) {
  const body = await request.json()
  const { type, name, email, company, role, linkedin, website, stage, building, how_heard, referred_by, why } = body

  if (!type || !name || !email || !why) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await supabase
    .from('applications')
    .insert({ type, name, email: email.toLowerCase().trim(), company, role, linkedin, website, stage, building, how_heard, referred_by, why, status: 'pending' })
    .select()
    .single()

  if (error) {
    // Treat duplicate email+type as already applied
    if (error.code === '23505') {
      return NextResponse.json({ error: 'An application with this email already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  try {
    await sendApplicationNotification(data)
  } catch (e) {
    console.error('Failed to send application notification:', e.message)
  }

  return NextResponse.json({ ok: true })
}
