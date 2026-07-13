import { useState } from 'react'
import { P, PL, PB, PD, G, GL, GB, A, AL, AB, T1, T2, T3, BD, BG2, StatusBar, BackHeader } from './shared'

// Test Series flow — frontend-only demo data (the persistent backend covers the webinar
// journey, which is this prototype's actual PRD scope; tests exist for homepage parity).
const LIVE_TEST = {
  id: 100, name: 'NORCET 10 — Stage I Grand Mock', timeLabel: 'Today, 3:00 PM – 4:30 PM',
  duration: '90 min', marks: 100, enrolled: 2847,
}

const UPCOMING_TESTS = [
  { id: 101, name: 'Fundamentals of Nursing Preboard', sub: 'FON · Subject Preboard', date: 'Sat, 18 Jul', duration: '60 min', marks: 100, enrolled: 743 },
  { id: 102, name: 'Medical Surgical Nursing Preboard', sub: 'MSN · Subject Preboard', date: 'Wed, 22 Jul', duration: '60 min', marks: 100, enrolled: 1203 },
  { id: 103, name: 'NASHTA 4 — Full Mock', sub: 'Full-length NORCET simulation', date: 'Sat, 26 Jul', duration: '120 min', marks: 200, enrolled: 3241 },
]

const PAST_TESTS = [
  { id: 110, name: 'NASHTA 3 — Full Mock', date: '5 Jul 2026', score: '158/200', attempted: true },
  { id: 111, name: 'Community Health Nursing Preboard', date: '29 Jun 2026', score: '74/100', attempted: true },
  { id: 112, name: 'Pediatric Nursing Preboard', date: '13 Jun 2026', score: null, attempted: false },
]

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
)
const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
)

export default function Tests({ onBack }) {
  const [registeredIds, setRegisteredIds] = useState(() => new Set())
  const [joined, setJoined] = useState(false)

  if (joined) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <BackHeader onBack={() => setJoined(false)} title={LIVE_TEST.name} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: GL, border: `1.5px solid ${GB}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: T1, marginBottom: 8 }}>You're in — best of luck! 🍀</div>
          <div style={{ fontSize: 12, color: T2, lineHeight: 1.6, maxWidth: 260 }}>
            The full test-taking interface (question palette, timer, OMR-style navigation) lives in the QBank prototype — this flow stops at the join step by design.
          </div>
          <button onClick={() => setJoined(false)} className="btn-primary" style={{ marginTop: 20, padding: '10px 26px', fontSize: 13 }}>Back to Tests</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <StatusBar />
      <BackHeader onBack={onBack} title="Test Series" />

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 24px' }}>

        {/* Live now hero */}
        <div style={{ fontSize: 12, fontWeight: 600, color: T2, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Now</div>
        <div style={{ background: `linear-gradient(135deg, ${P} 0%, ${PD} 100%)`, borderRadius: 14, padding: '16px 15px 14px', marginBottom: 20, boxShadow: '0 4px 16px rgba(83,74,183,0.28)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.18)', color: 'white' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF6B6B', animation: 'livePulse 1.4s ease-in-out infinite' }} />
              LIVE
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)' }}>{LIVE_TEST.timeLabel}</span>
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: 'white', marginBottom: 10, lineHeight: 1.4 }}>{LIVE_TEST.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 13, color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ClockIcon />{LIVE_TEST.duration}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><StarIcon />{LIVE_TEST.marks} Marks</span>
            <span>{LIVE_TEST.enrolled.toLocaleString()} joined</span>
          </div>
          <button onClick={() => setJoined(true)} style={{ width: '100%', padding: 12, borderRadius: 10, background: 'white', color: P, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Join Now
          </button>
        </div>

        {/* Upcoming */}
        <div style={{ fontSize: 12, fontWeight: 600, color: T2, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upcoming</div>
        {UPCOMING_TESTS.map(t => {
          const isReg = registeredIds.has(t.id)
          return (
            <div key={t.id} style={{ background: 'white', border: `1px solid ${BD}`, borderRadius: 12, padding: '13px 14px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#1A56B0', background: '#EDF4FF', border: '1px solid #93B8F0', padding: '2px 9px', borderRadius: 20 }}>{t.date}</span>
                <span style={{ fontSize: 11, color: T3 }}>{(isReg ? t.enrolled + 1 : t.enrolled).toLocaleString()} registered</span>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: T1, lineHeight: 1.4 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: T3, marginBottom: 9 }}>{t.sub}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: T2 }}><ClockIcon />{t.duration}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: T2 }}><StarIcon />{t.marks} Marks</span>
                <button
                  onClick={() => !isReg && setRegisteredIds(prev => new Set(prev).add(t.id))}
                  style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: isReg ? 'default' : 'pointer', background: isReg ? GL : PL, color: isReg ? G : PD, border: `1px solid ${isReg ? GB : PB}` }}>
                  {isReg ? '✓ Registered' : 'Register'}
                </button>
              </div>
            </div>
          )
        })}

        {/* Past */}
        <div style={{ fontSize: 12, fontWeight: 600, color: T2, margin: '18px 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Past</div>
        {PAST_TESTS.map(t => (
          <div key={t.id} style={{ background: t.attempted ? 'white' : AL, border: `1px solid ${t.attempted ? BD : AB}`, borderRadius: 12, padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.attempted ? T1 : A }}>{t.name}</div>
              <div style={{ fontSize: 10.5, color: t.attempted ? T3 : A, opacity: t.attempted ? 1 : 0.7, marginTop: 2 }}>{t.date}</div>
            </div>
            {t.attempted ? (
              <>
                <span style={{ fontSize: 12, fontWeight: 800, color: G }}>{t.score}</span>
                <button className="btn-sm-outline" style={{ flexShrink: 0 }}>Result</button>
              </>
            ) : (
              <span style={{ fontSize: 10, fontWeight: 700, color: A, background: 'white', border: `1px solid ${AB}`, padding: '3px 10px', borderRadius: 20, flexShrink: 0 }}>Missed</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
