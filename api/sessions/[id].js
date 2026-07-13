import { sql } from '../_lib/db.js'
import { serializeSession } from '../_lib/serialize.js'
import { computeStatus } from '../_lib/status.js'

const FIELD_MAP = {
  host: 'host', topperName: 'topper_name', topperRank: 'topper_rank', topic: 'topic',
  startAt: 'start_at', endAt: 'end_at', thumbnailUrl: 'thumbnail_url',
  youtubeEmbedId: 'youtube_embed_id', studyMaterialUrl: 'study_material_url',
  recordingUrl: 'recording_url', cancelledReason: 'cancelled_reason', status: 'status',
}

export default async function handler(req, res) {
  const db = sql()
  const id = Number(req.query.id)

  if (req.method === 'PATCH') {
    const [current] = await db`SELECT * FROM sessions WHERE id = ${id}`
    if (!current) return res.status(404).json({ error: 'Session not found' })

    const body = req.body || {}
    // Live/completed are computed from start/end times, never set directly —
    // marketing may only cancel a session or restore a cancelled one.
    if ('status' in body && !['cancelled', 'scheduled'].includes(body.status)) {
      return res.status(400).json({ error: 'Status is schedule-driven; only cancel/restore are manual' })
    }

    const sets = []
    const params = []
    let i = 1
    for (const [key, col] of Object.entries(FIELD_MAP)) {
      if (key in body) { sets.push(`${col} = $${i++}`); params.push(body[key]) }
    }
    if (sets.length) {
      params.push(id)
      await db.query(`UPDATE sessions SET ${sets.join(', ')} WHERE id = $${i}`, params)
    }

    // Server-authoritative notification triggers, computed off the real before/after values.
    const becameCancelled = body.status === 'cancelled' && current.status !== 'cancelled'
    const restored = body.status === 'scheduled' && current.status === 'cancelled'
    const timeChanged = (field) => field in body && new Date(body[field]).getTime() !== new Date(current[field === 'startAt' ? 'start_at' : 'end_at']).getTime()
    const rescheduled = !becameCancelled && !restored && (timeChanged('startAt') || timeChanged('endAt'))
    // Only a genuine reschedule of an upcoming session notifies students — nudging the
    // end time of an already-finished session (or the demo's "end now") shouldn't push.
    const wasUpcoming = computeStatus(current) === 'scheduled'

    if (becameCancelled || restored || (rescheduled && wasUpcoming)) {
      const [{ count }] = await db`SELECT COUNT(*)::int AS count FROM registrations WHERE session_id = ${id}`
      const topic = 'topic' in body ? body.topic : current.topic
      const host = 'host' in body ? body.host : current.host
      if (becameCancelled) {
        await db`INSERT INTO notifications (kind, title, body) VALUES ('cancel', 'Cancellation pushed to registered students', ${`${count} student(s) notified via push + WhatsApp that "${topic}" has been cancelled. The session is no longer visible in the app.`})`
        await db`INSERT INTO notifications (kind, title, body) VALUES ('alert', 'Internal faculty alert', ${`${host} notified: their session "${topic}" was cancelled.`})`
      } else if (restored) {
        await db`INSERT INTO notifications (kind, title, body) VALUES ('reminder', 'Session restored', ${`"${topic}" is back on the schedule and visible in the app again.`})`
      } else if ('startAt' in body && new Date(body.startAt) <= new Date()) {
        // Pulled forward to now ("Go live now") — that's a go-live announcement, not a reschedule
        await db`INSERT INTO notifications (kind, title, body) VALUES ('reminder', 'Go-live push sent', ${`${count} registered student(s) notified via push + WhatsApp: "${topic}" is live now — join in!`})`
      } else {
        await db`INSERT INTO notifications (kind, title, body) VALUES ('cancel', 'Reschedule pushed to registered students', ${`${count} student(s) notified via push + WhatsApp of the new date/time for "${topic}".`})`
        await db`INSERT INTO notifications (kind, title, body) VALUES ('alert', 'Internal faculty alert', ${`${host} notified of the reschedule for "${topic}".`})`
      }
    }

    const [updated] = await db`SELECT * FROM sessions WHERE id = ${id}`
    return res.status(200).json(serializeSession(updated))
  }

  res.status(405).json({ error: 'Method not allowed' })
}
