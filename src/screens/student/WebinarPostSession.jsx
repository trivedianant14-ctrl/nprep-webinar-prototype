import { useState } from 'react'
import { P, PL, PB, PD, G, GL, GB, T1, T2, T3, BD, BackHeader } from './shared'

const QUIZ = [
  { q: 'Which discount does completing this quiz add to your account?', options: ['+5%', '+10%', '0%'] },
  { q: 'What is the program-wide discount cap?', options: ['15%', '40%', 'No cap'] },
]

export default function WebinarPostSession({ session, isRegistered, isPaidUser, quizDone, onBack, onCompleteQuiz, onSubmitFollowUp }) {
  const [answers, setAnswers] = useState({})
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

  const allAnswered = QUIZ.every((_, i) => answers[i] !== undefined)

  const handleSubmitQuiz = () => {
    onCompleteQuiz(session.id) // binary — full completion only, no partial credit
    setJustEarned(true)
  }

  const handleSubmitFollowUp = () => {
    onSubmitFollowUp(session.id, followUp)
    setFollowUpSaved(true)
  }

  const canSeeRecording = isPaidUser

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <BackHeader onBack={onBack} title={isRegistered ? 'Post-Session' : 'Recording'} />

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T1, lineHeight: 1.4, marginBottom: 2 }}>{session.topic}</div>
        <div style={{ fontSize: 11, color: T3, marginBottom: 18 }}>{session.dateLabel} · {session.host}{session.topperName ? ` · ${session.topperName}` : ''}</div>

        {justEarned && quizDone && (
          <div style={{ background: GL, border: `1px solid ${GB}`, borderRadius: 10, padding: '9px 12px', fontSize: 12, fontWeight: 600, color: G, marginBottom: 16 }}>
            +5% discount earned for completing the quiz — it's permanent 🎉
          </div>
        )}

        {isRegistered && (
          <>
            <Section title="1. Post-Webinar Quiz" done={quizDone}>
              {quizDone ? (
                <div style={{ fontSize: 12, color: G, fontWeight: 600 }}>✓ Completed</div>
              ) : (
                <>
                  {QUIZ.map((q, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T1, marginBottom: 8 }}>{q.q}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {q.options.map((opt, oi) => (
                          <button key={oi} onClick={() => setAnswers(a => ({ ...a, [i]: oi }))}
                            style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                              background: answers[i] === oi ? PL : 'white',
                              border: `1.5px solid ${answers[i] === oi ? P : BD}`,
                              color: answers[i] === oi ? PD : T2, fontWeight: answers[i] === oi ? 600 : 400 }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={handleSubmitQuiz} disabled={!allAnswered}
                    style={{ width: '100%', padding: '11px', borderRadius: 10, background: allAnswered ? P : BD, color: allAnswered ? 'white' : T3, fontSize: 13, fontWeight: 700, border: 'none', cursor: allAnswered ? 'pointer' : 'default' }}>
                    Submit Quiz
                  </button>
                </>
              )}
            </Section>

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

        <Section title={isRegistered ? '3. Recording' : 'Recording'} done={false} noCheckbox>
          {!session.recordingUrl ? (
            // Marketing hasn't uploaded the recording yet — same placeholder-not-error treatment as study material.
            <div style={{ background: '#f5f5fb', border: `1px dashed ${BD}`, borderRadius: 12, padding: '18px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: T3, fontStyle: 'italic' }}>Recording hasn't been uploaded yet — check back soon.</div>
            </div>
          ) : canSeeRecording ? (
            <div style={{ borderRadius: 12, overflow: 'hidden', background: '#1a1a2e', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}><polygon points="5,3 19,12 5,21"/></svg>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ background: '#1a1a2e', aspectRatio: '16/9', filter: 'blur(6px)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(0,0,0,0.45)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <button style={{ padding: '7px 16px', borderRadius: 20, background: 'white', color: PD, fontSize: 11, fontWeight: 700, border: 'none' }}>Upgrade to unlock</button>
              </div>
            </div>
          )}
        </Section>

        {!isRegistered && (
          <div style={{ fontSize: 11, color: T3, textAlign: 'center', marginTop: 4 }}>Register for future sessions to earn webinar discount rewards.</div>
        )}
      </div>
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
