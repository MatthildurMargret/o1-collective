import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function cleanCompany(raw) {
  if (!raw) return ''
  return raw.replace(/\s*\(https?:\/\/[^)]+\)/g, '').trim()
}

// Server-side source of truth for "is this email allowed to be an O1 Collective member" —
// matches against the Attio CRM or an approved /apply application. Used to gate both the
// login/signup UI (check-member) and profile creation (profile), since RLS alone can't
// tell an approved member apart from any other authenticated Supabase user.
export async function findApprovedMember(email) {
  const normalized = email?.toLowerCase().trim()
  if (!normalized) return null

  const [attioRes, applicationRes] = await Promise.all([
    fetch('https://api.attio.com/v2/objects/people/records/query', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.ATTIO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ limit: 500 }),
      next: { revalidate: 60 },
    }).catch(() => null),
    adminClient()
      .from('applications')
      .select('name, role, company, linkedin')
      .eq('email', normalized)
      .eq('status', 'approved')
      .maybeSingle(),
  ])

  if (attioRes?.ok) {
    const data = await attioRes.json()
    for (const record of data.data ?? []) {
      const v = record.values
      const emails = (v.email_addresses ?? []).map((e) => e.email_address?.toLowerCase()).filter(Boolean)
      if (emails.includes(normalized)) {
        return {
          source: 'attio',
          attioId: record.id.record_id,
          name: v.name?.[0]?.full_name ?? '',
          jobTitle: v.job_title?.[0]?.value ?? '',
          company: cleanCompany(v.company_7?.[0]?.value),
          location: v.primary_location?.[0]?.locality ?? '',
          linkedin: v.linkedin?.[0]?.value ?? '',
          description: v.description?.[0]?.value ?? '',
        }
      }
    }
  }

  const approved = applicationRes?.data
  if (approved) {
    return {
      source: 'application',
      attioId: null,
      name: approved.name ?? '',
      jobTitle: approved.role ?? '',
      company: approved.company ?? '',
      location: '',
      linkedin: approved.linkedin ?? '',
      description: '',
    }
  }

  return null
}
