// Shared color tokens + small pieces reused across the student-facing webinar screens.
export const P = '#1D5BF0', PL = '#EAF0FE', PB = '#A9C4FA', PD = '#12339B'
export const G = '#3B6D11', GL = '#EAF3DE', GB = '#97C459'
export const R = '#791F1F', RL = '#FCEBEB', RB = '#F09595'
export const A = '#633806', AL = '#FAEEDA', AB = '#FAC775'
export const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'

export function ctaFor(session, isRegistered) {
  if (session.status === 'cancelled') return { label: 'Cancelled', tone: 'cancelled' }
  if (session.status === 'completed') return { label: 'Watch Recording', tone: 'completed' }
  if (session.status === 'live') return { label: 'Join Now', tone: 'live' }
  if (isRegistered) return { label: 'Registered ✓', tone: 'registered' }
  return { label: 'Register', tone: 'scheduled' }
}

// "Today · 4:00 PM – 5:00 PM" / "Tue, 15 Jul · 6:30 PM – 7:30 PM"
export function fmtWhen(startAt, endAt) {
  const s = new Date(startAt), e = new Date(endAt), now = new Date()
  const sameDay = (a, b) => a.toDateString() === b.toDateString()
  const day = sameDay(s, now) ? 'Today'
    : sameDay(s, new Date(now.getTime() + 864e5)) ? 'Tomorrow'
    : s.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
  const t = d => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return `${day} · ${t(s)} – ${t(e)}`
}

// "2d 3h" / "3h 12m" / "42m" until start; null once started
export function countdown(startAt) {
  let ms = new Date(startAt) - Date.now()
  if (ms <= 0) return null
  const d = Math.floor(ms / 864e5); ms -= d * 864e5
  const h = Math.floor(ms / 36e5); ms -= h * 36e5
  const m = Math.max(1, Math.floor(ms / 6e4))
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

// Stable pseudo viewer count for live sessions (Unacademy-style "watching" social proof)
export function liveViewers(session) {
  return ((session.id * 397) % 900 + 420).toLocaleString()
}

// Thumbnail-first card media: image with gradient fallback, children are overlays.
export function Thumb({ session, aspect = '16/9', radius = 0, children }) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: aspect, borderRadius: radius, overflow: 'hidden', background: 'linear-gradient(135deg, #12339B 0%, #1D5BF0 60%, #3B79FF 100%)', flexShrink: 0 }}>
      {session.thumbnailUrl && (
        <img src={session.thumbnailUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none' }} />
      )}
      {/* darkening scrim so overlaid text stays readable on any image */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,12,35,0.25) 0%, rgba(6,12,35,0.05) 40%, rgba(6,12,35,0.72) 100%)' }} />
      {children}
    </div>
  )
}

export function StatusBar() {
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

export function BackHeader({ onBack, title }) {
  return (
    <div style={{ padding: '12px 16px 10px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', padding: 2 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
      </button>
      <span style={{ fontSize: 15, fontWeight: 700, color: T1 }}>{title}</span>
    </div>
  )
}
