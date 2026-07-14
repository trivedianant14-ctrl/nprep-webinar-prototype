import { useEffect, useState } from 'react'

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

// How many sessions the student attended live (50%+ watch, in-app) — drives the
// milestone rewards: 1st attended session → free premium video, 2nd → free mini test.
export function attendedCountFrom(actionsBySession) {
  return Object.values(actionsBySession || {}).filter(a => a.liveAttendance).length
}

// The rewards journey, told as a pictorial student-to-nurse arc — each node's icon is a
// stage of that becoming (backpack → books → clinic → exam → cap → nurse), not a candy.
// `line` is a short, subtle tagline shown at that milestone; `sub` is the practical instruction.
export const JOURNEY = [
  { kind: 'pct', val: 5, icon: '🎒', line: 'Your journey begins' },
  { kind: 'pct', val: 10, icon: '📖', line: 'Building the habit' },
  { kind: 'pct', val: 15, icon: '✍️', line: 'Halfway to your first reward' },
  { kind: 'gift', id: 'video', emoji: '🎬', label: 'FREE Premium Video', sub: 'Attend 1 live session (50%+)', attended: 1, line: 'Reward unlocked!' },
  { kind: 'pct', val: 20, icon: '🩺', line: 'Almost there, topper' },
  { kind: 'pct', val: 25, icon: '📋', line: 'Past the midpoint' },
  { kind: 'pct', val: 30, icon: '🎯', line: 'So close now' },
  { kind: 'gift', id: 'test', emoji: '📝', label: 'FREE Mini Test', sub: 'Attend 2 live sessions · valid 1 year', attended: 2, line: 'Second reward unlocked!' },
  { kind: 'pct', val: 35, icon: '🎓', line: 'One step from Gold' },
  { kind: 'pct', val: 40, grand: true, icon: '👩‍⚕️', line: 'Gold unlocked — you did it!' },
]

export function journeyStatus(discountPct, attendedCount) {
  const earned = (n) => n.kind === 'pct' ? discountPct >= n.val : attendedCount >= n.attended
  const nextIdx = JOURNEY.findIndex(n => !earned(n))
  return { earned, nextIdx }
}

// Vibrant grass-and-trail backdrop shared by the game-map screens (rewards journey,
// referral path) — a hillside gradient rather than a candy-colored board.
export const GRASS_BG = 'linear-gradient(180deg, #BEE7F5 0%, #DCF2B8 16%, #B7E892 38%, #8FD46B 62%, #5CB84C 84%, #3E9E3A 100%)'

// Smooth, natural-looking curve through a series of points (Catmull-Rom → cubic Bezier),
// used to draw a winding trail instead of straight zig-zag segments.
export function smoothPath(pts) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y} `
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y} `
  }
  return d
}

// Mira, the NPrep mascot, explains the game mechanics story-mode style (Clash of Clans-
// style guide character) — tap to advance, skippable at any point. Shown once per device
// (shared across the rewards journey and referral screens via the same flag), replayable
// via a small "?" hint icon on either screen.
const MIRA_SEEN_KEY = 'nprep_mira_intro_seen'
export const MASCOT_MESSAGES = [
  "Hi, I'm Mira! Let's turn your NORCET prep into rewards.",
  'Attend live sessions, read study material, and clear quizzes — each one pushes your discount toward 40% off Gold.',
  "Invite 3 friends with your code. Once they join and watch a session, you win — pick a free test or a free video.",
  'Tap any milestone on the map to see exactly what’s next.',
  'Your dream career is waiting — let’s start learning.',
]

export function useMiraIntro() {
  const [open, setOpen] = useState(() => typeof window !== 'undefined' && !window.localStorage.getItem(MIRA_SEEN_KEY))
  const dismiss = () => { window.localStorage.setItem(MIRA_SEEN_KEY, '1'); setOpen(false) }
  const relaunch = () => setOpen(true)
  return [open, dismiss, relaunch]
}

// The source mascot render has a solid black backdrop baked in (not real alpha
// transparency) — key it out client-side on a canvas so Mira reads as a cutout
// character over whatever screen she's guiding, the way a story-mode game mascot would.
function useChromaKeyedImage(src, threshold = 24) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const px = frame.data
      for (let i = 0; i < px.length; i += 4) {
        if (px[i] < threshold && px[i + 1] < threshold && px[i + 2] < threshold) px[i + 3] = 0
      }
      ctx.putImageData(frame, 0, 0)
      if (!cancelled) setUrl(canvas.toDataURL())
    }
    img.src = src
    return () => { cancelled = true }
  }, [src, threshold])
  return url
}

