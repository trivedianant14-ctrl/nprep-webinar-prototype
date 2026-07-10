import { sql } from '../_lib/db.js'
import { serializeSession } from '../_lib/serialize.js'

const FIELD_MAP = {
  host: 'host', topperName: 'topper_name', topperRank: 'topper_rank', topic: 'topic',
  dateLabel: 'date_label', timeLabel: 'time_label', youtubeEmbedId: 'youtube_embed_id',
  studyMaterialUrl: 'study_material_url', recordingUrl: 'recording_url',
  cancelledReason: 'cancelled_reason', status: 'status',
}

export default async function handler(req, res) {
  const db = sql()
  const id = Number(req.query.id)

  if (req.method === 'PATCH') {
    const [current] = await db`SELECT * FROM sessions WHERE id = ${id}`
    if (!current) return res.status(404).json({ error: 'Session not found' })

    const body = req.body || {}
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

    // Server-authoritative notification triggers — computed off the real before/after
    // values in the DB, so a no-op edit (focus + blur, no change) never fires a false alert.
    const becameCancelled = 'status' in body && body.status === 'cancelled' && current.status !== 'cancelled'
    const rescheduled = !becameCancelled && (
      ('dateLabel' in body && body.dateLabel !== current.date_label) ||
      ('timeLabel' in body && body.timeLabel !== current.time_label)
    )

    if (becameCancelled || rescheduled) {
      const [{ count }] = await db`SELECT COUNT(*)::int AS count FROM registrations WHERE session_id = ${id}`
      const topic = 'topic' in body ? body.topic : current.topic
      const host = 'host' in body ? body.host : current.host
      if (becameCancelled) {
        await db`INSERT INTO notifications (kind, title, body) VALUES ('cancel', 'Cancellation pushed to registered students', ${`${count} student(s) notified that "${topic}" has been cancelled.`})`
        await db`INSERT INTO notifications (kind, title, body) VALUES ('alert', 'Internal faculty alert', ${`${host} notified: their session "${topic}" was cancelled.`})`
      } else {
        await db`INSERT INTO notifications (kind, title, body) VALUES ('cancel', 'Reschedule pushed to registered students', ${`${count} student(s) notified of the new date/time for "${topic}".`})`
        await db`INSERT INTO notifications (kind, title, body) VALUES ('alert', 'Internal faculty alert', ${`${host} notified of the reschedule for "${topic}".`})`
      }
    }

    const [updated] = await db`SELECT * FROM sessions WHERE id = ${id}`
    return res.status(200).json(serializeSession(updated))
  }

  res.status(405).json({ error: 'Method not allowed' })
}
