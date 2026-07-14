import { sql } from './_lib/db.js'
import { DEMO_STUDENT_KEY } from './_lib/constants.js'

// Single consolidated function for all referral mutations (kept in one file, dispatched
// by `op`, to stay under the Vercel Hobby plan's 12-serverless-function cap). Reads go
// through /api/state's aggregate hydrate like everything else in this app.
const MAX_FRIENDS = 3
const REQUIRED_FRIENDS = 3
// Demo-only: this prototype has no real second user, so the interactive student advances
// their invited friends' status themselves to see the reward mechanic play out.
const NEXT_STAGE = { invited: 'registered', registered: 'attended' }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const db = sql()
  const { op } = req.body || {}

  if (op === 'invite') {
    const { friendName } = req.body || {}
    if (!friendName || !friendName.trim()) return res.status(400).json({ error: 'friendName is required' })

    const [{ count }] = await db`SELECT COUNT(*)::int AS count FROM referrals WHERE referrer_key = ${DEMO_STUDENT_KEY}`
    if (count >= MAX_FRIENDS) return res.status(409).json({ error: `You can invite up to ${MAX_FRIENDS} friends for this reward` })

    await db`INSERT INTO referrals (referrer_key, friend_name, status) VALUES (${DEMO_STUDENT_KEY}, ${friendName.trim()}, 'invited')`
    return res.status(200).json({ ok: true })
  }

  if (op === 'advance') {
    const { id } = req.body || {}
    const [referral] = await db`SELECT status FROM referrals WHERE id = ${id} AND referrer_key = ${DEMO_STUDENT_KEY}`
    if (!referral) return res.status(404).json({ error: 'Referral not found' })

    const to = NEXT_STAGE[referral.status]
    if (!to) return res.status(409).json({ error: 'Friend has already reached the final stage' })

    if (to === 'registered') {
      await db`UPDATE referrals SET status = 'registered', registered_at = now() WHERE id = ${id}`
    } else {
      await db`UPDATE referrals SET status = 'attended', attended_at = now() WHERE id = ${id}`
    }
    return res.status(200).json({ ok: true, status: to })
  }

  if (op === 'claim') {
    const { rewardType } = req.body || {}
    if (rewardType !== 'test' && rewardType !== 'video') return res.status(400).json({ error: 'rewardType must be "test" or "video"' })

    const [already] = await db`SELECT reward_type FROM referral_rewards WHERE student_key = ${DEMO_STUDENT_KEY}`
    if (already) return res.status(409).json({ error: 'Reward already claimed', rewardType: already.reward_type })

    const [{ count }] = await db`SELECT COUNT(*)::int AS count FROM referrals WHERE referrer_key = ${DEMO_STUDENT_KEY} AND status = 'attended'`
    if (count < REQUIRED_FRIENDS) return res.status(409).json({ error: `Need ${REQUIRED_FRIENDS} friends to attend a session first` })

    await db`INSERT INTO referral_rewards (student_key, reward_type) VALUES (${DEMO_STUDENT_KEY}, ${rewardType})`
    return res.status(200).json({ ok: true, rewardType })
  }

  return res.status(400).json({ error: 'Invalid op' })
}
