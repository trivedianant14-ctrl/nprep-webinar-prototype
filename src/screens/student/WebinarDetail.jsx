import { useState } from 'react'
import { P, PL, PB, PD, G, GL, GB, R, RL, RB, A, AL, AB, T1, T2, T3, BD, BG2, BackHeader, fmtWhen, countdown, liveViewers, Thumb, ResourceList } from './shared'

function ShareSheet({ session, onClose, onShare }) {
  // null → not shared yet · 'earned' → credit banked · 'repeat' → already shared this session before
  const [shared, setShared] = useState(null)

  const handleShare = async () => {
    const r = await onShare(session.id)
    setShared(r?.creditEarned ? 'earned' : 'repeat')
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <span style={{ fontSize: 15, fontWeight: 700, color: T1 }}>Share this session</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: T3, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Share-to-unlock: first share of a session banks one recording-unlock credit */}
          {shared === 'earned' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: GL, border: `1.5px solid ${GB}`, borderRadius: 12, padding: '12px 14px', animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}>
              <span style={{ fontSize: 22 }}>🔓</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: G }}>+1 unlock credit earned!</div>
                <div style={{ fontSize: 10.5, color: G, opacity: 0.85 }}>Use it to open any locked recording — no upgrade needed</div>
              </div>
            </div>
          ) : shared === 'repeat' ? (
            <div style={{ fontSize: 11, color: T2, background: BG2, borderRadius: 10, padding: '9px 12px' }}>
              Shared again — credits are earned once per session, but every share still helps your friends find it.
            </div>
          ) : (
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8a5200', background: '#FFF4E0', border: '1px solid #FFE0AD', borderRadius: 10, padding: '8px 12px' }}>
              🎁 First share of this session earns +1 recording unlock
            </div>
          )}
          <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${PB}`, background: PL, cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: P, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: PD }}>App deep link (preferred)</div>
              <div style={{ fontSize: 10, color: T2 }}>nprep.app/webinar/{session.id} — opens in-app, works for install + acquisition tracking</div>
            </div>
          </button>
          <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${BD}`, background: 'white', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><polygon points="9,7 9,17 17,12"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T1 }}>YouTube link (fallback)</div>
              <div style={{ fontSize: 10, color: T2 }}>youtube.com/live/{session.youtubeEmbedId || 'xxxxxxxx'} — works without the app</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

const PERKS = [
  { icon: '🎤', label: 'Live Q&A', sub: 'Ask the topper directly' },
  { icon: '📄', label: 'Study material', sub: 'Free with registration' },
  { icon: '🎬', label: 'Full recording', sub: 'For paid members' },
  { icon: '🏷️', label: 'Up to 15% off', sub: '+5% per action' },
]

