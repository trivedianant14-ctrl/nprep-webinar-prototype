import { useEffect, useState } from 'react'
import { P, PL, PB, PD, G, GL, GB, T1, T2, T3, BD, BG2, StatusBar, ctaFor, fmtWhen, countdown, liveViewers, Thumb, LevelTrack } from './shared'

const LockIcon = ({ color = 'white', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)

function EducatorRow({ session }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: `linear-gradient(135deg, ${PD}, #6B96F8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 11, flexShrink: 0 }}>
        {(session.topperName || session.host)[0]}
      </div>
      <span style={{ fontSize: 11, color: T2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {session.topperName
          ? <><b style={{ color: T1 }}>{session.topperName}</b> · {session.topperRank} · with {session.host}</>
          : <><b style={{ color: T1 }}>{session.host}</b> · NPrep Faculty</>}
      </span>
    </div>
  )
}

// Live hero — thumbnail with LIVE pill + viewer count, title on the scrim, red CTA
function LiveCard({ session, onOpen }) {
  return (
    <button onClick={() => onOpen(session)} style={{ width: '100%', textAlign: 'left', background: 'white', border: 'none', borderRadius: 16, overflow: 'hidden', marginBottom: 12, cursor: 'pointer', boxShadow: '0 4px 18px rgba(14,30,66,0.14)', padding: 0 }}>
      <Thumb session={session}>
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#FF3B5C', color: 'white', fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 6, letterSpacing: '0.04em' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'white', animation: 'livePulse 1.4s ease-in-out infinite' }} />
            LIVE
          </span>
          <span style={{ background: 'rgba(6,12,35,0.65)', color: 'white', fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 6 }}>
            👁 {liveViewers(session)} watching
          </span>
        </div>
        <div style={{ position: 'absolute', left: 12, right: 12, bottom: 10 }}>
          <div style={{ color: 'white', fontSize: 14.5, fontWeight: 800, lineHeight: 1.35, textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>{session.topic}</div>
        </div>
      </Thumb>
      <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}><EducatorRow session={session} /></div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FF3B5C', color: 'white', fontSize: 12, fontWeight: 800, padding: '8px 16px', borderRadius: 20, flexShrink: 0, boxShadow: '0 3px 10px rgba(255,59,92,0.35)' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
          Join Now
        </span>
      </div>
    </button>
  )
}

// Upcoming — countdown chip on the thumbnail, Register / Registered CTA.
// Paid-only sessions show a PRO badge; freemium gets an Upgrade CTA instead of Register.
function UpcomingCard({ session, isRegistered, isPaidUser, onOpen, tick }) {
  const cd = countdown(session.startAt)
  const proLocked = session.paidOnly && !isPaidUser
  return (
    <button onClick={() => onOpen(session)} style={{ width: '100%', textAlign: 'left', background: 'white', border: `1px solid ${proLocked ? '#FFE082' : BD}`, borderRadius: 16, overflow: 'hidden', marginBottom: 12, cursor: 'pointer', padding: 0 }}>
      <Thumb session={session}>
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          <span style={{ background: 'rgba(6,12,35,0.7)', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 6 }}>
            ⏳ Starts in {cd || 'moments'}
          </span>
          {session.paidOnly && (
            <span style={{ background: 'linear-gradient(90deg,#FFB020,#FF8A00)', color: 'white', fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 6, letterSpacing: '0.03em' }}>👑 PRO</span>
          )}
        </div>
        <div style={{ position: 'absolute', left: 12, right: 12, bottom: 10 }}>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: 600, marginBottom: 3 }}>{fmtWhen(session.startAt, session.endAt)}</div>
          <div style={{ color: 'white', fontSize: 14.5, fontWeight: 800, lineHeight: 1.35, textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>{session.topic}</div>
        </div>
      </Thumb>
      <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}><EducatorRow session={session} /></div>
        {proLocked ? (
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#8a5200', background: '#FFF4E0', border: '1px solid #FFE0AD', padding: '7px 14px', borderRadius: 20, flexShrink: 0 }}>🔒 Members only</span>
        ) : isRegistered ? (
          <span style={{ fontSize: 11.5, fontWeight: 800, color: G, background: GL, border: `1px solid ${GB}`, padding: '7px 14px', borderRadius: 20, flexShrink: 0 }}>Registered ✓</span>
        ) : (
          <span style={{ fontSize: 12, fontWeight: 800, color: 'white', background: P, padding: '8px 18px', borderRadius: 20, flexShrink: 0, boxShadow: '0 3px 10px rgba(29,91,240,0.35)' }}>Register</span>
        )}
      </div>
    </button>
  )
}

// Past recording — play overlay + duration chip; lock scrim for freemium
// unless they've spent a share-earned credit on this one.
function PastCard({ session, isPaidUser, isUnlocked, onOpen }) {
  const mins = Math.round((new Date(session.endAt) - new Date(session.startAt)) / 6e4)
  const locked = !isPaidUser && !isUnlocked
  return (
    <button onClick={() => onOpen(session)} style={{ width: '100%', textAlign: 'left', background: 'white', border: `1px solid ${BD}`, borderRadius: 14, overflow: 'hidden', marginBottom: 10, cursor: 'pointer', padding: 0, display: 'flex' }}>
      <div style={{ width: 132, flexShrink: 0 }}>
        <Thumb session={session} aspect="16/10">
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: locked ? 'rgba(6,12,35,0.75)' : 'rgba(255,255,255,0.22)', border: '1.5px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {locked ? <LockIcon size={13} /> : <svg width="12" height="12" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}><polygon points="5,3 19,12 5,21"/></svg>}
            </div>
          </div>
          <span style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(6,12,35,0.75)', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>{mins}m</span>
        </Thumb>
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T1, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{session.topic}</div>
        <div style={{ fontSize: 10, color: T3 }}>
          {(session.topperName || session.host)} · {new Date(session.startAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: locked ? '#B96A00' : G }}>
          {locked ? '🔒 Recording · Upgrade to watch' : isUnlocked && !isPaidUser ? '🔓 Unlocked with credit · Watch' : '▶ Watch recording'}
        </span>
      </div>
    </button>
  )
}

export default function WebinarTab({ sessions, registeredWebinarIds, isPaidUser, toggleIsPaidUser, webinarDiscountPct, programCap, shareCredits, unlockedSessionIds, openWebinar, onExit }) {
  // Re-render every 30s so countdown chips stay honest between server polls.
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const live = sessions.filter(s => s.status === 'live')
  // One upcoming at a time (live-class platform pattern): show the next session only;
  // each registration reveals the one after it. Cancelled sessions never appear —
  // students hear about those via push + WhatsApp instead.
  const scheduled = sessions.filter(s => s.status === 'scheduled')
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
  const visibleUpcoming = []
  for (const s of scheduled) {
    visibleUpcoming.push(s)
    // A members-only session a freemium user can't register for shouldn't dead-end the
    // reveal chain — keep going so the next registerable session still surfaces.
    const blocksChain = !registeredWebinarIds.has(s.id) && !(s.paidOnly && !isPaidUser)
    if (blocksChain) break
  }
  const past = sessions.filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.endAt) - new Date(a.endAt))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <StatusBar />

      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px', background: BG2, borderBottom: `1px solid ${BD}` }}>
        <button onClick={onExit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T2, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
          Home
        </button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', background: 'white', border: `1px solid ${BD}`, borderRadius: 20, padding: 3, gap: 2 }}>
            <button onClick={() => isPaidUser && toggleIsPaidUser()} style={{ padding: '4px 14px', borderRadius: 16, fontSize: 11, fontWeight: 600, background: !isPaidUser ? P : 'transparent', color: !isPaidUser ? 'white' : T3, border: 'none', cursor: 'pointer' }}>Freemium</button>
            <button onClick={() => !isPaidUser && toggleIsPaidUser()} style={{ padding: '4px 14px', borderRadius: 16, fontSize: 11, fontWeight: 600, background: isPaidUser ? P : 'transparent', color: isPaidUser ? 'white' : T3, border: 'none', cursor: 'pointer' }}>Paid</button>
          </div>
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <span style={{ fontSize: 17, fontWeight: 800, color: T1 }}>Webinars</span>
        <button style={{ background: 'none', border: 'none', color: T2, display: 'flex' }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        </button>
      </div>

      {/* Reward track — freemium only. Paid members already converted, so no upgrade
          mechanic is shown to them (the PRD's discount is a freemium→paid lever). */}
      {!isPaidUser && (
        <div style={{ flexShrink: 0, padding: '10px 16px', borderBottom: `1px solid ${BD}` }}>
          {webinarDiscountPct >= programCap ? (
            <div style={{ width: '100%', background: `linear-gradient(135deg, ${PD}, ${P})`, border: 'none', borderRadius: 14, padding: '12px 14px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>🎁 {programCap}% off unlocked — view paid plans</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          ) : (
            <div style={{ background: `linear-gradient(180deg, ${PL} 0%, #F7FAFF 100%)`, border: `1px solid ${PB}`, borderRadius: 14, padding: '11px 13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: PD }}>🎁 Webinar Rewards</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {shareCredits > 0 && (
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: '#8a5200', background: '#FFF4E0', border: '1px solid #FFE0AD', padding: '2px 8px', borderRadius: 12 }}>🔓 {shareCredits} unlock</span>
                  )}
                  <span style={{ fontSize: 12, fontWeight: 800, color: PD }}>{webinarDiscountPct}%<span style={{ fontSize: 10, fontWeight: 600, opacity: 0.65 }}> / {programCap}% off</span></span>
                </span>
              </div>
              <LevelTrack pct={webinarDiscountPct} cap={programCap} />
              <div style={{ fontSize: 9.5, color: T2, marginTop: 8 }}>+5% each — finish the study material, attend live & clear the quiz · share a session to earn recording unlocks</div>
            </div>
          )}
        </div>
      )}

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 24px' }}>
        {live.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: T2, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Happening Now</div>
            {live.map(s => <LiveCard key={s.id} session={s} onOpen={openWebinar} />)}
          </>
        )}

        {visibleUpcoming.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: T2, margin: `${live.length ? 8 : 0}px 0 10px`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Up Next</div>
            {visibleUpcoming.map(s => (
              <UpcomingCard key={s.id} session={s} isRegistered={registeredWebinarIds.has(s.id)} isPaidUser={isPaidUser} onOpen={openWebinar} tick={tick} />
            ))}
          </>
        )}
        {live.length === 0 && visibleUpcoming.length === 0 && (
          <div style={{ fontSize: 12, color: T3, marginBottom: 20 }}>No upcoming sessions — we'll notify you when the next one is scheduled.</div>
        )}

        {past.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: T2, margin: '18px 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Past Sessions & Recordings</div>
            {past.map(s => <PastCard key={s.id} session={s} isPaidUser={isPaidUser} isUnlocked={unlockedSessionIds.has(s.id)} onOpen={openWebinar} />)}
          </>
        )}
      </div>
    </div>
  )
}
