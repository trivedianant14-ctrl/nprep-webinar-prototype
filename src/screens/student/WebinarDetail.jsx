import { useState } from 'react'
import { P, PL, PB, PD, G, GL, GB, R, RL, RB, T1, T2, T3, BD, BG2, BackHeader } from './shared'

function ShareSheet({ session, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <span style={{ fontSize: 15, fontWeight: 700, color: T1 }}>Share this session</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: T3, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${PB}`, background: PL, cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: P, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: PD }}>App deep link (preferred)</div>
              <div style={{ fontSize: 10, color: T2 }}>nprep.app/webinar/{session.id} — opens in-app, works for install + acquisition tracking</div>
            </div>
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${BD}`, background: 'white', cursor: 'pointer', textAlign: 'left' }}>
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

export default function WebinarDetail({ session, isRegistered, isMidSessionRegistrant, studyMaterialDone, onBack, onRegister, onJoinLive, onCompleteStudyMaterial }) {
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

  const studyMaterialSkipped = isMidSessionRegistrant && session.status === 'live'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <BackHeader onBack={onBack} title="Session Details" />

      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        {session.status === 'live' && (
          <div style={{ background: '#FF6B6B', color: 'white', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', boxShadow: '0 0 0 2px rgba(255,255,255,0.4)', animation: 'livePulse 1.4s ease-in-out infinite' }} />
            LIVE NOW
          </div>
        )}

        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: T3, fontWeight: 500 }}>{session.dateLabel} · {session.timeLabel}</span>
            {isRegistered && session.status !== 'cancelled' && (
              <button onClick={() => setShowShare(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: P, fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>
                Share
              </button>
            )}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: T1, lineHeight: 1.4, marginBottom: 10 }}>{session.topic}</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: BG2, border: `1px solid ${BD}`, borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${P}, #6B96F8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
              {session.host[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T1 }}>Hosted by {session.host}</div>
              {session.topperName && (
                <div style={{ fontSize: 11, color: T2, marginTop: 2 }}>
                  with <span style={{ fontWeight: 700, color: PD }}>{session.topperName}</span> · {session.topperRank}
                </div>
              )}
            </div>
          </div>

          {session.status === 'cancelled' && (
            <div style={{ background: RL, border: `1px solid ${RB}`, borderRadius: 12, padding: '14px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: R, marginBottom: 4 }}>This session has been cancelled</div>
              <div style={{ fontSize: 12, color: R, opacity: 0.85 }}>{session.cancelledReason}</div>
            </div>
          )}

          {session.status === 'live' && (
            <>
              <button onClick={() => onJoinLive(session)} style={{ width: '100%', padding: '13px', borderRadius: 12, background: '#FF6B6B', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: 12 }}>
                Join Now →
              </button>
              {studyMaterialSkipped && (
                <div style={{ fontSize: 11, color: T3, textAlign: 'center' }}>Registering mid-session — study material is skipped for this one.</div>
              )}
            </>
          )}

          {session.status === 'scheduled' && (
            <>
              {!isRegistered ? (
                <button onClick={handleRegister} style={{ width: '100%', padding: '13px', borderRadius: 12, background: P, color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: 14 }}>
                  Register for Free
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', borderRadius: 12, background: GL, border: `1px solid ${GB}`, color: G, fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Registered
                </div>
              )}

              {(isRegistered || justConfirmed) && (
                <div style={{ background: 'white', border: `1px solid ${BD}`, borderRadius: 12, padding: '14px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Pre-session Study Material</span>
                  </div>
                  {session.studyMaterialUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      {studyMaterialDone ? (
                        <span style={{ fontSize: 12, fontWeight: 600, color: G }}>✓ Completed — +5% discount earned</span>
                      ) : (
                        <span style={{ fontSize: 12, color: T2 }}>Unlocked — complete it before the session for +5% discount.</span>
                      )}
                      {!studyMaterialDone && (
                        <button className="btn-sm-primary" style={{ flexShrink: 0 }} onClick={() => onCompleteStudyMaterial(session.id)}>Open</button>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: T3, fontStyle: 'italic' }}>Study material hasn't been uploaded yet — check back closer to the session.</div>
                  )}
                </div>
              )}

              <div style={{ fontSize: 11, color: T3, textAlign: 'center' }}>You'll get reminders 24 hours and 1 hour before the session starts.</div>
            </>
          )}
        </div>
      </div>

      {showShare && <ShareSheet session={session} onClose={() => setShowShare(false)} />}
    </div>
  )
}
