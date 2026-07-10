import { sql } from '../../_lib/db.js'
import { DEMO_STUDENT_KEY } from '../../_lib/constants.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text } = req.body || {}
  if (!text || !text.trim()) return res.status(400).json({ error: 'text is required' })

  const db = sql()
  const id = Number(req.query.id)
  await db`INSERT INTO followups (session_id, student_key, body) VALUES (${id}, ${DEMO_STUDENT_KEY}, ${text.trim()})`

  res.status(200).json({ ok: true })
}
