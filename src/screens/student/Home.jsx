import { P, PL, PD, G, GL, GB, T1, T2, T3, BD, BG2, ctaFor } from './shared'

// Official NPrep homepage palette — dark navy header, warm result banner, white card sheet.
const NAVY = '#0E1E42', NAVY2 = '#1A2F5E'
const AMBER = '#F5A623'

const TILE_STYLES = {
  webinar: { bg: '#EEEDFE', icon: '#534AB7' },
  tests:   { bg: '#E8F4FD', icon: '#1A73C9' },
  qbank:   { bg: '#EAF3DE', icon: '#3B6D11' },
  videos:  { bg: '#FDEEEE', icon: '#C0392B' },
  notes:   { bg: '#FFF4E0', icon: '#B9770E' },
  doubts:  { bg: '#F0EAFB', icon: '#7D3C98' },
}

function WhiteStatusBar() {
  return (
    <div style={{ padding: '12px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, color: 'white' }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>9:30</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="16" height="11" viewBox="0 0 30 20" fill="currentColor"><rect x="0" y="8" width="4" height="12" rx="1" opacity="0.4"/><rect x="7" y="5" width="4" height="15" rx="1" opacity="0.6"/><rect x="14" y="2" width="4" height="18" rx="1" opacity="0.8"/><rect x="21" y="0" width="4" height="20" rx="1"/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="currentColor"/><rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.4"/><rect x="1.5" y="1.5" width="15" height="9" rx="1.5" fill="currentColor"/></svg>
      </div>
    </div>
  )
}

function FeatureTile({ tone, label, sub, icon, onClick, badge, wide }) {
  const t = TILE_STYLES[tone]
  return (
    <button onClick={onClick} disabled={!onClick} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, background: 'white', border: `1px solid ${BD}`, borderRadius: 14, padding: wide ? '14px' : '12px', textAlign: 'left', cursor: onClick ? 'pointer' : 'default', gridColumn: wide ? 'span 2' : undefined, boxShadow: '0 1px 4px rgba(14,30,66,0.05)' }}>
      {badge}
      <div style={{ width: wide ? 38 : 32, height: wide ? 38 : 32, borderRadius: 10, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.icon, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: wide ? 13.5 : 12, fontWeight: 700, color: T1, lineHeight: 1.3 }}>{label}</div>
        {sub && <div style={{ fontSize: 10.5, color: T3, marginTop: 2, lineHeight: 1.4 }}>{sub}</div>}
      </div>
    </button>
  )
}

