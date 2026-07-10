import { sql } from '../_lib/db.js'
import { serializeSession } from '../_lib/serialize.js'

export default async function handler(req, res) {
  const db = sql()

  if (req.method === 'GET') {
    const sessions = await db`SELECT * FROM sessions ORDER BY id`
    return res.status(200).json(sessions.map(s => serializeSession(s)))
  }

  if (req.method === 'POST') {
    const [row] = await db`
      INSERT INTO sessions (status, host, topper_name, topper_rank, topic, date_label, time_label, days_out)
      VALUES ('scheduled', '', '', '', '', '', '', 30)
      RETURNING *
    `
    return res.status(201).json(serializeSession(row))
  }

  res.status(405).json({ error: 'Method not allowed' })
}
