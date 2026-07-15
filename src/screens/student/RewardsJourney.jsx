import { useEffect, useRef, useState } from 'react'
import { P, PD, G, T1, T2, T3, JOURNEY, journeyStatus, GRASS_BG, smoothPath, useMiraIntro, MiraIntro, resetMiraIntroSeen } from './shared'

// A pictorial student-to-nurse journey: each node's icon is a stage of that becoming
// (backpack → books → studying → clinic → exam → cap → nurse), reaching the 40%-off
// grand prize at the top. A curvy dirt trail winds up a vibrant grass hillside.
const W = 398, H = 860
const POS = [
  { x: 78,  y: 800 },
  { x: 236, y: 730 },
  { x: 96,  y: 648 },
  { x: 260, y: 566 },  // 🎬 gift
  { x: 104, y: 484 },
  { x: 272, y: 408 },
  { x: 112, y: 330 },
  { x: 268, y: 252 },  // 📝 gift
  { x: 122, y: 178 },
  { x: 214, y: 96 },  // 👩‍⚕️ grand
]

// Decorative grass-hillside dressing — purely visual, sits behind the trail.
const DECOR = [
  { x: 30, y: 760, e: '🌳', s: 30 }, { x: 340, y: 700, e: '🌿', s: 24 },
  { x: 350, y: 600, e: '🌳', s: 34 }, { x: 40, y: 560, e: '🌼', s: 20 },
  { x: 30, y: 440, e: '🌿', s: 26 }, { x: 350, y: 470, e: '🌳', s: 28 },
  { x: 355, y: 320, e: '🌼', s: 18 }, { x: 34, y: 280, e: '🌳', s: 32 },
  { x: 40, y: 140, e: '🌿', s: 22 }, { x: 330, y: 180, e: '🌸', s: 20 },
  { x: 300, y: 60, e: '☁️', s: 40 }, { x: 60, y: 40, e: '☁️', s: 34 },
]