export function MiraIntro({ open, onDone }) {
  const [idx, setIdx] = useState(0)
  const mascotUrl = useChromaKeyedImage('/mascot-mira.png')
  if (!open) return null
  const last = idx === MASCOT_MESSAGES.length - 1
  const advance = () => { if (last) onDone(); else setIdx(i => i + 1) }
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 90, cursor: 'pointer' }} onClick={advance}>
      <button onClick={e => { e.stopPropagation(); onDone() }} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(6,12,35,0.55)', border: 'none', color: 'white', fontSize: 10.5, fontWeight: 700, padding: '6px 14px', borderRadius: 20, cursor: 'pointer', zIndex: 2 }}>Skip ✕</button>

      {/* Mira, story-mode guide character anchored bottom-left (Clash of Clans-style) */}
      <div style={{ position: 'absolute', left: 4, bottom: 0, height: '45%', display: 'flex', alignItems: 'flex-end', zIndex: 1 }}>
        <img src={mascotUrl || '/mascot-mira.png'} alt="Mira" style={{ height: '100%', width: 'auto', display: 'block', filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.4))', animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }} />
      </div>

      {/* Speech bubble floating beside her head */}
      <div key={idx} style={{ position: 'absolute', left: '38%', bottom: '30%', maxWidth: '56%', background: 'white', border: `2px solid ${PD}`, borderRadius: 18, padding: '12px 15px', boxShadow: '0 6px 18px rgba(0,0,0,0.3)', animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both', zIndex: 2 }}>
        <div style={{ color: T1, fontSize: 12.5, fontWeight: 700, lineHeight: 1.45 }}>{MASCOT_MESSAGES[idx]}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {MASCOT_MESSAGES.map((_, i) => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i === idx ? PD : '#D8E2F5' }} />)}
          </div>
          <span style={{ fontSize: 9, color: T3, fontWeight: 600 }}>Tap to {last ? 'start' : 'continue'}</span>
        </div>
        <span style={{ position: 'absolute', left: -12, bottom: 16, width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: `12px solid ${PD}` }} />
        <span style={{ position: 'absolute', left: -9, bottom: 16, width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: '11px solid white' }} />
      </div>
    </div>
  )
}

// Generates a small real PDF client-side so "Download" actually downloads in the demo.
export function downloadDemoPdf(title, subtitle = 'NPrep Webinar Resources') {
  const clean = (s) => s.replace(/[^\x20-\x7E]/g, '-').replace(/[\\()]/g, c => '\\' + c)
  const content = `BT /F1 20 Tf 60 720 Td (${clean(title)}) Tj ET\n` +
                  `BT /F1 12 Tf 60 692 Td (${clean(subtitle)}) Tj ET\n` +
                  `BT /F1 10 Tf 60 664 Td (Demo document generated by the NPrep webinar prototype.) Tj ET`
  const objs = []
  objs[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objs[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>'
  objs[3] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>'
  objs[4] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
  objs[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (let i = 1; i <= 5; i++) { offsets[i] = pdf.length; pdf += `${i} 0 obj\n${objs[i]}\nendobj\n` }
  const xref = pdf.length
  pdf += 'xref\n0 6\n0000000000 65535 f \n' + offsets.slice(1).map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('')
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.pdf'
  a.click()
  URL.revokeObjectURL(url)
}

// "Resources" — marketing-uploaded downloadables for a session. Download generates a
// real PDF client-side so the demo actually saves a file.
export function ResourceList({ session }) {
  if (!session.resources || session.resources.length === 0) return null
  return (
    <div style={{ background: 'white', border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
      <div style={{ padding: '10px 13px 8px', display: 'flex', alignItems: 'center', gap: 7, borderBottom: `1px solid ${BD}` }}>
        <span style={{ fontSize: 14 }}>📚</span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: T1 }}>Resources</span>
        <span style={{ fontSize: 9.5, color: T3, marginLeft: 'auto' }}>{session.resources.length} file{session.resources.length === 1 ? '' : 's'} · from the NPrep team</span>
      </div>
      {session.resources.map(r => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', borderBottom: `1px solid ${BG2}` }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#FDEEEE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>📄</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
            <div style={{ fontSize: 9, color: T3 }}>PDF · free download</div>
          </div>
          <button onClick={() => downloadDemoPdf(r.title, session.topic)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 16, background: PL, color: PD, border: `1px solid ${PB}`, fontSize: 10.5, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={PD} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download
          </button>
        </div>
      ))}
    </div>
  )
}

// Candy-crush-style reward track: one node per 5% milestone. Earned nodes fill with a
// star, the next one pulses, the 40% cap is the prize node.
export function LevelTrack({ pct, cap = 40, step = 5 }) {
  const nodes = []
  for (let v = step; v <= cap; v += step) nodes.push(v)
  const nextVal = nodes.find(v => v > pct)
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {nodes.map((v, i) => {
        const earned = pct >= v
        const isNext = v === nextVal
        const isPrize = v === cap
        return (
          <div key={v} style={{ display: 'flex', alignItems: 'center', flex: i === 0 ? '0 0 auto' : 1 }}>
            {i > 0 && <div style={{ flex: 1, height: 3, borderRadius: 2, margin: '0 3px', background: earned ? P : BD }} />}
            <div style={{
              width: isPrize ? 34 : 28, height: isPrize ? 34 : 28, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: earned ? 13 : isPrize ? 14 : 8.5, fontWeight: 800,
              background: earned ? `linear-gradient(135deg, ${P}, #3B79FF)` : isNext ? 'white' : BG2,
              color: earned ? 'white' : isNext ? P : T3,
              border: earned ? 'none' : `2px solid ${isNext ? P : BD}`,
              animation: isNext ? 'nodePulse 1.6s ease-in-out infinite' : 'none',
              boxShadow: earned ? '0 2px 6px rgba(29,91,240,0.35)' : 'none',
            }}>
              {earned ? '★' : isPrize ? '🎁' : `${v}`}
            </div>
          </div>
        )
      })}
    </div>
  )
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
