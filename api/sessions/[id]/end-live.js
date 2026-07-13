import { sql } from '../../_lib/db.js'
import { DEMO_STUDENT_KEY } from '../../_lib/constants.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const db = sql()
  const id = Number(req.query.id)
  const { watchedEnough, viaYoutubeDirect } = req.body || {}

  const [session] = await db`SELECT topic FROM sessions WHERE id = ${id}`
  if (!session) return res.status(404).json({ error: 'Session not found' })

  // Status is derived from timestamps, so "the session ended" = the end time is now.
  await db`UPDATE sessions SET end_at = now() WHERE id = ${id}`

  if (watchedEnough && !viaYoutubeDirect) {
    await db`
      INSERT INTO actions (session_id, student_key, live_attendance)
      VALUES (${id}, ${DEMO_STUDENT_KEY}, true)
      ON CONFLICT (session_id, student_key) DO UPDATE SET live_attendance = true
    `
  }

  await db`
    INSERT INTO notifications (kind, title, body)
    VALUES ('reminder', 'Post-session push fired', ${`Registered students for "${session.topic}" were pushed back to the post-session screen.`})
  `

  res.status(200).json({ ok: true })
}
