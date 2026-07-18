import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '../../../lib/supabase-server'
import { findApprovedMember } from '../../../lib/membership'

function adminClient() {
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const member = await findApprovedMember(user.email)
  if (!member) {
    return NextResponse.json({ error: 'This account is not an approved O1 Collective member.' }, { status: 403 })
  }

  const { data: profile } = await adminClient()
    .from('profiles')
    .select('name, job_title, company, location, linkedin, bio, avatar_url, onboarding_complete')
    .eq('id', user.id)
    .maybeSingle()

  return NextResponse.json({
    name: profile?.name || member.name,
    jobTitle: profile?.job_title || member.jobTitle,
    company: profile?.company || member.company,
    location: profile?.location || member.location,
    linkedin: profile?.linkedin || member.linkedin,
    bio: profile?.bio || member.description,
    avatarUrl: profile?.avatar_url || '',
    onboardingComplete: !!profile?.onboarding_complete,
  })
}

export async function POST(request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const member = await findApprovedMember(user.email)
  if (!member) {
    return NextResponse.json({ error: 'This account is not an approved O1 Collective member.' }, { status: 403 })
  }

  const body = await request.json()

  const { data, error } = await adminClient()
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      name: body.name ?? '',
      job_title: body.jobTitle ?? '',
      company: body.company ?? '',
      location: body.location ?? '',
      bio: body.bio ?? '',
      attio_id: member.attioId,
      linkedin: body.linkedin || null,
      onboarding_complete: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
