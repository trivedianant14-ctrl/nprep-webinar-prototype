import { sql } from '../../_lib/db.js'
import { DEMO_STUDENT_KEY } from '../../_lib/constants.js'

// Share-to-unlock: sharing a session earns one recording-unlock credit.
// One credit per session shared (idempotent) — re-sharing the same session doesn't farm credits.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const db = sql()
  const id = Number(req.query.id)

  const [session] = await db`SELECT id FROM sessions WHERE id = ${id}`
  if (!session) return res.status(404).json({ error: 'Session not found' })

  const inserted = await db`
    INSERT INTO shares (student_key, session_id)
    VALUES (${DEMO_STUDENT_KEY}, ${id})
    ON CONFLICT (student_key, session_id) DO NOTHING
    RETURNING id
  `

  const [{ shares }] = await db`SELECT COUNT(*)::int AS shares FROM shares WHERE student_key = ${DEMO_STUDENT_KEY}`
  const [{ used }] = await db`SELECT COUNT(*)::int AS used FROM unlocked_recordings WHERE student_key = ${DEMO_STUDENT_KEY}`

  res.status(200).json({ ok: true, creditEarned: inserted.length > 0, credits: shares - used })
}
