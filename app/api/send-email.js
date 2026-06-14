export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { to, subject, html } = req.body
  if (!to || !subject || !html) return res.status(400).json({ error: 'Missing fields' })

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'ModelHub <noreply@modelhub.studio>',
      to,
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return res.status(500).json({ error: err })
  }

  return res.status(200).json({ success: true })
}
