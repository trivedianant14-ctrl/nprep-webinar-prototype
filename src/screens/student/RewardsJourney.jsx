import { useEffect, useRef } from 'react'
import { P, PD, G, T1, T2, T3, JOURNEY, journeyStatus } from './shared'

// A pictorial student-to-nurse journey: each node's icon is a stage of that becoming
// (backpack → books → studying → clinic → exam → cap → nurse), reaching the 40%-off
// grand prize at the top. Dawn-to-gold background reinforces "the light at the end."
const W = 398, H = 860
const POS = [
  { x: 90,  y: 790 },
  { x: 220, y: 725 },
  { x: 110, y: 655 },
  { x: 250, y: 580 },  // 🎬 gift
  { x: 120, y: 505 },
  { x: 260, y: 440 },
  { x: 128, y: 370 },
  { x: 268, y: 295 },  // 📝 gift
  { x: 140, y: 220 },
  { x: 210, y: 120 },  // 👩‍⚕️ grand
]

export default function RewardsJourney({ discountPct, attendedCount, programCap, onClose }) {
  const scrollRef = useRef(null)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [])

  const { earned, nextIdx } = journeyStatus(discountPct, attendedCount)
  const pathD = POS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const next = nextIdx === -1 ? null : JOURNEY[nextIdx]

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #EAF0FE 0%, #DCE9FF 35%, #FFE9C2 78%, #FFD98A 100%)' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, background: `linear-gradient(90deg, ${PD}, ${P})`, boxShadow: '0 2px 12px rgba(18,51,155,0.25)' }}>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: 'white' }}>Your Road to NORCET Gold</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{discountPct}% closer to Gold · {attendedCount} live session{attendedCount === 1 ? '' : 's'} attended</div>
        </div>
        <span style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)', color: 'white', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 14 }}>🏆 {programCap}% goal</span>
      </div>

      {/* Next-up strip — emotional line first, practical instruction second */}
      {next && (
        <div style={{ flexShrink: 0, margin: '10px 14px 0', background: 'white', borderRadius: 14, padding: '11px 13px', display: 'flex', alignItems: 'flex-start', gap: 11, boxShadow: '0 3px 12px rgba(18,51,155,0.12)' }}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>{next.kind === 'gift' ? next.emoji : next.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P, letterSpacing: '0.06em', marginBottom: 2 }}>UP NEXT</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: T1, lineHeight: 1.35, marginBottom: 2 }}>{next.line}</div>
            <div style={{ fontSize: 9.5, color: T2 }}>
              {next.kind === 'gift' ? next.sub : `Finish study material, attend live or clear the quiz to reach ${next.val}% off`}
            </div>
          </div>
        </div>
      )}

      {/* The map */}
      <div ref={scrollRef} className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ position: 'relative', width: W, height: H, margin: '0 auto' }}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
            <path d={pathD} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
            <path d={pathD} fill="none" stroke={P} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.1 15" opacity="0.5" />
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
                {/* Every node shows the story icon (pictorial), earned ones lit up gold/blue */}
                <div style={{
                  width: size, height: size, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: n.grand ? 34 : isGift ? 27 : 24,
                  background: isEarned
                    ? (isGift || n.grand ? 'linear-gradient(135deg,#FFC533,#FF8A00)' : `linear-gradient(135deg, ${P}, #3B79FF)`)
                    : 'white',
                  filter: isEarned ? 'none' : 'grayscale(0.55) opacity(0.8)',
                  border: isEarned ? '3px solid rgba(255,255,255,0.85)' : `3px solid ${isNext ? P : '#D8E2F5'}`,
                  boxShadow: isEarned ? '0 5px 14px rgba(29,91,240,0.3)' : '0 3px 10px rgba(18,51,155,0.1)',
                  animation: isNext ? 'nodePulse 1.6s ease-in-out infinite' : 'none',
                }}>
                  {isGift ? n.emoji : n.icon}
                </div>
                <div style={{ marginTop: 5, background: 'rgba(255,255,255,0.92)', borderRadius: 9, padding: '3px 9px', fontSize: 8.5, fontWeight: 800, color: isEarned ? G : isGift || n.grand ? '#B96A00' : T2, textAlign: 'center', boxShadow: '0 2px 6px rgba(18,51,155,0.1)', lineHeight: 1.35 }}>
                  {isGift ? (
                    <>{n.label}{isEarned ? ' · UNLOCKED ✓' : ''}<br /><span style={{ fontWeight: 600, color: T3 }}>{n.sub}</span></>
                  ) : n.grand ? (
                    <>GOLD UNLOCKED · {n.val}% OFF{isEarned ? ' ✓' : ''}</>
                  ) : (
                    <>{n.val}% off{isEarned ? ' ✓' : ''}</>
                  )}
                </div>
              </div>
            )
          })}

          {/* Start marker */}
          <div style={{ position: 'absolute', left: POS[0].x, top: POS[0].y + 46, transform: 'translateX(-50%)', textAlign: 'center', width: 160 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: P, marginBottom: 2 }}>YOUR JOURNEY BEGINS</div>
            <div style={{ fontSize: 8.5, color: T2, fontStyle: 'italic' }}>Every nurse was once exactly where you are.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
