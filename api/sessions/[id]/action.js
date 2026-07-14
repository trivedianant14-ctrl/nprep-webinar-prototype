import { sql } from '../../_lib/db.js'
import { computeStatus } from '../../_lib/status.js'
import { DEMO_STUDENT_KEY } from '../../_lib/constants.js'

// Consolidated dispatcher for all small session-scoped student/CMS actions — kept in one
// function (rather than one file per action) to stay under the Vercel Hobby plan's
// 12-serverless-function cap. liveAttendance is only ever set via end-live.js (it depends
// on watch-time + join method at the moment the session ends).
const ACTION_COLUMN = { studyMaterial: 'study_material', quiz: 'quiz' }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { action } = req.body || {}
  const db = sql()
  const id = Number(req.query.id)

  if (action === 'studyMaterial' || action === 'quiz') {
    const column = ACTION_COLUMN[action]
    if (action === 'studyMaterial') {
      const [reg] = await db`SELECT mid_session FROM registrations WHERE session_id = ${id} AND student_key = ${DEMO_STUDENT_KEY}`
      if (reg?.mid_session) return res.status(200).json({ ok: true, skipped: 'mid-session registrant' })
    }
    await db.query(
      `INSERT INTO actions (session_id, student_key, ${column}) VALUES ($1, $2, true)
       ON CONFLICT (session_id, student_key) DO UPDATE SET ${column} = true`,
      [id, DEMO_STUDENT_KEY]
    )
    return res.status(200).json({ ok: true })
  }

  if (action === 'reminder') {
    const { kind } = req.body || {}
    if (!['T-24h', 'T-1h', 'broadcast', 'cohost'].includes(kind)) return res.status(400).json({ error: 'Invalid kind' })

    const [session] = await db`SELECT status, start_at, end_at, topic, topper_name, host, youtube_embed_id FROM sessions WHERE id = ${id}`
    if (!session) return res.status(404).json({ error: 'Session not found' })

    // Server-enforced, mirroring the PRD's reminder-suppression rule — a cancelled/completed
    // session can't have a T-24h/T-1h reminder fired, and the "you missed it" broadcast
    // only makes sense once a session has actually completed.
    const status = computeStatus(session)
    if ((kind === 'T-24h' || kind === 'T-1h' || kind === 'cohost') && status !== 'scheduled') {
      return res.status(409).json({ error: 'Only available while a session is Scheduled' })
    }
    if (kind === 'broadcast' && status !== 'completed') {
      return res.status(409).json({ error: 'Broadcast only applies once a session is Completed' })
    }

    // Topper coordination (PRD ops timeline): co-host link goes out at T-24h so the
    // topper can test their setup in advance.
    if (kind === 'cohost') {
      const who = session.topper_name || session.host
      await db`INSERT INTO notifications (kind, title, body) VALUES ('reminder', 'Co-host link sent to topper', ${`YouTube Live co-host link for "${session.topic}" sent to ${who} via WhatsApp + email. T-15 check-in call reminder scheduled for marketing.`})`
      return res.status(200).json({ ok: true })
    }

    const [{ count }] = await db`SELECT COUNT(*)::int AS count FROM registrations WHERE session_id = ${id}`

    if (kind === 'T-24h' || kind === 'T-1h') {
      await db`INSERT INTO notifications (kind, title, body) VALUES ('reminder', ${`${kind} reminder sent`}, ${`Push + WhatsApp sent to ${count} registered student(s) for "${session.topic}".`})`
    } else {
      await db`INSERT INTO notifications (kind, title, body) VALUES ('reminder', 'Broadcast: "You missed it" (P1 experiment)', ${`Push sent to all app users who never registered for "${session.topic}" — marketing evaluates performance.`})`
    }
    return res.status(200).json({ ok: true })
  }

  if (action === 'followup') {
    const { text } = req.body || {}
    if (!text || !text.trim()) return res.status(400).json({ error: 'text is required' })
    await db`INSERT INTO followups (session_id, student_key, body) VALUES (${id}, ${DEMO_STUDENT_KEY}, ${text.trim()})`
    return res.status(200).json({ ok: true })
  }

  return res.status(400).json({ error: 'Invalid action' })
}