export default function WebinarDetail({ session, isRegistered, isMidSessionRegistrant, studyMaterialDone, isPaidUser, onBack, onRegister, onJoinLive, onCompleteStudyMaterial, onShare }) {
  const [justConfirmed, setJustConfirmed] = useState(false)
  const [showShare, setShowShare] = useState(false)

  if (!session) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <BackHeader onBack={onBack} title="Webinar" />
        <div style={{ padding: 20, fontSize: 13, color: T3 }}>Session not found.</div>
      </div>
    )
  }

  const handleRegister = () => {
    onRegister(session) // idempotent at the App level — safe to call more than once
    setJustConfirmed(true)
  }

  const isLive = session.status === 'live'
  const isUpcoming = session.status === 'scheduled'
  const proLocked = session.paidOnly && !isPaidUser
  const studyMaterialSkipped = isMidSessionRegistrant && isLive
  const showMaterial = isUpcoming && !proLocked && (isRegistered || justConfirmed)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <BackHeader onBack={onBack} title="Session Details" />

      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Thumbnail header — the session's visual identity carries into the detail view */}
        <Thumb session={session}>
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
            {isLive ? (
              <>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#FF3B5C', color: 'white', fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'white', animation: 'livePulse 1.4s ease-in-out infinite' }} />
                  LIVE
                </span>
                <span style={{ background: 'rgba(6,12,35,0.65)', color: 'white', fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 6 }}>👁 {liveViewers(session)} watching</span>
              </>
            ) : isUpcoming ? (
              <>
                <span style={{ background: 'rgba(6,12,35,0.7)', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 6 }}>⏳ Starts in {countdown(session.startAt) || 'moments'}</span>
                {session.paidOnly && <span style={{ background: 'linear-gradient(90deg,#FFB020,#FF8A00)', color: 'white', fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 6 }}>👑 PRO</span>}
              </>
            ) : null}
          </div>
          <div style={{ position: 'absolute', left: 12, right: 12, bottom: 10 }}>
            <div style={{ color: 'white', fontSize: 15, fontWeight: 800, lineHeight: 1.35, textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>{session.topic}</div>
          </div>
        </Thumb>

        <div style={{ padding: '14px 16px 18px' }}>
          {/* When + share */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: PL, color: PD, fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={PD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {fmtWhen(session.startAt, session.endAt)}
            </span>
            {isRegistered && session.status !== 'cancelled' && (
              <button onClick={() => setShowShare(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: P, fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>
                Share
              </button>
            )}
          </div>

          {/* Educator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: BG2, border: `1px solid ${BD}`, borderRadius: 12, padding: '11px 13px', marginBottom: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${P}, #6B96F8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
              {(session.topperName || session.host)[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {session.topperName ? (
                <>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: T1 }}>{session.topperName} <span style={{ fontSize: 10, fontWeight: 700, color: PD, background: PL, padding: '1px 7px', borderRadius: 10, marginLeft: 2 }}>{session.topperRank}</span></div>
                  <div style={{ fontSize: 10.5, color: T2, marginTop: 2 }}>Hosted by {session.host} · NPrep Faculty</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: T1 }}>{session.host}</div>
                  <div style={{ fontSize: 10.5, color: T2, marginTop: 2 }}>NPrep Faculty</div>
                </>
              )}
            </div>
          </div>

          {/* What you get */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            {PERKS.map(p => (
              <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'white', border: `1px solid ${BD}`, borderRadius: 12, padding: '9px 11px' }}>
                <span style={{ fontSize: 17 }}>{p.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T1 }}>{p.label}</div>
                  <div style={{ fontSize: 9, color: T3 }}>{p.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Study material — clean status card, only once registered */}
          {showMaterial && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'white', border: `1px solid ${studyMaterialDone ? GB : BD}`, borderRadius: 12, padding: '11px 13px', marginBottom: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: studyMaterialDone ? GL : PL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                {studyMaterialDone ? '✅' : '📄'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T1 }}>Pre-session Study Material</div>
                <div style={{ fontSize: 10, color: studyMaterialDone ? G : T2, fontWeight: studyMaterialDone ? 700 : 400, marginTop: 2 }}>
                  {session.studyMaterialUrl
                    ? (studyMaterialDone ? '+5% off earned — nice!' : 'Ready to read · earns +5% off')
                    : 'Uploading soon — we’ll notify you'}
                </div>
              </div>
              {session.studyMaterialUrl ? (
                !studyMaterialDone && <button className="btn-sm-primary" style={{ flexShrink: 0 }} onClick={() => onCompleteStudyMaterial(session.id)}>Open</button>
              ) : (
                <span style={{ fontSize: 9.5, fontWeight: 700, color: A, background: AL, border: `1px solid ${AB}`, padding: '3px 9px', borderRadius: 20, flexShrink: 0 }}>Soon</span>
              )}
            </div>
          )}

          {/* Resources — marketing-uploaded PDFs, downloadable once registered */}
          {!proLocked && (isRegistered || justConfirmed) && <ResourceList session={session} />}

          {studyMaterialSkipped && (
            <div style={{ fontSize: 10.5, color: T3, background: BG2, borderRadius: 10, padding: '8px 12px' }}>
              Registering mid-session — study material is skipped for this one.
            </div>
          )}

          {session.status === 'cancelled' && (
            <div style={{ background: RL, border: `1px solid ${RB}`, borderRadius: 12, padding: '14px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: R, marginBottom: 4 }}>This session has been cancelled</div>
              <div style={{ fontSize: 12, color: R, opacity: 0.85 }}>{session.cancelledReason}</div>
            </div>
          )}
        </div>
      </div>

      {/* Pinned CTA — no dead whitespace below the fold, action always in thumb's reach */}
      {(isLive || isUpcoming) && (
        <div style={{ flexShrink: 0, background: 'white', borderTop: `1px solid ${BD}`, padding: '12px 16px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          {proLocked ? (
            <>
              <button style={{ width: '100%', padding: '13px', borderRadius: 26, background: 'linear-gradient(90deg,#FFB020,#FF8A00)', color: 'white', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(255,138,0,0.35)' }}>
                👑 Upgrade to join this session
              </button>
              <div style={{ fontSize: 10, color: T3, textAlign: 'center', marginTop: 7 }}>This session is exclusive to paid members</div>
            </>
          ) : isLive ? (
            <button onClick={() => onJoinLive(session)} style={{ width: '100%', padding: '13px', borderRadius: 26, background: '#FF3B5C', color: 'white', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(255,59,92,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
              Join Now
            </button>
          ) : !isRegistered ? (
            <>
              <button onClick={handleRegister} style={{ width: '100%', padding: '13px', borderRadius: 26, background: P, color: 'white', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(29,91,240,0.35)' }}>
                Register for Free
              </button>
              <div style={{ fontSize: 10, color: T3, textAlign: 'center', marginTop: 7 }}>Reminders on push + WhatsApp, 24h and 1h before we go live</div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px', borderRadius: 26, background: GL, border: `1px solid ${GB}`, color: G, fontSize: 13.5, fontWeight: 800 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Registered — see you there!
            </div>
          )}
        </div>
      )}

      {showShare && <ShareSheet session={session} onClose={() => setShowShare(false)} onShare={onShare} />}
    </div>
  )
}
