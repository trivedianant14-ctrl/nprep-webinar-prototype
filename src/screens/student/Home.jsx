import { useState } from 'react'
import { P, PD, G, GL, GB, R, RL, RB, T1, T2, T3, BD, StatusBar, ctaFor, fmtWhen } from './shared'

// Palette from the official app reference: royal-blue hero, orange PRO accents,
// white surface with pastel section cards, near-black ink for the community CTA.
const INK = '#0B1230'
const ORANGE = '#FF9E1B', ORANGE_D = '#B96A00'

const STORIES = [
  { label: 'For you', emoji: '🎯', ring: 'linear-gradient(135deg,#FF9E1B,#FF5E7E)' },
  { label: 'Toppers', emoji: '🏆', ring: 'linear-gradient(135deg,#1D5BF0,#7C3AED)', opensWebinars: true },
  { label: 'Study Tips', emoji: '💡', ring: 'linear-gradient(135deg,#00B8A9,#1D5BF0)' },
  { label: 'Jobs', emoji: '💼', ring: 'linear-gradient(135deg,#F5576C,#F093FB)' },
  { label: 'Courses', emoji: '📚', ring: 'linear-gradient(135deg,#FBBF24,#F59E0B)' },
]

const QOD = {
  question: 'Which of the following levels of care includes super-specialty hospitals like AIIMS?',
  options: ['Primary Care', 'Secondary Care', 'Tertiary Care', 'Home Care'],
  correct: 2,
}

