import { sql } from '../../_lib/db.js'
import { DEMO_STUDENT_KEY } from '../../_lib/constants.js'

// liveAttendance is only ever set via end-live.js (it depends on watch-time + join method
// at the moment the session ends) — this endpoint only handles the two student-initiated actions.
const ACTION_COLUMN = { studyMaterial: 'study_material', quiz: 'quiz' }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { action } = req.body || {}
  const column = ACTION_COLUMN[action]
  if (!column) return res.status(400).json({ error: 'Invalid action' })

  const db = sql()
  const id = Number(req.query.id)

  if (action === 'studyMaterial') {
    const [reg] = await db`SELECT mid_session FROM registrations WHERE session_id = ${id} AND student_key = ${DEMO_STUDENT_KEY}`
    if (reg?.mid_session) return res.status(200).json({ ok: true, skipped: 'mid-session registrant' })
  }

  await db.query(
    `INSERT INTO actions (session_id, student_key, ${column}) VALUES ($1, $2, true)
     ON CONFLICT (session_id, student_key) DO UPDATE SET ${column} = true`,
    [id, DEMO_STUDENT_KEY]
  )

  res.status(200).json({ ok: true })
}
