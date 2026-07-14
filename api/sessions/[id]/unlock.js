import { sql } from '../../_lib/db.js'
import { DEMO_STUDENT_KEY } from '../../_lib/constants.js'

// Spend one share-earned credit to permanently unlock one locked recording.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const db = sql()
  const id = Number(req.query.id)

  const [session] = await db`SELECT recording_url FROM sessions WHERE id = ${id}`
  if (!session) return res.status(404).json({ error: 'Session not found' })

  const [already] = await db`SELECT id FROM unlocked_recordings WHERE student_key = ${DEMO_STUDENT_KEY} AND session_id = ${id}`
  if (already) return res.status(200).json({ ok: true, alreadyUnlocked: true })

  const [{ shares }] = await db`SELECT COUNT(*)::int AS shares FROM shares WHERE student_key = ${DEMO_STUDENT_KEY}`
  const [{ used }] = await db`SELECT COUNT(*)::int AS used FROM unlocked_recordings WHERE student_key = ${DEMO_STUDENT_KEY}`
  if (shares - used <= 0) return res.status(409).json({ error: 'No unlock credits — share a session to earn one' })

  await db`INSERT INTO unlocked_recordings (student_key, session_id) VALUES (${DEMO_STUDENT_KEY}, ${id}) ON CONFLICT DO NOTHING`

  res.status(200).json({ ok: true, credits: shares - used - 1 })
}
