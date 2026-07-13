import { useState } from 'react'

const P = '#1D5BF0', PL = '#EAF0FE', PB = '#A9C4FA', PD = '#12339B'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'

const SCENARIOS = [
  {
    id: 'app-loggedout',
    title: 'Has the app, not logged in',
    desc: 'Received an app deep link from a registered student',
    outcome: 'Opens the webinar inside NPrep and watches without logging in',
  },
  {
    id: 'no-app-deeplink',
    title: 'No app installed',
    desc: 'Received an app deep link from a registered student',
    outcome: 'Redirected to Play Store / App Store',
  },
  {
    id: 'no-app-youtube',
    title: 'No app installed',
    desc: 'Received a plain YouTube link (not an app link)',
    outcome: 'Redirected to YouTube directly',
  },
]

function StatusBar() {
  return (
    <div style={{ padding: '12px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: T2 }}>
        <svg width="16" height="11" viewBox="0 0 30 20" fill="currentColor"><rect x="0" y="8" width="4" height="12" rx="1" opacity="0.4"/><rect x="7" y="5" width="4" height="15" rx="1" opacity="0.6"/><rect x="14" y="2" width="4" height="18" rx="1" opacity="0.8"/><rect x="21" y="0" width="4" height="20" rx="1"/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="currentColor"/><rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.4"/><rect x="1.5" y="1.5" width="15" height="9" rx="1.5" fill="currentColor"/></svg>
      </div>
    </div>
  )
}

export default function SharedLinkFlow({ session, onExit }) {
  const [scenario, setScenario] = useState(null)
  const [sessionEnded, setSessionEnded] = useState(false)

  return (
    <div className="phone">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <StatusBar />
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
          <button onClick={scenario ? () => { setScenario(null); setSessionEnded(false) } : onExit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T2, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
            {scenario ? 'Scenarios' : 'All flows'}
          </button>
          <span style={{ fontSize: 14, fontWeight: 700, color: T1 }}>New User · Shared Link</span>
        </div>

        {!scenario && (
          <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            <div style={{ fontSize: 12, color: T2, lineHeight: 1.5, marginBottom: 16 }}>
              A registered student shares "{session?.topic || 'a webinar'}" with a friend. Pick a scenario to see what that friend experiences (PRD: New User Flow Logic).
            </div>
            {SCENARIOS.map(s => (
              <button key={s.id} onClick={() => setScenario(s.id)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'white', border: `1.5px solid ${BD}`, borderRadius: 12, padding: '13px 14px', marginBottom: 10, cursor: 'pointer' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 3 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: T3, marginBottom: 6 }}>{s.desc}</div>
                <div style={{ fontSize: 11, color: PD, fontWeight: 600 }}>→ {s.outcome}</div>
              </button>
            ))}
          </div>
        )}

        {scenario === 'app-loggedout' && (
          sessionEnded ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 8 }}>Log in or sign up</div>
              <div style={{ fontSize: 12, color: T2, lineHeight: 1.5, marginBottom: 20 }}>to access study material, recordings, and future session updates</div>
              <button style={{ width: '100%', padding: 12, borderRadius: 10, background: P, color: 'white', border: 'none', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Sign Up</button>
              <button style={{ width: '100%', padding: 12, borderRadius: 10, background: 'white', color: T2, border: `1px solid ${BD}`, fontSize: 13, fontWeight: 600 }}>Log In</button>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: '#FAEEDA', color: '#633806', fontSize: 11, fontWeight: 600, padding: '7px 16px', textAlign: 'center' }}>Watching as a guest — not logged in</div>
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'black' }}>
                {session?.youtubeEmbedId && (
                  <iframe title="guest-stream" width="100%" height="100%" style={{ border: 'none', display: 'block' }}
                    src={`https://www.youtube.com/embed/${session.youtubeEmbedId}`} allowFullScreen />
                )}
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 4 }}>{session?.topic}</div>
                <div style={{ fontSize: 11, color: T3, marginBottom: 18 }}>No login required to watch. Study material and recordings stay locked until sign-up.</div>
                <button onClick={() => setSessionEnded(true)} style={{ width: '100%', padding: 11, borderRadius: 10, background: P, color: 'white', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Simulate session ending →</button>
              </div>
            </div>
          )
        )}

        {scenario === 'no-app-deeplink' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: T1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 6 }}>NPrep isn't installed</div>
            <div style={{ fontSize: 12, color: T2, marginBottom: 20 }}>Redirecting you to install it so you can watch "{session?.topic}"</div>
            <button style={{ width: '100%', padding: 12, borderRadius: 10, background: T1, color: 'white', border: 'none', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Get it on Google Play</button>
            <button style={{ width: '100%', padding: 12, borderRadius: 10, background: T1, color: 'white', border: 'none', fontSize: 13, fontWeight: 700 }}>Download on the App Store</button>
          </div>
        )}

        {scenario === 'no-app-youtube' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="9,7 9,17 17,12"/></svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 6 }}>Redirecting to YouTube…</div>
            <div style={{ fontSize: 12, color: T2 }}>youtube.com/live/{session?.youtubeEmbedId || 'xxxxxxxx'}</div>
          </div>
        )}
      </div>
    </div>
  )
}
