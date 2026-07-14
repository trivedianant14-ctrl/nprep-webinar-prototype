import { useState } from 'react'
import { P, PD, G, GL, GB, T1, T2, T3, BD, GRASS_BG, smoothPath, useMiraIntro, MiraIntro } from './shared'

const W = 398, H = 520
// Friend 1 → Friend 2 → Friend 3 → Reward chest, winding up the same grass hillside style
// as the discount journey, so the two game maps feel like one world.
const POS = [
  { x: 90,  y: 460 },
  { x: 262, y: 360 },
  { x: 100, y: 258 },
  { x: 210, y: 90 }, // reward chest
]
const DECOR = [
  { x: 26, y: 400, e: '🌳', s: 30 }, { x: 340, y: 430, e: '🌿', s: 22 },
  { x: 350, y: 280, e: '🌳', s: 30 }, { x: 32, y: 200, e: '🌼', s: 20 },
  { x: 40, y: 110, e: '🌿', s: 24 }, { x: 320, y: 150, e: '🌸', s: 18 },
  { x: 300, y: 40, e: '☁️', s: 34 }, { x: 60, y: 30, e: '☁️', s: 28 },
]

const STAGE = { invited: 0, registered: 1, attended: 2 }
const STAGE_LABEL = { invited: 'Invited', registered: 'Registered ✓', attended: 'Attended 50%+ ✓' }
const NEXT_ACTION = { invited: { to: 'registered', label: 'Simulate: mark registered' }, registered: { to: 'attended', label: 'Simulate: mark attended 50%+' } }

function CodeCard({ code }) {
  const [copied, setCopied] = useState(false)
  const link = `nprep.app/invite/${code}`

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text) } catch { /* clipboard unavailable — no-op */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Join me on NPrep', text: `Use my code ${code} to join NPrep webinars`, url: `https://${link}` }); return } catch { /* user cancelled or unsupported — fall through to copy */ }
    }
    copy(link)
  }

  return (
    <div style={{ margin: '10px 14px 0', background: 'rgba(255,255,255,0.94)', borderRadius: 16, padding: '12px 14px', boxShadow: '0 3px 10px rgba(18,51,155,0.12)' }}>
      <div style={{ fontSize: 9.5, fontWeight: 800, color: T2, letterSpacing: '0.06em', marginBottom: 4 }}>YOUR INVITE CODE</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ flex: 1, fontSize: 16, fontWeight: 900, color: PD, letterSpacing: '0.04em' }}>{code}</span>
        <button onClick={() => copy(code)} style={{ fontSize: 10.5, fontWeight: 800, color: PD, background: '#EAF0FE', border: `1px solid #A9C4FA`, borderRadius: 20, padding: '6px 12px', cursor: 'pointer' }}>
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
        <button onClick={share} style={{ fontSize: 10.5, fontWeight: 800, color: 'white', background: P, border: 'none', borderRadius: 20, padding: '6px 14px', cursor: 'pointer' }}>
          Share
        </button>
      </div>
    </div>
  )
}

