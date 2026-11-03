import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '../../../lib/supabase-server'
import { findApprovedMember } from '../../../lib/membership'

export async function GET() {
  const auth = await createServerClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Same gate as /api/members and /api/profile — a bare Supabase session isn't proof of
  // approved membership, since anyone can create one directly against the public anon key.
  const member = await findApprovedMember(user.email)
  if (!member) {
    return NextResponse.json({ error: 'This account is not an approved O1 Collective member.' }, { status: 403 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', today)
    .or('hidden.eq.false,hidden.is.null')
    .order('event_date', { ascending: true })

  if (error) {
    console.error('Events query error:', error.message)
    return NextResponse.json([], { status: 500 })
  }

  return NextResponse.json(data)
}
