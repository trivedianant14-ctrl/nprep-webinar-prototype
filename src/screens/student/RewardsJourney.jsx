import { useEffect, useRef } from 'react'
import { P, PD, G, T1, T2, T3, JOURNEY, journeyStatus } from './shared'

// Candy-crush-style saga map: a winding path from the bottom (start) to the 40%-off
// grand prize at the top, mixing discount star nodes with the attendance gift nodes
// (free premium video after the 1st attended session, free mini test after the 2nd).
const W = 398, H = 860
// Node centres, bottom-up, zig-zagging like a saga map
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
  { x: 210, y: 120 },  // 🏆 grand
]

const CANDY_DECOR = [
  { e: '🍭', x: 320, y: 750, s: 30 }, { e: '🧁', x: 40, y: 590, s: 26 },
  { e: '🍬', x: 330, y: 470, s: 24 }, { e: '⛅', x: 50, y: 320, s: 30 },
  { e: '🍩', x: 330, y: 200, s: 26 }, { e: '⭐', x: 60, y: 90, s: 22 },
]

export default function RewardsJourney({ discountPct, attendedCount, programCap, onClose }) {
  const scrollRef = useRef(null)
  // Saga maps start at the bottom — scroll there on open
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [])

  const { earned, nextIdx } = journeyStatus(discountPct, attendedCount)
  const pathD = POS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #FDE7F5 0%, #E4F1FF 45%, #E6FBEF 100%)' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(90deg, #FF7BAC, #B678F5, #5B8DF6)', boxShadow: '0 2px 12px rgba(120,60,180,0.25)' }}>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: 10, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>Rewards Journey</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{discountPct}% off earned · {attendedCount} live session{attendedCount === 1 ? '' : 's'} attended</div>
        </div>
        <span style={{ background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 14 }}>🏆 {programCap}% goal</span>
      </div>

      {/* Next-up strip — "what comes next" always visible */}
      {nextIdx !== -1 && (
        <div style={{ flexShrink: 0, margin: '10px 14px 0', background: 'white', borderRadius: 14, padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 3px 12px rgba(120,60,180,0.14)' }}>
          <span style={{ fontSize: 20 }}>{JOURNEY[nextIdx].kind === 'gift' ? JOURNEY[nextIdx].emoji : '⭐'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#B678F5', letterSpacing: '0.06em' }}>UP NEXT</div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: T1 }}>
              {JOURNEY[nextIdx].kind === 'gift' ? JOURNEY[nextIdx].label : `+5% off — reach ${JOURNEY[nextIdx].val}%`}
            </div>
            <div style={{ fontSize: 9.5, color: T2 }}>
              {JOURNEY[nextIdx].kind === 'gift' ? JOURNEY[nextIdx].sub : 'Finish study material, attend live or clear the quiz'}
            </div>
          </div>
        </div>
      )}

      {/* The map */}
      <div ref={scrollRef} className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ position: 'relative', width: W, height: H, margin: '0 auto' }}>
          {/* Path */}
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
            <path d={pathD} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
            <path d={pathD} fill="none" stroke="#FF9DC0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.1 16" />
          </svg>

          {CANDY_DECOR.map((d, i) => (
            <span key={i} style={{ position: 'absolute', left: d.x, top: d.y, fontSize: d.s, opacity: 0.55, transform: 'translate(-50%, -50%)' }}>{d.e}</span>
          ))}

          {JOURNEY.map((n, i) => {
            const p = POS[i]
            const isEarned = earned(n)
            const isNext = i === nextIdx
            const isGift = n.kind === 'gift'
            const size = n.grand ? 74 : isGift ? 62 : 48
            return (
              <div key={i} style={{ position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 130 }}>
                {isNext && (
                  <div style={{ position: 'absolute', top: -(size / 2 + 26), background: '#FF3B8D', color: 'white', fontSize: 9, fontWeight: 900, padding: '3px 10px', borderRadius: 10, whiteSpace: 'nowrap', boxShadow: '0 3px 8px rgba(255,59,141,0.4)', animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                    UP NEXT!
                    <span style={{ position: 'absolute', left: '50%', bottom: -4, transform: 'translateX(-50%) rotate(45deg)', width: 8, height: 8, background: '#FF3B8D' }} />
                  </div>
                )}
                <div style={{
                  width: size, height: size, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: n.grand ? 30 : isGift ? 26 : isEarned ? 20 : 14,
                  fontWeight: 900,
                  background: isEarned
                    ? (isGift || n.grand ? 'linear-gradient(135deg,#FFC533,#FF8A00)' : `linear-gradient(135deg, ${P}, #3B79FF)`)
                    : 'white',
                  color: isEarned ? 'white' : isNext ? P : T3,
                  border: isEarned ? '3px solid rgba(255,255,255,0.85)' : `3px solid ${isNext ? P : '#E3D9EE'}`,
                  boxShadow: isEarned ? '0 5px 14px rgba(29,91,240,0.3)' : '0 3px 10px rgba(120,60,180,0.15)',
                  animation: isNext ? 'nodePulse 1.6s ease-in-out infinite' : 'none',
                }}>
                  {isGift ? n.emoji : n.grand ? '🏆' : isEarned ? '★' : `${n.val}%`}
                </div>
                <div style={{ marginTop: 5, background: 'rgba(255,255,255,0.92)', borderRadius: 9, padding: '3px 9px', fontSize: 8.5, fontWeight: 800, color: isEarned ? G : isGift || n.grand ? '#B96A00' : T2, textAlign: 'center', boxShadow: '0 2px 6px rgba(120,60,180,0.12)', lineHeight: 1.35 }}>
                  {isGift ? (
                    <>{n.label}{isEarned ? ' · UNLOCKED ✓' : ''}<br /><span style={{ fontWeight: 600, color: T3 }}>{n.sub}</span></>
                  ) : n.grand ? (
                    <>GRAND PRIZE · {n.val}% OFF{isEarned ? ' ✓' : ''}</>
                  ) : (
                    <>{n.val}% off{isEarned ? ' ✓' : ''}</>
                  )}
                </div>
              </div>
            )
          })}

          {/* Start flag */}
          <div style={{ position: 'absolute', left: POS[0].x, top: POS[0].y + 44, transform: 'translateX(-50%)', fontSize: 9, fontWeight: 800, color: '#B678F5' }}>START</div>
        </div>
      </div>
    </div>
  )
}
