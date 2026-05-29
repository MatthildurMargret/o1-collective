import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'O1 Collective <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAILS?.split(',')[0]?.trim()

async function send(payload) {
  const { data, error } = await resend.emails.send(payload)
  if (error) throw new Error(error.message ?? JSON.stringify(error))
  return data
}

export async function sendApplicationNotification(application) {
  const typeLabel = application.type === 'founder' ? 'Founder Circle' : 'General Membership'

  await send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New ${typeLabel} application: ${application.name}`,
    text: [
      `New ${typeLabel} application`,
      '',
      `Name: ${application.name}`,
      `Email: ${application.email}`,
      `Company: ${application.company ?? '—'}`,
      `Role: ${application.role ?? '—'}`,
      application.stage ? `Stage: ${application.stage}` : null,
      `LinkedIn: ${application.linkedin ?? '—'}`,
      application.website ? `Website: ${application.website}` : null,
      application.referred_by ? `Referred by: ${application.referred_by}` : null,
      application.building ? `\nWhat they're building:\n${application.building}` : null,
      application.how_heard ? `\nHow they heard about us:\n${application.how_heard}` : null,
      `\nWhy they want to join:\n${application.why}`,
      '',
      `Review at: ${process.env.NEXT_PUBLIC_SITE_URL}/admin`,
    ].filter((l) => l !== null).join('\n'),
  })
}

export async function sendApprovalEmail(application) {
  const typeLabel = application.type === 'founder' ? 'Founder Circle' : 'O1 Collective'
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

  await send({
    from: FROM,
    to: application.email,
    subject: `You're in — welcome to ${typeLabel}`,
    text: [
      `Hi ${application.name.split(' ')[0]},`,
      '',
      `Your application to ${typeLabel} has been approved.`,
      '',
      `Create your account and access the member portal here:`,
      `${siteUrl}/login`,
      '',
      `Welcome to the community.`,
      '',
      `— O1 Collective`,
    ].join('\n'),
  })
}

export async function sendRejectionEmail(application) {
  const typeLabel = application.type === 'founder' ? 'Founder Circle' : 'O1 Collective'

  await send({
    from: FROM,
    to: application.email,
    subject: `Your O1 Collective application`,
    text: [
      `Hi ${application.name.split(' ')[0]},`,
      '',
      `Thank you for applying to ${typeLabel}. After careful review, we're not moving forward with your application at this time.`,
      '',
      `We review applications on a rolling basis and encourage you to reapply in the future.`,
      '',
      `— O1 Collective`,
    ].join('\n'),
  })
}
