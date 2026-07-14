import { sql } from '../../_lib/db.js'
import { DEMO_STUDENT_KEY } from '../../_lib/constants.js'

// Demo-only: this prototype has no real second user, so the interactive student
// advances their invited friends' status themselves to see the reward mechanic play out.
const NEXT = { invited: 'registered', registered: 'attended' }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const db = sql()
  const id = Number(req.query.id)

  const [referral] = await db`SELECT * FROM referrals WHERE id = ${id} AND referrer_key = ${DEMO_STUDENT_KEY}`
  if (!referral) return res.status(404).json({ error: 'Referral not found' })

  const to = NEXT[referral.status]
  if (!to) return res.status(409).json({ error: 'Friend has already reached the final stage' })

  if (to === 'registered') {
    await db`UPDATE referrals SET status = 'registered', registered_at = now() WHERE id = ${id}`
  } else {
    await db`UPDATE referrals SET status = 'attended', attended_at = now() WHERE id = ${id}`
  }

  res.status(200).json({ ok: true, status: to })
}
