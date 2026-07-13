import { P, PL, PB, PD, G, GL, GB, T1, T2, T3, BD, BG2, StatusBar, ctaFor } from './shared'

const LockIcon = ({ color = T3, size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)
const PlayIcon = ({ color = 'white', size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><polygon points="5,3 19,12 5,21"/></svg>
)

export function WebinarCard({ session, isRegistered, isPaidUser, onOpen }) {
  const cta = ctaFor(session, isRegistered)
  const isLocked = session.status === 'completed' && !isPaidUser

  const ctaStyle = {
    cancelled:  { bg: BG2, color: T3, border: BD },
    completed:  isLocked ? { bg: '#FFF8E7', color: '#8D6E63', border: '#FFE082' } : { bg: GL, color: G, border: GB },
    live:       { bg: '#FF6B6B', color: 'white', border: '#FF6B6B' },
    registered: { bg: GL, color: G, border: GB },
    scheduled:  { bg: PL, color: PD, border: PB },
  }[cta.tone]

  return (
    <button
      onClick={() => onOpen(session)}
      disabled={session.status === 'cancelled'}
      style={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10, background: 'white', border: `1.5px solid ${session.status === 'live' ? '#FF6B6B' : BD}`, borderRadius: 14, padding: '13px 14px', marginBottom: 10, cursor: session.status === 'cancelled' ? 'default' : 'pointer', opacity: session.status === 'cancelled' ? 0.7 : 1 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: T3, fontWeight: 500 }}>{session.dateLabel} · {session.timeLabel}</span>
        {session.status === 'live' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#FF6B6B' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF6B6B', boxShadow: '0 0 0 2px rgba(255,107,107,0.4)', animation: 'livePulse 1.4s ease-in-out infinite' }} />
            LIVE NOW
          </span>
        )}
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T1, lineHeight: 1.4, marginBottom: 4 }}>{session.topic}</div>
        <div style={{ fontSize: 11, color: T2 }}>
          Hosted by {session.host}
          {session.topperName && <> · with <span style={{ fontWeight: 600, color: PD }}>{session.topperName}</span> ({session.topperRank})</>}
        </div>
      </div>

      {session.status === 'cancelled' && session.cancelledReason && (
        <div style={{ fontSize: 11, color: '#791F1F', background: '#FCEBEB', border: '1px solid #F09595', borderRadius: 8, padding: '6px 10px' }}>{session.cancelledReason}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: ctaStyle.bg, color: ctaStyle.color, border: `1px solid ${ctaStyle.border}` }}>
          {cta.tone === 'live' && <PlayIcon />}
          {isLocked && <LockIcon color={ctaStyle.color} />}
          {isLocked ? 'Locked · Upgrade' : cta.label}
        </span>
      </div>
    </button>
  )
}

const UPCOMING_STATUS_PRIORITY = { live: 0, scheduled: 1, cancelled: 2 }

export default function WebinarTab({ sessions, registeredWebinarIds, isPaidUser, toggleIsPaidUser, webinarDiscountPct, programCap, openWebinar, onExit }) {
  const upcoming = sessions.filter(s => s.status === 'scheduled' || s.status === 'live' || s.status === 'cancelled')
    .sort((a, b) => {
      // Live-now and soon-to-happen sessions must outrank a cancelled session even if that
      // cancelled session's original date has already passed (negative daysOut would otherwise sort it first).
      const pa = UPCOMING_STATUS_PRIORITY[a.status], pb = UPCOMING_STATUS_PRIORITY[b.status]
      return pa !== pb ? pa - pb : a.daysOut - b.daysOut
    })
  const past = sessions.filter(s => s.status === 'completed')
    .sort((a, b) => b.daysOut - a.daysOut) // most recent (closest to 0) first

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
        <span style={{ fontSize: 17, fontWeight: 700, color: T1 }}>Webinars</span>
        <button style={{ background: 'none', border: 'none', color: T2, display: 'flex' }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        </button>
      </div>

      <div style={{ flexShrink: 0, padding: '10px 16px', borderBottom: `1px solid ${BD}` }}>
        {webinarDiscountPct >= programCap ? (
          <div style={{ width: '100%', background: `linear-gradient(135deg, ${PD}, ${P})`, border: 'none', borderRadius: 12, padding: '12px 14px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>You've unlocked {programCap}% off — view paid plans</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        ) : (
          <div style={{ background: PL, border: `1px solid ${PB}`, borderRadius: 12, padding: '11px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: PD }}>Webinar discount earned</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: PD }}>{webinarDiscountPct}%<span style={{ fontSize: 11, fontWeight: 500, opacity: 0.7 }}> / {programCap}%</span></span>
            </div>
            <div style={{ height: 6, background: 'white', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: 6, width: `${(webinarDiscountPct / programCap) * 100}%`, background: P, borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}
      </div>

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 24px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T2, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upcoming</div>
        {upcoming.length === 0 && <div style={{ fontSize: 12, color: T3, marginBottom: 20 }}>No upcoming sessions scheduled.</div>}
        {upcoming.map(s => (
          <WebinarCard key={s.id} session={s} isRegistered={registeredWebinarIds.has(s.id)} isPaidUser={isPaidUser} onOpen={openWebinar} />
        ))}

        <div style={{ fontSize: 12, fontWeight: 600, color: T2, margin: '18px 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Past</div>
        {past.length === 0 && <div style={{ fontSize: 12, color: T3 }}>No past sessions yet.</div>}
        {past.map(s => (
          <WebinarCard key={s.id} session={s} isRegistered={registeredWebinarIds.has(s.id)} isPaidUser={isPaidUser} onOpen={openWebinar} />
        ))}
      </div>
    </div>
  )
}
