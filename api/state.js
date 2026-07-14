import { sql } from './_lib/db.js'
import { serializeSession } from './_lib/serialize.js'
import { getOrCreateReferralCode } from './_lib/referral.js'
import { DISCOUNT_PER_ACTION, SESSION_DISCOUNT_CAP, PROGRAM_DISCOUNT_CAP, DEMO_STUDENT_KEY } from './_lib/constants.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const db = sql()
  const [sessions, registrations, demoRegistrations, actions, notifications, shares, unlocks, resources, referralCode, referrals, referralReward] = await Promise.all([
    db`SELECT * FROM sessions ORDER BY id`,
    db`SELECT * FROM registrations ORDER BY registered_at`,
    db`SELECT session_id, mid_session FROM registrations WHERE student_key = ${DEMO_STUDENT_KEY}`,
    db`SELECT * FROM actions WHERE student_key = ${DEMO_STUDENT_KEY}`,
    db`SELECT kind, title, body, created_at FROM notifications ORDER BY created_at ASC`,
    db`SELECT session_id FROM shares WHERE student_key = ${DEMO_STUDENT_KEY}`,
    db`SELECT session_id FROM unlocked_recordings WHERE student_key = ${DEMO_STUDENT_KEY}`,
    db`SELECT id, session_id, title, url FROM resources ORDER BY id`,
    getOrCreateReferralCode(db, DEMO_STUDENT_KEY),
    db`SELECT id, friend_name, status FROM referrals WHERE referrer_key = ${DEMO_STUDENT_KEY} ORDER BY id`,
    db`SELECT reward_type, claimed_at FROM referral_rewards WHERE student_key = ${DEMO_STUDENT_KEY}`,
  ])

  const registrantsBySession = {}
  for (const r of registrations) {
    (registrantsBySession[r.session_id] ??= []).push(r)
  }

  const resourcesBySession = {}
  for (const r of resources) {
    (resourcesBySession[r.session_id] ??= []).push(r)
  }

  const registeredSessionIds = demoRegistrations.map(r => r.session_id)
  const midSessionIds = demoRegistrations.filter(r => r.mid_session).map(r => r.session_id)

  const actionsBySession = {}
  for (const a of actions) {
    actionsBySession[a.session_id] = {
      studyMaterial: a.study_material,
      liveAttendance: a.live_attendance,
      quiz: a.quiz,
    }
  }

  const discountPct = Math.min(
    PROGRAM_DISCOUNT_CAP,
    Object.values(actionsBySession).reduce((sum, a) => {
      const earned = [a.studyMaterial, a.liveAttendance, a.quiz].filter(Boolean).length * DISCOUNT_PER_ACTION
      return sum + Math.min(SESSION_DISCOUNT_CAP, earned)
    }, 0)
  )

  res.status(200).json({
    sessions: sessions.map(s => serializeSession(s, registrantsBySession[s.id] || [], resourcesBySession[s.id] || [])),
    registeredSessionIds,
    midSessionIds,
    actionsBySession,
    discountPct,
    programCap: PROGRAM_DISCOUNT_CAP,
    // Share-to-unlock: each shared session banks one credit; each credit opens one locked recording
    shareCredits: shares.length - unlocks.length,
    sharedSessionIds: shares.map(r => r.session_id),
    unlockedSessionIds: unlocks.map(r => r.session_id),
    notifications: notifications.map(n => ({
      kind: n.kind,
      title: n.title,
      body: n.body,
      time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })),
    // Referral program: invite 3 friends, each registers + attends 50%+ of a session,
    // then the referrer picks a free test or a free video.
    referralCode,
    referrals: referrals.map(r => ({ id: r.id, friendName: r.friend_name, status: r.status })),
    referralReward: referralReward.length ? { type: referralReward[0].reward_type, claimedAt: referralReward[0].claimed_at } : null,
  })
}
