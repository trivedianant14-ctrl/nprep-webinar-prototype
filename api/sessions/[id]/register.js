import { sql } from '../../_lib/db.js'
import { DEMO_STUDENT_KEY } from '../../_lib/constants.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const db = sql()
  const id = Number(req.query.id)

  const [session] = await db`SELECT status FROM sessions WHERE id = ${id}`
  if (!session) return res.status(404).json({ error: 'Session not found' })

  const midSession = session.status === 'live'
  // Idempotent: registering twice (or joining live after already being registered) never
  // duplicates a row or clobbers an existing pre-session registration's mid_session flag.
  await db`
    INSERT INTO registrations (session_id, student_key, student_name, student_phone, mid_session)
    VALUES (${id}, ${DEMO_STUDENT_KEY}, 'You', '—', ${midSession})
    ON CONFLICT (session_id, student_key) DO NOTHING
  `

  res.status(200).json({ ok: true })
}