export default function Home({ sessions, registeredWebinarIds, onOpenWebinarTab, onOpenTests, onOpenWebinar, onExit }) {
  // PRD P0 #2 — homepage banner shows the next Scheduled/Live session and disappears
  // automatically once it's Completed/Cancelled; CTA mirrors the webinar card state.
  const nextWebinar = sessions
    .filter(s => s.status === 'scheduled' || s.status === 'live')
    .sort((a, b) => (a.status === 'live' ? -1 : b.status === 'live' ? 1 : a.daysOut - b.daysOut))[0]
  const liveNow = sessions.some(s => s.status === 'live')
  const bannerCta = nextWebinar ? ctaFor(nextWebinar, registeredWebinarIds.has(nextWebinar.id)) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: NAVY }}>
      <WhiteStatusBar />

      {/* Header */}
      <div style={{ padding: '8px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onExit} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', flexShrink: 0 }} title="All flows">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>Hello, Anant 👋</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>NORCET 2026 Aspirant</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, color: 'rgba(255,255,255,0.85)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <div style={{ position: 'relative', display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            {liveNow && <span style={{ position: 'absolute', top: -1, right: -1, width: 7, height: 7, borderRadius: '50%', background: '#FF6B6B', border: `1.5px solid ${NAVY}` }} />}
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>

        {/* NORCET result promo banner (official design) */}
        <div style={{ margin: '2px 16px 12px', borderRadius: 14, overflow: 'hidden', background: `linear-gradient(120deg, ${AMBER} 0%, #F7B84B 55%, #F9CE7F 100%)`, padding: '13px 14px', position: 'relative' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#7A4A00', letterSpacing: '0.08em', marginBottom: 3 }}>NORCET 9.0 RESULT</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#3D2600', lineHeight: 1.3, maxWidth: 200 }}>247 selections from NPrep this year 🎉</div>
          <div style={{ fontSize: 10.5, color: '#7A4A00', marginTop: 4 }}>Meet the toppers → </div>
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
            {['R', 'S', 'K'].map((ch, i) => (
              <div key={ch} style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${PD}, #8B82E0)`, border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14, marginLeft: i ? -10 : 0 }}>{ch}</div>
            ))}
          </div>
        </div>

        {/* Webinar homepage banner — PRD P0 #2 */}
        {nextWebinar && (
          <button onClick={() => onOpenWebinar(nextWebinar)} style={{ display: 'block', width: 'calc(100% - 32px)', margin: '0 16px 14px', textAlign: 'left', background: NAVY2, border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14, padding: '13px 14px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.12)', color: 'white', fontSize: 9.5, fontWeight: 700, padding: '2px 9px', borderRadius: 20 }}>
                {nextWebinar.status === 'live' ? (
                  <><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF6B6B', animation: 'livePulse 1.4s ease-in-out infinite' }} />LIVE WEBINAR</>
                ) : '🎤 UPCOMING WEBINAR'}
              </span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>{nextWebinar.dateLabel} · {nextWebinar.timeLabel}</span>
            </div>
            <div style={{ color: 'white', fontSize: 13, fontWeight: 700, lineHeight: 1.4, marginBottom: 3 }}>{nextWebinar.topic}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10.5 }}>
                {nextWebinar.host}{nextWebinar.topperName ? ` · with ${nextWebinar.topperName}` : ''}
              </span>
              <span style={{ background: nextWebinar.status === 'live' ? '#FF6B6B' : P, borderRadius: 20, padding: '5px 13px', color: 'white', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{bannerCta.label} →</span>
            </div>
          </button>
        )}

        {/* White sheet with feature tiles */}
        <div style={{ background: BG2, borderRadius: '20px 20px 0 0', padding: '18px 16px 24px', minHeight: 420 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T1, marginBottom: 12 }}>Explore</div>

          {/* Webinar + Test Series — the two hero cards, side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <FeatureTile
              tone="webinar" wide={false}
              label="Webinars" sub="Topper-led live sessions · earn up to 40% off"
              onClick={onOpenWebinarTab}
              badge={liveNow && (
                <span style={{ position: 'absolute', top: 10, right: 10, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 800, color: '#FF6B6B' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF6B6B', animation: 'livePulse 1.4s ease-in-out infinite' }} />LIVE
                </span>
              )}
              icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="14" height="14" rx="2"/><path d="M16 10l6-4v12l-6-4"/></svg>}
            />
            <FeatureTile
              tone="tests" wide={false}
              label="Test Series" sub="Mocks, preboards & daily practice tests"
              onClick={onOpenTests}
              icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg>}
            />
          </div>

          {/* Secondary tiles (visual parity with the official app — inert in this prototype) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            <FeatureTile tone="qbank" label="QBank" sub="14,000+ MCQs"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>} />
            <FeatureTile tone="videos" label="Video Classes" sub="Full syllabus coverage"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>} />
            <FeatureTile tone="notes" label="Study Material" sub="Notes & PDFs"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>} />
            <FeatureTile tone="doubts" label="Ask Doubts" sub="24h expert answers"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>} />
          </div>

          {/* Continue watching (official design parity) */}
          <div style={{ fontSize: 13, fontWeight: 800, color: T1, marginBottom: 10 }}>Continue Watching</div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {[
              { title: 'CHN — High-Yield Topics Part 3', tutor: 'Aman Singhal', pct: 62 },
              { title: 'MSN — Cardiac Disorders Revision', tutor: 'Priya Sharma', pct: 35 },
            ].map(v => (
              <div key={v.title} style={{ minWidth: 200, background: 'white', border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ height: 84, background: '#1a1a2e', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}><polygon points="5,3 19,12 5,21"/></svg>
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.2)' }}>
                    <div style={{ height: 3, width: `${v.pct}%`, background: P }} />
                  </div>
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                  <div style={{ fontSize: 10, color: T3, marginTop: 2 }}>{v.tutor} · {v.pct}% done</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ flexShrink: 0, background: 'white', borderTop: `1px solid ${BD}`, display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { id: 'home', label: 'Home', active: true, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
          { id: 'tests', label: 'Tests', onClick: onOpenTests, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg> },
          { id: 'webinar', label: 'Webinar', onClick: onOpenWebinarTab, dot: liveNow, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="14" height="14" rx="2"/><path d="M16 10l6-4v12l-6-4"/></svg> },
          { id: 'profile', label: 'Profile', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
        ].map(t => (
          <button key={t.id} onClick={t.onClick} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 0 10px', background: 'none', border: 'none', color: t.active ? P : T3, cursor: t.onClick || t.active ? 'pointer' : 'default' }}>
            {t.icon}
            {t.dot && <span style={{ position: 'absolute', top: 6, right: '32%', width: 6, height: 6, borderRadius: '50%', background: '#FF6B6B' }} />}
            <span style={{ fontSize: 10, fontWeight: t.active ? 700 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