export default function RewardsJourney({ discountPct, attendedCount, programCap, onClose, onResetJourney }) {
  const scrollRef = useRef(null)
  const [miraOpen, dismissMira, relaunchMira] = useMiraIntro('journey')
  const [restoring, setRestoring] = useState(false)
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [])

  const { earned, nextIdx } = journeyStatus(discountPct, attendedCount)
  const pathD = smoothPath(POS)
  const next = nextIdx === -1 ? null : JOURNEY[nextIdx]

  // This prototype has no real auth — every visitor is the same demo account, so
  // progress is recorded server-side and survives a hard reload. Restore wipes it
  // (and Mira's "seen" flags) so this screen can be replayed from a clean slate.
  const handleRestore = async () => {
    if (!window.confirm("Restore this journey to a fresh start? This clears the demo account's live-session attendance, quiz progress, and referrals.")) return
    setRestoring(true)
    try {
      await onResetJourney()
      resetMiraIntroSeen()
      relaunchMira()
    } finally {
      setRestoring(false)
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column', background: GRASS_BG }}>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, background: `linear-gradient(90deg, ${PD}, ${P})`, boxShadow: '0 2px 12px rgba(18,51,155,0.25)' }}>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: 'white' }}>Your Road to NORCET Gold</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{discountPct}% closer to Gold · {attendedCount} live session{attendedCount === 1 ? '' : 's'} attended</div>
        </div>
        <button onClick={handleRestore} disabled={restoring} title="Restore journey to a fresh start" style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)', color: 'white', width: 26, height: 26, borderRadius: '50%', cursor: restoring ? 'default' : 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: restoring ? 0.6 : 1 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ animation: restoring ? 'spin 0.8s linear infinite' : 'none' }}><path d="M3 12a9 9 0 1 1 2.64 6.36" /><polyline points="3,7 3,12 8,12" /></svg>
        </button>
        <button onClick={relaunchMira} style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)', color: 'white', fontSize: 12, fontWeight: 800, width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', flexShrink: 0 }}>?</button>
        <span style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)', color: 'white', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 14, flexShrink: 0 }}>🏆 {programCap}%</span>
      </div>

      {/* Next-up strip — a slim, subtle tagline, not an emotional paragraph */}
      {next && (
        <div style={{ flexShrink: 0, margin: '10px 14px 0', background: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 9, boxShadow: '0 3px 10px rgba(18,51,155,0.12)' }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>{next.kind === 'gift' ? next.emoji : next.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: T1, flex: 1 }}>{next.line}</span>
          <span style={{ fontSize: 9.5, color: T2 }}>
            {next.kind === 'gift' ? next.sub : `${next.val}% off`}
          </span>
        </div>
      )}

      {/* The map */}
      <div ref={scrollRef} className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ position: 'relative', width: W, height: H, margin: '0 auto' }}>
          {DECOR.map((d, i) => (
            <span key={i} style={{ position: 'absolute', left: d.x, top: d.y, fontSize: d.s, opacity: 0.7, pointerEvents: 'none' }}>{d.e}</span>
          ))}

          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
            {/* dirt trail winding up the hillside — bordered edge, sandy fill, dashed centerline */}
            <path d={pathD} fill="none" stroke="#8B5E34" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
            <path d={pathD} fill="none" stroke="#E9CE8F" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
            <path d={pathD} fill="none" stroke="#B98B4E" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0.1 13" opacity="0.65" />
          </svg>

          {JOURNEY.map((n, i) => {
            const p = POS[i]
            const isEarned = earned(n)
            const isNext = i === nextIdx
            const isGift = n.kind === 'gift'
            const size = n.grand ? 76 : isGift ? 62 : 54
            return (
              <div key={i} style={{ position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 150 }}>
                {isNext && (
                  <div style={{ position: 'absolute', top: -(size / 2 + 24), background: PD, color: 'white', fontSize: 9, fontWeight: 900, padding: '3px 10px', borderRadius: 10, whiteSpace: 'nowrap', boxShadow: '0 3px 8px rgba(18,51,155,0.4)', animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                    YOU ARE HERE
                    <span style={{ position: 'absolute', left: '50%', bottom: -4, transform: 'translateX(-50%) rotate(45deg)', width: 8, height: 8, background: PD }} />
                  </div>
                )}
                <div style={{
                  width: size, height: size, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: n.grand ? 34 : isGift ? 27 : 24,
                  background: isEarned
                    ? (isGift || n.grand ? 'linear-gradient(135deg,#FFC533,#FF8A00)' : `linear-gradient(135deg, ${P}, #3B79FF)`)
                    : 'white',
                  filter: isEarned ? 'none' : 'grayscale(0.55) opacity(0.85)',
                  border: isEarned ? '3px solid rgba(255,255,255,0.85)' : `3px solid ${isNext ? P : '#DDD1A8'}`,
                  boxShadow: isEarned ? '0 5px 14px rgba(29,91,240,0.3)' : '0 3px 10px rgba(80,60,10,0.18)',
                  animation: isNext ? 'nodePulse 1.6s ease-in-out infinite' : 'none',
                }}>
                  {isGift ? n.emoji : n.icon}
                </div>
                <div style={{ marginTop: 5, background: 'rgba(255,255,255,0.94)', borderRadius: 9, padding: '3px 9px', fontSize: 8.5, fontWeight: 800, color: isEarned ? G : isGift || n.grand ? '#B96A00' : T2, textAlign: 'center', boxShadow: '0 2px 6px rgba(18,51,155,0.1)', lineHeight: 1.35 }}>
                  {isGift ? (
                    <>{n.label}{isEarned ? ' · UNLOCKED ✓' : ''}<br /><span style={{ fontWeight: 600, color: T3 }}>{n.sub}</span></>
                  ) : n.grand ? (
                    <>GOLD UNLOCKED · {n.val}% OFF{isEarned ? ' ✓' : ''}</>
                  ) : (
                    <>{n.val}% off{isEarned ? ' ✓' : ''}</>
                  )}
                </div>
                <div style={{ marginTop: 2, fontSize: 7.5, fontStyle: 'italic', color: 'rgba(26,26,46,0.55)', textAlign: 'center' }}>{n.line}</div>
              </div>
            )
          })}

          {/* Start marker */}
          <div style={{ position: 'absolute', left: POS[0].x, top: POS[0].y + 46, transform: 'translateX(-50%)', textAlign: 'center', width: 160 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: PD, marginBottom: 2 }}>YOUR JOURNEY BEGINS</div>
            <div style={{ fontSize: 8.5, color: T2, fontStyle: 'italic' }}>Every nurse was once exactly where you are.</div>
          </div>
        </div>
      </div>

      <MiraIntro open={miraOpen} onDone={dismissMira} />
    </div>
  )
}