export default function Home({ sessions, registeredWebinarIds, onOpenWebinarTab, onOpenTests, onOpenWebinar, onExit }) {
  // PRD P0 #2 — homepage banner shows the next Scheduled/Live session and disappears
  // automatically once it's Completed/Cancelled; CTA mirrors the webinar card state.
  const nextWebinar = sessions
    .filter(s => s.status === 'scheduled' || s.status === 'live')
    .sort((a, b) => (a.status === 'live' ? -1 : b.status === 'live' ? 1 : new Date(a.startAt) - new Date(b.startAt)))[0]
  const liveNow = sessions.some(s => s.status === 'live')
  const bannerCta = nextWebinar ? ctaFor(nextWebinar, registeredWebinarIds.has(nextWebinar.id)) : null

  const [picked, setPicked] = useState(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
      <StatusBar />

      {/* Top bar — hamburger (exit), GO PRO, search, coins */}
      <div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={onExit} title="All flows" style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', padding: 2 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="14" y2="18"/></svg>
        </button>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'linear-gradient(90deg,#FFB020,#FF8A00)', color: 'white', fontSize: 11, fontWeight: 800, padding: '5px 13px', borderRadius: 20, letterSpacing: '0.04em', boxShadow: '0 2px 8px rgba(255,138,0,0.35)' }}>
          ⚡ GO PRO
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, color: T1 }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FFF4E0', border: '1px solid #FFE0AD', borderRadius: 20, padding: '3px 10px', fontSize: 11.5, fontWeight: 800, color: ORANGE_D }}>🔥 0</span>
        </div>
      </div>

      {/* Story circles */}
      {/* inline flex overrides the .scroll class's flex:1 — the class is only wanted for its hidden scrollbar */}
      <div style={{ display: 'flex', flex: '0 0 auto', gap: 14, padding: '2px 16px 12px', overflowX: 'auto', overflowY: 'hidden', borderBottom: `1px solid ${BD}` }} className="scroll">
        {STORIES.map(s => (
          <button key={s.label} onClick={s.opensWebinars ? onOpenWebinarTab : undefined}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: s.opensWebinars ? 'pointer' : 'default', flexShrink: 0, padding: 0, position: 'relative' }}>
            <span style={{ width: 56, height: 56, borderRadius: '50%', background: s.ring, padding: 2.5, display: 'flex' }}>
              <span style={{ flex: 1, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.emoji}</span>
            </span>
            {s.opensWebinars && liveNow && (
              <span style={{ position: 'absolute', top: 0, right: 0, fontSize: 7.5, fontWeight: 800, color: 'white', background: '#FF3B5C', borderRadius: 8, padding: '1.5px 5px', border: '1.5px solid white' }}>LIVE</span>
            )}
            <span style={{ fontSize: 10, color: T2, fontWeight: 600 }}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Scrollable body */}
      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>

        {/* Hero — blue gradient; the webinar takes over this slot when one is scheduled/live (PRD P0 #2) */}
        <div style={{ margin: '14px 16px 0', borderRadius: 20, overflow: 'hidden', background: 'radial-gradient(120% 160% at 20% 0%, #3B79FF 0%, #1D5BF0 45%, #1233B8 100%)', padding: '18px 16px 16px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -20, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          {nextWebinar ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, position: 'relative' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.16)', color: 'white', fontSize: 9.5, fontWeight: 800, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.05em' }}>
                  {nextWebinar.status === 'live'
                    ? <><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF6B6B', animation: 'livePulse 1.4s ease-in-out infinite' }} />LIVE WEBINAR</>
                    : '🎤 TOPPER WEBINAR'}
                </span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>{fmtWhen(nextWebinar.startAt, nextWebinar.endAt)}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'white', fontSize: 16, fontWeight: 800, lineHeight: 1.35, marginBottom: 4 }}>{nextWebinar.topic}</div>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>
                    {nextWebinar.host}{nextWebinar.topperName ? ` · with ${nextWebinar.topperName}` : ''}
                  </div>
                </div>
                {nextWebinar.thumbnailUrl ? (
                  <img src={nextWebinar.thumbnailUrl} alt="" style={{ width: 86, height: 58, borderRadius: 12, objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.35)', flexShrink: 0 }} onError={e => { e.currentTarget.style.display = 'none' }} />
                ) : (
                  <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>👩‍⚕️</div>
                )}
              </div>
              <button onClick={() => onOpenWebinar(nextWebinar)}
                style={{ position: 'relative', width: '100%', marginTop: 14, padding: '12px', borderRadius: 26, background: nextWebinar.status === 'live' ? '#FF4D67' : '#3B79FF', border: '1px solid rgba(255,255,255,0.35)', color: 'white', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                {nextWebinar.status === 'live' && <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>}
                {bannerCta.label}
              </button>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', position: 'relative' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontSize: 17, fontWeight: 800, lineHeight: 1.4 }}>Your dream career is waiting. Let's start learning.</div>
                </div>
                <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, flexShrink: 0 }}>👩‍⚕️</div>
              </div>
              <button onClick={onOpenWebinarTab} style={{ position: 'relative', width: '100%', marginTop: 14, padding: '12px', borderRadius: 26, background: '#3B79FF', border: '1px solid rgba(255,255,255,0.35)', color: 'white', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                Start Learning
              </button>
            </>
          )}
        </div>

        {/* Question of the Day */}
        <div style={{ padding: '18px 16px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14.5, fontWeight: 800, color: INK }}>Question of the Day</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: ORANGE_D, background: '#FFF4E0', border: '1px solid #FFE0AD', padding: '2px 9px', borderRadius: 20 }}>Question Bank 🔥 +5</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T1, lineHeight: 1.5, marginBottom: 12 }}>{QOD.question}</div>
          {QOD.options.map((opt, i) => {
            const isCorrect = picked != null && i === QOD.correct
            const isWrongPick = picked === i && i !== QOD.correct
            return (
              <button key={opt} onClick={() => picked == null && setPicked(i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', marginBottom: 8, borderRadius: 12, textAlign: 'left', cursor: picked == null ? 'pointer' : 'default',
                  background: isCorrect ? GL : isWrongPick ? RL : 'white',
                  border: `1.5px solid ${isCorrect ? GB : isWrongPick ? RB : BD}` }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: isCorrect ? G : isWrongPick ? R : INK, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: isCorrect ? G : isWrongPick ? R : T1 }}>{opt}</span>
                {isCorrect && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 800, color: G }}>✓ Correct</span>}
              </button>
            )
          })}
          {picked != null && (
            <div style={{ fontSize: 11, color: T2, marginTop: 2 }}>
              {picked === QOD.correct ? 'Nice — +5 coins earned 🔥' : 'Tertiary care covers super-specialty institutes like AIIMS.'}
            </div>
          )}
        </div>

        {/* Limited offer strip (visual parity with the official app) */}
        <div style={{ margin: '14px 16px 0', borderRadius: 14, background: 'linear-gradient(90deg, #1D5BF0 0%, #4338CA 100%)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 8.5, fontWeight: 800, color: 'white', background: 'rgba(255,255,255,0.18)', padding: '2px 8px', borderRadius: 20, letterSpacing: '0.06em' }}>⏱ LIMITED OFFER</span>
            <div style={{ color: 'white', fontSize: 13.5, fontWeight: 800, marginTop: 5 }}>7 Day Free Trial</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>No commitment · Cancel anytime</div>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <span style={{ display: 'inline-block', background: ORANGE, color: 'white', fontSize: 12, fontWeight: 800, padding: '8px 18px', borderRadius: 20, boxShadow: '0 3px 10px rgba(255,158,27,0.4)' }}>Try PRO</span>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9, marginTop: 4 }}>06 : 23 : 01</div>
          </div>
        </div>

        {/* Webinars + Tests + QBank pastel tiles */}
        <div style={{ padding: '18px 16px 4px' }}>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: INK, marginBottom: 10 }}>Learn & Practice</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'Webinars', cap: 'Topper-led live sessions', emoji: '🎥', bg: '#E7ECFD', onClick: onOpenWebinarTab, live: liveNow },
              { label: 'Test Series', cap: 'Mocks & preboards', emoji: '📝', bg: '#FDEEE7', onClick: onOpenTests },
              { label: 'QBank', cap: 'Lakhs of practice questions', emoji: '📚', bg: '#FBE9F0' },
            ].map(t => (
              <button key={t.label} onClick={t.onClick} disabled={!t.onClick}
                style={{ position: 'relative', background: t.bg, border: 'none', borderRadius: 16, padding: '16px 10px 12px', textAlign: 'center', cursor: t.onClick ? 'pointer' : 'default' }}>
                {t.live && (
                  <span style={{ position: 'absolute', top: 8, right: 8, display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 8, fontWeight: 800, color: '#FF3B5C' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF3B5C', animation: 'livePulse 1.4s ease-in-out infinite' }} />LIVE
                  </span>
                )}
                <div style={{ fontSize: 30, marginBottom: 8 }}>{t.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: INK }}>{t.label}</div>
                <div style={{ fontSize: 9, color: T2, marginTop: 3, lineHeight: 1.4 }}>{t.cap}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Community — PRD: escape the WhatsApp doubt-group, low-pressure peer replies vs. formal QMS queries */}
        <div style={{ padding: '26px 16px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: '#7C3AED', letterSpacing: '0.02em' }}>YOUR BATCH IS ALREADY HERE</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: INK, lineHeight: 1.15, marginTop: 6 }}>NPrep</div>
          <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.1, background: 'linear-gradient(90deg, #1D5BF0, #7C3AED)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', letterSpacing: '0.01em' }}>COMMUNITY</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: T1, marginTop: 8, lineHeight: 1.5, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
            Stuck on today's question? Just ask — no query form, no waiting. Real students, daily discussions, your exam room.
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {['🔥 Daily Dose', '📖 Subject Room', '🎯 Exam Room'].map(chip => (
              <span key={chip} style={{ fontSize: 10.5, fontWeight: 700, color: '#4338CA', background: '#EEF0FE', border: '1px solid #DBE0FB', borderRadius: 20, padding: '5px 11px' }}>{chip}</span>
            ))}
          </div>
          <div style={{ fontSize: 11, color: T2, marginTop: 12 }}>Over <b>5,000+</b> active students showing up every month</div>
          <button style={{ marginTop: 14, background: INK, color: 'white', fontSize: 13, fontWeight: 700, padding: '12px 42px', borderRadius: 26, border: 'none', cursor: 'pointer' }}>Join the Conversation</button>
        </div>
      </div>

      {/* Bottom nav — reference style: blue active tab */}
      <div style={{ flexShrink: 0, background: 'white', borderTop: `1px solid ${BD}`, display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { id: 'home', label: 'Home', active: true, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
          { id: 'qbank', label: 'Qbank', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg> },
          { id: 'webinar', label: 'Webinar', onClick: onOpenWebinarTab, dot: liveNow, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="14" height="14" rx="2"/><path d="M16 10l6-4v12l-6-4"/></svg> },
          { id: 'tests', label: 'Tests', onClick: onOpenTests, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg> },
          { id: 'more', label: 'More', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg> },
        ].map(t => (
          <button key={t.id} onClick={t.onClick} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 0 10px', background: 'none', border: 'none', color: t.active ? P : T3, cursor: t.onClick || t.active ? 'pointer' : 'default' }}>
            {t.icon}
            {t.dot && <span style={{ position: 'absolute', top: 6, right: '30%', width: 6, height: 6, borderRadius: '50%', background: '#FF3B5C' }} />}
            <span style={{ fontSize: 10, fontWeight: t.active ? 700 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
