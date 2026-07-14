import { sql } from '../_lib/db.js'
import { DEMO_STUDENT_KEY } from '../_lib/constants.js'

const REQUIRED_FRIENDS = 3

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { rewardType } = req.body || {}
  if (rewardType !== 'test' && rewardType !== 'video') return res.status(400).json({ error: 'rewardType must be "test" or "video"' })

  const db = sql()
  const [already] = await db`SELECT reward_type FROM referral_rewards WHERE student_key = ${DEMO_STUDENT_KEY}`
  if (already) return res.status(409).json({ error: 'Reward already claimed', rewardType: already.reward_type })

  const [{ count }] = await db`SELECT COUNT(*)::int AS count FROM referrals WHERE referrer_key = ${DEMO_STUDENT_KEY} AND status = 'attended'`
  if (count < REQUIRED_FRIENDS) return res.status(409).json({ error: `Need ${REQUIRED_FRIENDS} friends to attend a session first` })

  await db`INSERT INTO referral_rewards (student_key, reward_type) VALUES (${DEMO_STUDENT_KEY}, ${rewardType})`
  res.status(200).json({ ok: true, rewardType })
}
