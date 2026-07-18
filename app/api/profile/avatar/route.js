import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '../../../../lib/supabase-server'
import { findApprovedMember } from '../../../../lib/membership'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function adminClient() {
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function POST(request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const member = await findApprovedMember(user.email)
  if (!member) {
    return NextResponse.json({ error: 'This account is not an approved O1 Collective member.' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Please upload a JPEG, PNG, or WebP image.' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Image must be under 5MB.' }, { status: 400 })
  }

  const admin = adminClient()
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${user.id}/avatar-${Date.now()}.${ext}`

  const { error: uploadError } = await admin.storage
    .from('avatars')
    .upload(path, file, { contentType: file.type, upsert: true })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from('avatars').getPublicUrl(path)

  const { error: dbError } = await admin
    .from('profiles')
    .upsert({ id: user.id, email: user.email, avatar_url: publicUrl, attio_id: member.attioId }, { onConflict: 'id' })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ avatarUrl: publicUrl })
}
