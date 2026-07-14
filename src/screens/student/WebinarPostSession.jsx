import { useState } from 'react'
import { P, PL, PB, PD, G, GL, GB, R, RL, RB, T1, T2, T3, BD, BG2, BackHeader, ResourceList } from './shared'

const QUIZ = [
  { q: 'Which level of care includes super-specialty institutes like AIIMS?', options: ['Primary Care', 'Secondary Care', 'Tertiary Care'], correct: 2 },
  { q: 'How much discount does each completed webinar action earn?', options: ['+5%', '+10%', '+15%'], correct: 0 },
]

// The quiz never navigates away — it plays as a game level in an overlay right here.
// One question at a time, instant right/wrong feedback, stars on clear.
function QuizLevel({ onClose, onComplete }) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)
  const q = QUIZ[idx]

  const pick = (i) => {
    if (picked != null) return
    setPicked(i)
    if (i === q.correct) setCorrectCount(c => c + 1)
    setTimeout(() => {
      if (idx + 1 < QUIZ.length) { setIdx(x => x + 1); setPicked(null) }
      else setDone(true)
    }, 900)
  }

  const stars = correctCount === QUIZ.length ? 3 : correctCount > 0 ? 2 : 1

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(6,12,35,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22 }}>
      <div style={{ width: '100%', background: 'white', borderRadius: 22, padding: '20px 18px', animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        {!done ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `linear-gradient(90deg, ${P}, #7C3AED)`, color: 'white', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.05em' }}>
                ⭐ QUIZ LEVEL
              </span>
              {/* Quitting mid-level = no reward: the PRD counts only full completion */}
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: T3, cursor: 'pointer', lineHeight: 1, padding: 2 }}>×</button>
            </div>

            {/* Question progress pips */}
            <div style={{ display: 'flex', gap: 5, margin: '10px 0 14px' }}>
              {QUIZ.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < idx ? G : i === idx ? P : BD, transition: 'background 0.3s' }} />
              ))}
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, color: T3, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Question {idx + 1} of {QUIZ.length}</div>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: T1, lineHeight: 1.45, marginBottom: 14 }}>{q.q}</div>

            {q.options.map((opt, i) => {
              const showCorrect = picked != null && i === q.correct
              const showWrong = picked === i && i !== q.correct
              return (
                <button key={opt} onClick={() => pick(i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '12px 13px', marginBottom: 8, borderRadius: 13, textAlign: 'left', cursor: picked == null ? 'pointer' : 'default', transition: 'all 0.15s',
                    background: showCorrect ? GL : showWrong ? RL : 'white',
                    border: `2px solid ${showCorrect ? GB : showWrong ? RB : BD}` }}>
                  <span style={{ width: 27, height: 27, borderRadius: 9, background: showCorrect ? G : showWrong ? R : '#0B1230', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                    {showCorrect ? '✓' : showWrong ? '✕' : String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: showCorrect ? G : showWrong ? R : T1 }}>{opt}</span>
                </button>
              )
            })}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '6px 0 2px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ fontSize: i === 1 ? 44 : 34, lineHeight: 1, filter: i < stars ? 'none' : 'grayscale(1) opacity(0.35)', animation: `starPop 0.5s ${0.15 + i * 0.18}s cubic-bezier(0.34,1.56,0.64,1) both`, transform: i === 1 ? 'translateY(-4px)' : 'none', display: 'inline-block' }}>⭐</span>
              ))}
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: T1, marginBottom: 5 }}>Level Cleared!</div>
            <div style={{ fontSize: 12, color: T2, marginBottom: 3 }}>{correctCount}/{QUIZ.length} correct</div>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: G, marginBottom: 16 }}>+5% discount earned — it's permanent 🎉</div>
            <button onClick={() => { onComplete(); onClose() }}
              style={{ width: '100%', padding: '13px', borderRadius: 26, background: `linear-gradient(90deg, ${P}, #7C3AED)`, color: 'white', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(29,91,240,0.35)' }}>
              Collect Reward
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function WebinarPostSession({ session, isRegistered, isPaidUser, quizDone, shareCredits, isUnlocked, attendedCount, thisSessionAttended, onUnlock, onBack, onCompleteQuiz, onSubmitFollowUp }) {
  const [showQuiz, setShowQuiz] = useState(false)
  const [followUp, setFollowUp] = useState('')
  const [followUpSaved, setFollowUpSaved] = useState(false)
  const [justEarned, setJustEarned] = useState(false)

  if (!session) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={onBack} style={{ color: P, background: 'none', border: 'none', cursor: 'pointer' }}>← Back to Webinars</button>
      </div>
    )
  }

  const handleSubmitFollowUp = () => {
    onSubmitFollowUp(session.id, followUp)
    setFollowUpSaved(true)
  }

  // Paid members always; freemium too once they've spent a share-earned credit here
  const canSeeRecording = isPaidUser || isUnlocked

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <BackHeader onBack={onBack} title={isRegistered ? 'Post-Session' : 'Recording'} />

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T1, lineHeight: 1.4, marginBottom: 2 }}>{session.topic}</div>
        <div style={{ fontSize: 11, color: T3, marginBottom: 18 }}>{new Date(session.startAt).toLocaleDateString([], { day: 'numeric', month: 'short' })} · {session.host}{session.topperName ? ` · ${session.topperName}` : ''}</div>

        {justEarned && quizDone && (
          <div style={{ background: GL, border: `1px solid ${GB}`, borderRadius: 10, padding: '9px 12px', fontSize: 12, fontWeight: 600, color: G, marginBottom: 16 }}>
            +5% discount earned for clearing the quiz — it's permanent 🎉
          </div>
        )}

        {/* Attendance milestone rewards: watching 50%+ live pays out on the 1st and 2nd session */}
        {thisSessionAttended && attendedCount === 1 && (
          <div style={{ background: 'linear-gradient(90deg,#FFF4E0,#FFEACC)', border: '1.5px solid #FFD37E', borderRadius: 12, padding: '11px 13px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 11, animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <span style={{ fontSize: 24 }}>🎬</span>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#8a5200' }}>Reward unlocked: FREE Premium Video!</div>
              <div style={{ fontSize: 10.5, color: '#B96A00' }}>You watched 50%+ of your first live session — pick any premium video, on us.</div>
            </div>
          </div>
        )}
        {thisSessionAttended && attendedCount >= 2 && (
          <div style={{ background: 'linear-gradient(90deg,#FFF4E0,#FFEACC)', border: '1.5px solid #FFD37E', borderRadius: 12, padding: '11px 13px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 11, animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <span style={{ fontSize: 24 }}>📝</span>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#8a5200' }}>Reward unlocked: FREE Mini Test attempt!</div>
              <div style={{ fontSize: 10.5, color: '#B96A00' }}>Two live sessions attended — one mini test on us, valid for 1 year.</div>
            </div>
          </div>
        )}

        {isRegistered && (
          <>
            {/* 1. Quiz — a tappable game level, plays in an overlay (no page change) */}
            <Section title="1. Post-Webinar Quiz" done={quizDone}>
              {quizDone ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: GL, border: `1.5px solid ${GB}`, borderRadius: 14, padding: '12px 14px' }}>
                  <span style={{ fontSize: 22 }}>⭐⭐⭐</span>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: G }}>Level cleared</div>
                    <div style={{ fontSize: 10.5, color: G, opacity: 0.8 }}>+5% discount banked</div>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowQuiz(true)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, background: `linear-gradient(120deg, ${P} 0%, #7C3AED 100%)`, border: 'none', borderRadius: 16, padding: '14px 15px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 5px 16px rgba(29,91,240,0.32)' }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, animation: 'nodePulse 1.8s ease-in-out infinite' }}>⭐</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: 'white' }}>Quiz Level</div>
                    <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{QUIZ.length} questions · clear it for +5% off</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', color: PD, fontSize: 12, fontWeight: 800, padding: '8px 16px', borderRadius: 20, flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill={PD}><polygon points="5,3 19,12 5,21"/></svg>
                    Play
                  </span>
                </button>
              )}
            </Section>

            {/* 2. Follow-up */}
            <Section title="2. What do you want covered next?" done={followUpSaved}>
              {followUpSaved ? (
                <div style={{ fontSize: 12, color: G, fontWeight: 600 }}>✓ Thanks — shared with the team</div>
              ) : (
                <>
                  <textarea
                    value={followUp}
                    onChange={e => setFollowUp(e.target.value)}
                    placeholder="e.g. more MCQ discussion on Medical Surgical Nursing"
                    rows={3}
                    style={{ width: '100%', border: `1px solid ${BD}`, borderRadius: 8, padding: 10, fontSize: 12, fontFamily: 'inherit', resize: 'none', marginBottom: 10 }}
                  />
                  <button onClick={handleSubmitFollowUp} disabled={!followUp.trim()}
                    style={{ width: '100%', padding: '10px', borderRadius: 10, background: followUp.trim() ? P : BD, color: followUp.trim() ? 'white' : T3, fontSize: 12, fontWeight: 700, border: 'none', cursor: followUp.trim() ? 'pointer' : 'default' }}>
                    Submit
                  </button>
                </>
              )}
            </Section>
          </>
        )}

        {/* Resources — downloadable PDFs from the marketing team */}
        <ResourceList session={session} />

        {/* 3. Recording */}
        <Section title={isRegistered ? '3. Recording' : 'Recording'} done={false} noCheckbox>
          {!session.recordingUrl ? (
            // Marketing hasn't uploaded the recording yet — same placeholder-not-error treatment as study material.
            <div style={{ background: '#f5f5fb', border: `1px dashed ${BD}`, borderRadius: 12, padding: '18px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: T3, fontStyle: 'italic' }}>Recording hasn't been uploaded yet — check back soon.</div>
            </div>
          ) : canSeeRecording ? (
            <div style={{ borderRadius: 12, overflow: 'hidden', background: '#1a1a2e', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {session.thumbnailUrl && <img src={session.thumbnailUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} onError={e => { e.currentTarget.style.display = 'none' }} />}
              <div style={{ position: 'relative', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}><polygon points="5,3 19,12 5,21"/></svg>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ background: '#1a1a2e', aspectRatio: '16/9', filter: 'blur(6px)' }}>
                {session.thumbnailUrl && <img src={session.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none' }} />}
              </div>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(0,0,0,0.45)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <button style={{ padding: '7px 16px', borderRadius: 20, background: 'white', color: PD, fontSize: 11, fontWeight: 700, border: 'none' }}>Upgrade to unlock</button>
                {/* Share-to-unlock alternative: spend a credit earned by sharing a session */}
                {shareCredits > 0 && (
                  <button onClick={() => onUnlock(session.id)} style={{ padding: '7px 16px', borderRadius: 20, background: 'linear-gradient(90deg,#FFB020,#FF8A00)', color: 'white', fontSize: 11, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 3px 10px rgba(255,138,0,0.4)' }}>
                    🔓 Use 1 unlock credit ({shareCredits} left)
                  </button>
                )}
              </div>
            </div>
          )}
        </Section>

        {!isRegistered && (
          <div style={{ fontSize: 11, color: T3, textAlign: 'center', marginTop: 4 }}>Register for future sessions to earn webinar discount rewards.</div>
        )}
      </div>

      {showQuiz && (
        <QuizLevel
          onClose={() => setShowQuiz(false)}
          onComplete={() => { onCompleteQuiz(session.id); setJustEarned(true) }}
        />
      )}
    </div>
  )
}

function Section({ title, done, noCheckbox, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>{title}</span>
        {!noCheckbox && done && (
          <span style={{ fontSize: 10, fontWeight: 700, color: G, background: GL, border: `1px solid ${GB}`, padding: '1px 8px', borderRadius: 20 }}>done</span>
        )}
      </div>
      {children}
    </div>
  )
}
