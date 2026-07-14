import { sql } from '../../_lib/db.js'

// Marketing uploads a downloadable resource (PDF) for a session's "Resources" section.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { title } = req.body || {}
  if (!title || !title.trim()) return res.status(400).json({ error: 'title is required' })

  const db = sql()
  const id = Number(req.query.id)

  const [session] = await db`SELECT id FROM sessions WHERE id = ${id}`
  if (!session) return res.status(404).json({ error: 'Session not found' })

  const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
  const [row] = await db`
    INSERT INTO resources (session_id, title, url)
    VALUES (${id}, ${title.trim()}, ${`/resources/${id}-${slug}.pdf`})
    RETURNING id, title, url
  `
  res.status(201).json(row)
}
