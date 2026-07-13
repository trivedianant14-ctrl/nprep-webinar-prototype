import { sql } from '../_lib/db.js'
import { serializeSession } from '../_lib/serialize.js'

export default async function handler(req, res) {
  const db = sql()

  if (req.method === 'GET') {
    const sessions = await db`SELECT * FROM sessions ORDER BY id`
    return res.status(200).json(sessions.map(s => serializeSession(s)))
  }

  if (req.method === 'POST') {
    // New sessions default to a 1-hour slot a week out at 7 PM — marketing adjusts from there.
    const start = new Date()
    start.setDate(start.getDate() + 7)
    start.setHours(19, 0, 0, 0)
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    const [row] = await db`
      INSERT INTO sessions (status, host, topper_name, topper_rank, topic, start_at, end_at)
      VALUES ('scheduled', '', '', '', '', ${start.toISOString()}, ${end.toISOString()})
      RETURNING *
    `
    return res.status(201).json(serializeSession(row))
  }

  res.status(405).json({ error: 'Method not allowed' })
}
