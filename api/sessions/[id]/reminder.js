import { sql } from '../../_lib/db.js'
import { computeStatus } from '../../_lib/status.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { kind } = req.body || {}
  if (!['T-24h', 'T-1h', 'broadcast'].includes(kind)) return res.status(400).json({ error: 'Invalid kind' })

  const db = sql()
  const id = Number(req.query.id)
  const [session] = await db`SELECT status, start_at, end_at, topic FROM sessions WHERE id = ${id}`
  if (!session) return res.status(404).json({ error: 'Session not found' })

  // Server-enforced, mirroring the PRD's reminder-suppression rule — a cancelled/completed
  // session can't have a T-24h/T-1h reminder fired, and the "you missed it" broadcast
  // only makes sense once a session has actually completed.
  const status = computeStatus(session)
  if ((kind === 'T-24h' || kind === 'T-1h') && status !== 'scheduled') {
    return res.status(409).json({ error: 'Reminders are only available while a session is Scheduled' })
  }
  if (kind === 'broadcast' && status !== 'completed') {
    return res.status(409).json({ error: 'Broadcast only applies once a session is Completed' })
  }

  const [{ count }] = await db`SELECT COUNT(*)::int AS count FROM registrations WHERE session_id = ${id}`

  if (kind === 'T-24h' || kind === 'T-1h') {
    await db`INSERT INTO notifications (kind, title, body) VALUES ('reminder', ${`${kind} reminder sent`}, ${`Push + WhatsApp sent to ${count} registered student(s) for "${session.topic}".`})`
  } else {
    await db`INSERT INTO notifications (kind, title, body) VALUES ('reminder', 'Broadcast: "You missed it" (P1 experiment)', ${`Push sent to all app users who never registered for "${session.topic}" — marketing evaluates performance.`})`
  }

  res.status(200).json({ ok: true })
}
