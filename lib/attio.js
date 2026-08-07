function splitName(fullName) {
  const parts = (fullName ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { first_name: '', last_name: '', full_name: '' }
  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(' '),
    full_name: fullName.trim(),
  }
}

// Creates or updates (by email) the person record in Attio for a newly-approved application,
// so approved members show up in the CRM without someone re-entering them by hand.
// Best-effort: callers should treat a thrown error as non-fatal to the approval itself.
export async function upsertAttioPersonFromApplication(application) {
  const email = application.email?.toLowerCase().trim()
  if (!email) throw new Error('Application has no email')

  const values = {
    email_addresses: [email],
    name: [splitName(application.name)],
  }
  if (application.role) values.job_title = [application.role]
  if (application.company) values.company_7 = [application.company]
  if (application.linkedin) values.linkedin = [application.linkedin]

  const res = await fetch(
    'https://api.attio.com/v2/objects/people/records?matching_attribute=email_addresses',
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.ATTIO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: { values } }),
    }
  )

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Attio upsert failed (${res.status}): ${text}`)
  }

  return res.json()
}
