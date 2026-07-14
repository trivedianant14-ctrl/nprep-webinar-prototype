import { sql } from '../_lib/db.js'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' })

  const db = sql()
  await db`DELETE FROM resources WHERE id = ${Number(req.query.rid)}`
  res.status(200).json({ ok: true })
}
