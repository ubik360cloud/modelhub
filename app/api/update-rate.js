// Vercel Cron Job — runs every Monday at 4:00 AM UTC (= 11:00 PM Colombia, UTC-5)
// Calls the Supabase Edge Function that fetches the current USD/COP rate
// and updates app_settings in the database.

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const response = await fetch(
      'https://emahjvfkqnyseonnoqkz.supabase.co/functions/v1/update-exchange-rate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Edge function error:', data)
      return res.status(500).json({ success: false, error: data })
    }

    console.log(`USD/COP rate updated: ${data.rate}`)
    return res.status(200).json(data)
  } catch (err) {
    console.error('update-rate cron error:', err)
    return res.status(500).json({ success: false, error: String(err) })
  }
}
