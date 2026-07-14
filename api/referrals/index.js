import { sql } from '../_lib/db.js'
import { DEMO_STUDENT_KEY } from '../_lib/constants.js'
import { getOrCreateReferralCode } from '../_lib/referral.js'

const MAX_FRIENDS = 3

export default async function handler(req, res) {
  const db = sql()

  if (req.method === 'GET') {
    const code = await getOrCreateReferralCode(db, DEMO_STUDENT_KEY)
    const referrals = await db`SELECT * FROM referrals WHERE referrer_key = ${DEMO_STUDENT_KEY} ORDER BY id`
    const [reward] = await db`SELECT reward_type, claimed_at FROM referral_rewards WHERE student_key = ${DEMO_STUDENT_KEY}`
    return res.status(200).json({
      code,
      referrals: referrals.map(r => ({ id: r.id, friendName: r.friend_name, status: r.status })),
      reward: reward ? { type: reward.reward_type, claimedAt: reward.claimed_at } : null,
    })
  }

  if (req.method === 'POST') {
    const { friendName } = req.body || {}
    if (!friendName || !friendName.trim()) return res.status(400).json({ error: 'friendName is required' })

    const [{ count }] = await db`SELECT COUNT(*)::int AS count FROM referrals WHERE referrer_key = ${DEMO_STUDENT_KEY}`
    if (count >= MAX_FRIENDS) return res.status(409).json({ error: `You can invite up to ${MAX_FRIENDS} friends for this reward` })

    await db`INSERT INTO referrals (referrer_key, friend_name, status) VALUES (${DEMO_STUDENT_KEY}, ${friendName.trim()}, 'invited')`
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
