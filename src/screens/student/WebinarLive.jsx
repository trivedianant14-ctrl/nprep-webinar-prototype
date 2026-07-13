import { useEffect, useState } from 'react'
import { P, T1, T2, T3, BD, BG2, A, AL, AB } from './shared'

const MOCK_CHAT = [
  { name: 'Priya S.', msg: 'from Ranchi 🙌' },
  { name: 'Rohit K.', msg: 'sir CHN wale part thoda slow please' },
  { name: 'Anjali M.', msg: 'day 1 se follow kar rahi hoon 🔥' },
  { name: 'Deepak V.', msg: 'notes kahan milenge?' },
  { name: 'Sneha R.', msg: 'AIR 15 ka respect 🙏' },
]

export default function WebinarLive({ session, onBack, onEndSession }) {
  // Connectivity state machine: good → adjusting (auto) → retrying (silent auto) → manual (button)
  const [connState, setConnState] = useState('good')
  const [lateJoin, setLateJoin] = useState(false)
  const [watchedEnough, setWatchedEnough] = useState(true)
  const [viaYoutubeDirect, setViaYoutubeDirect] = useState(false)

  useEffect(() => {
    if (connState === 'adjusting') {
      const t = setTimeout(() => setConnState('retrying'), 1500)
      return () => clearTimeout(t)
    }
    if (connState === 'retrying') {
      const t = setTimeout(() => setConnState('manual'), 1500)
      return () => clearTimeout(t)
    }
  }, [connState])

  if (!session) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={onBack} style={{ color: P, background: 'none', border: 'none', cursor: 'pointer' }}>← Back to Webinars</button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0d0d14' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', padding: 2 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.topic}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{session.host}{session.topperName ? ` · ${session.topperName}` : ''}</div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#FF6B6B', flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF6B6B', boxShadow: '0 0 0 2px rgba(255,107,107,0.4)', animation: 'livePulse 1.4s ease-in-out infinite' }} />
          LIVE
        </span>
      </div>

      {lateJoin && (
        <div style={{ margin: '0 16px 10px', background: AL, border: `1px solid ${AB}`, borderRadius: 10, padding: '9px 12px', fontSize: 11, color: A, flexShrink: 0 }}>
          You've missed ~20 minutes — recording will be available after the session.
        </div>
      )}

      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: 'black', flexShrink: 0 }}>
        {connState === 'good' && session.youtubeEmbedId && (
          <iframe
            title="webinar-stream"
            width="100%" height="100%"
            src={`https://www.youtube.com/embed/${session.youtubeEmbedId}?autoplay=0`}
            style={{ border: 'none', display: 'block' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
        {connState === 'adjusting' && <ConnOverlay label="Adjusting stream quality…" />}
        {connState === 'retrying' && <ConnOverlay label="Reconnecting…" />}
        {connState === 'manual' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'white' }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>Connection lost</span>
            <button onClick={() => setConnState('good')} style={{ padding: '9px 20px', borderRadius: 20, background: 'white', color: P, fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Retry</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '10px 16px', flexWrap: 'wrap', flexShrink: 0 }}>
        <button onClick={() => setConnState('adjusting')} disabled={connState !== 'good'} style={{ fontSize: 10, padding: '5px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)', cursor: connState === 'good' ? 'pointer' : 'default' }}>
          Simulate poor connectivity
        </button>
        <button onClick={() => setLateJoin(v => !v)} style={{ fontSize: 10, padding: '5px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
          {lateJoin ? 'Hide late-joiner banner' : 'Simulate joining late'}
        </button>
      </div>

      <div style={{ flex: 1, background: 'white', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${BD}`, fontSize: 12, fontWeight: 700, color: T1, flexShrink: 0 }}>Live Chat</div>
        <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px 16px' }}>
          {MOCK_CHAT.map((c, i) => (
            <div key={i} style={{ marginBottom: 8, fontSize: 12 }}>
              <span style={{ fontWeight: 700, color: '#12339B' }}>{c.name}: </span>
              <span style={{ color: T2 }}>{c.msg}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${BD}`, padding: '12px 16px', background: BG2, flexShrink: 0 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: T2, marginBottom: 6 }}>
            <input type="checkbox" checked={watchedEnough} onChange={e => setWatchedEnough(e.target.checked)} />
            Watched 50%+ of session in-app
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: T2, marginBottom: 10 }}>
            <input type="checkbox" checked={viaYoutubeDirect} onChange={e => setViaYoutubeDirect(e.target.checked)} />
            Joined via YouTube directly (not in-app)
          </label>
          <button
            onClick={() => onEndSession(session, { watchedEnough, viaYoutubeDirect })}
            style={{ width: '100%', padding: '11px', borderRadius: 10, background: P, color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            End Session & Continue →
          </button>
        </div>
      </div>
    </div>
  )
}

function ConnOverlay({ label }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'white' }}>
      <div style={{ width: 28, height: 28, border: '3px solid rgba(255,255,255,0.25)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: 12, opacity: 0.85 }}>{label}</span>
    </div>
  )
}