export default function ReferralJourney({ code, referrals, reward, onInvite, onAdvance, onClaim, onClose }) {
  const [miraOpen, dismissMira, relaunchMira] = useMiraIntro('referral')
  const [nameInput, setNameInput] = useState('')

  const attendedCount = referrals.filter(r => r.status === 'attended').length
  const allDone = attendedCount >= 3
  const pathD = smoothPath(POS)

  const handleAdd = () => {
    if (!nameInput.trim()) return
    onInvite(nameInput.trim())
    setNameInput('')
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column', background: GRASS_BG }}>
      <div style={{ flexShrink: 0, padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, background: `linear-gradient(90deg, ${PD}, ${P})`, boxShadow: '0 2px 12px rgba(18,51,155,0.25)' }}>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: 'white' }}>Invite & Earn</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{attendedCount}/3 friends attended</div>
        </div>
        <button onClick={relaunchMira} style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)', color: 'white', fontSize: 12, fontWeight: 800, width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', flexShrink: 0 }}>?</button>
      </div>

      <CodeCard code={code} />

      <div style={{ flexShrink: 0, margin: '8px 14px 0', background: 'rgba(255,255,255,0.85)', borderRadius: 12, padding: '7px 12px', fontSize: 10, fontWeight: 700, color: T1, textAlign: 'center' }}>
        🎁 Invite 3 friends — once each joins & watches 50%+ of a session, pick a free test or video
      </div>

      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ position: 'relative', width: W, height: H, margin: '6px auto 0' }}>
          {DECOR.map((d, i) => (
            <span key={i} style={{ position: 'absolute', left: d.x, top: d.y, fontSize: d.s, opacity: 0.7, pointerEvents: 'none' }}>{d.e}</span>
          ))}
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
            <path d={pathD} fill="none" stroke="#8B5E34" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
            <path d={pathD} fill="none" stroke="#E9CE8F" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
            <path d={pathD} fill="none" stroke="#B98B4E" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0.1 13" opacity="0.65" />
          </svg>

          {[0, 1, 2].map(i => {
            const r = referrals[i]
            const stage = r ? STAGE[r.status] : -1
            const p = POS[i]
            const filled = stage === 2
            return (
              <div key={i} style={{ position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 140 }}>
                <div style={{
                  width: 58, height: 58, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                  background: filled ? 'linear-gradient(135deg,#FFC533,#FF8A00)' : stage >= 1 ? `linear-gradient(135deg, ${P}, #3B79FF)` : 'white',
                  filter: stage === -1 ? 'grayscale(0.55) opacity(0.85)' : 'none',
                  border: stage === -1 ? '3px solid #DDD1A8' : '3px solid rgba(255,255,255,0.85)',
                  boxShadow: stage >= 0 ? '0 5px 14px rgba(29,91,240,0.3)' : '0 3px 10px rgba(80,60,10,0.18)',
                }}>
                  {filled ? '✅' : stage >= 0 ? '🧑' : '➕'}
                </div>
                <div style={{ marginTop: 5, background: 'rgba(255,255,255,0.94)', borderRadius: 9, padding: '3px 9px', fontSize: 8.5, fontWeight: 800, color: filled ? G : T2, textAlign: 'center', boxShadow: '0 2px 6px rgba(18,51,155,0.1)' }}>
                  {r ? (r.friendName || `Friend ${i + 1}`) : `Friend ${i + 1}`}
                </div>
                <div style={{ fontSize: 7.5, fontStyle: 'italic', color: 'rgba(26,26,46,0.55)', marginTop: 2 }}>
                  {r ? STAGE_LABEL[r.status] : 'Waiting for invite'}
                </div>
              </div>
            )
          })}

          {/* Reward chest */}
          <div style={{ position: 'absolute', left: POS[3].x, top: POS[3].y, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 160 }}>
            <div style={{
              width: 76, height: 76, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34,
              background: allDone ? 'linear-gradient(135deg,#FFC533,#FF8A00)' : 'white',
              filter: allDone ? 'none' : 'grayscale(0.55) opacity(0.85)',
              border: allDone ? '3px solid rgba(255,255,255,0.85)' : '3px solid #DDD1A8',
              boxShadow: allDone ? '0 6px 18px rgba(255,138,0,0.4)' : '0 3px 10px rgba(80,60,10,0.18)',
              animation: allDone && !reward ? 'nodePulse 1.6s ease-in-out infinite' : 'none',
            }}>🎁</div>
            <div style={{ marginTop: 5, background: 'rgba(255,255,255,0.94)', borderRadius: 9, padding: '3px 9px', fontSize: 8.5, fontWeight: 800, color: allDone ? '#B96A00' : T2, textAlign: 'center', boxShadow: '0 2px 6px rgba(18,51,155,0.1)' }}>
              Free Test or Video{allDone ? ' · UNLOCKED' : ''}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ padding: '4px 16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {referrals.map(r => (
            r.status !== 'attended' && (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.94)', borderRadius: 12, padding: '9px 12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: T1 }}>{r.friendName}</div>
                  <div style={{ fontSize: 9.5, color: T2 }}>{STAGE_LABEL[r.status]}</div>
                </div>
                <button onClick={() => onAdvance(r.id)} style={{ fontSize: 9.5, fontWeight: 800, color: PD, background: '#EAF0FE', border: '1px solid #A9C4FA', borderRadius: 16, padding: '6px 10px', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {NEXT_ACTION[r.status].label}
                </button>
              </div>
            )
          ))}

          {referrals.length < 3 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder={`Friend ${referrals.length + 1}'s name`}
                style={{ flex: 1, border: `1px solid ${BD}`, borderRadius: 20, padding: '9px 14px', fontSize: 12, background: 'rgba(255,255,255,0.94)' }}
              />
              <button onClick={handleAdd} disabled={!nameInput.trim()} style={{ fontSize: 11.5, fontWeight: 800, color: 'white', background: nameInput.trim() ? P : '#9CB6E8', border: 'none', borderRadius: 20, padding: '9px 18px', cursor: nameInput.trim() ? 'pointer' : 'default' }}>
                Invite
              </button>
            </div>
          )}

          {allDone && !reward && (
            <div style={{ background: 'linear-gradient(90deg,#FFF4E0,#FFEACC)', border: '1.5px solid #FFD37E', borderRadius: 14, padding: '13px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#8a5200', marginBottom: 9 }}>🎉 3/3 friends joined! Pick your reward</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => onClaim('video')} style={{ flex: 1, fontSize: 11.5, fontWeight: 800, color: 'white', background: `linear-gradient(90deg, ${P}, #3B79FF)`, border: 'none', borderRadius: 14, padding: '10px', cursor: 'pointer' }}>🎬 Free Video</button>
                <button onClick={() => onClaim('test')} style={{ flex: 1, fontSize: 11.5, fontWeight: 800, color: 'white', background: 'linear-gradient(90deg,#FFB020,#FF8A00)', border: 'none', borderRadius: 14, padding: '10px', cursor: 'pointer' }}>📝 Free Test</button>
              </div>
            </div>
          )}

          {reward && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: GL, border: `1px solid ${GB}`, borderRadius: 14, padding: '12px 14px' }}>
              <span style={{ fontSize: 22 }}>{reward.type === 'video' ? '🎬' : '📝'}</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: G }}>Reward claimed: Free {reward.type === 'video' ? 'Premium Video' : 'Paid Test'} ✓</div>
                <div style={{ fontSize: 10, color: G, opacity: 0.85 }}>Our team will unlock it in your account shortly</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <MiraIntro open={miraOpen} onDone={dismissMira} />
    </div>
  )
}
