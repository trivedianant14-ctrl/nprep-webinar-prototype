import { useCallback, useEffect, useState } from 'react'
import Landing from './screens/Landing'
import StudentApp from './screens/student/StudentApp'
import AdminPanel from './screens/cms/AdminPanel'
import SharedLinkFlow from './screens/sharedlink/SharedLinkFlow'

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed (${res.status})`)
  }
  return res.status === 204 ? null : res.json()
}

export default function App() {
  const [topScreen, setTopScreen] = useState('landing') // landing | student | cms | sharedlink
  const [state, setState] = useState(null)
  const [isPaidUser, setIsPaidUser] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const data = await api('/state')
      setState(data)
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // Every mutation hits the backend, then re-hydrates from /api/state — simplest correct
  // approach at this scale, and it means the CMS and student flows are always reading the
  // same server-computed truth (discount %, notification log, registration state).
  const updateSession = async (id, patch) => { await api(`/sessions/${id}`, { method: 'PATCH', body: patch }); await refresh() }
  const createSession = async () => { const created = await api('/sessions', { method: 'POST' }); await refresh(); return created }
  const registerWebinar = async (session) => { await api(`/sessions/${session.id}/register`, { method: 'POST' }); await refresh() }
  const joinWebinarLive = async (session) => { await api(`/sessions/${session.id}/register`, { method: 'POST' }); await refresh() }
  const completeStudyMaterial = async (sessionId) => { await api(`/sessions/${sessionId}/action`, { method: 'POST', body: { action: 'studyMaterial' } }); await refresh() }
  const endWebinarLive = async (session, opts) => { await api(`/sessions/${session.id}/end-live`, { method: 'POST', body: opts }); await refresh() }
  const completeWebinarQuiz = async (sessionId) => { await api(`/sessions/${sessionId}/action`, { method: 'POST', body: { action: 'quiz' } }); await refresh() }
  const submitWebinarFollowUp = async (sessionId, text) => { await api(`/sessions/${sessionId}/followup`, { method: 'POST', body: { text } }); await refresh() }
  const simulateReminder = async (session, kind) => { await api(`/sessions/${session.id}/reminder`, { method: 'POST', body: { kind } }) ; await refresh() }

  const exitToLanding = () => setTopScreen('landing')

  if (!state) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', color: error ? '#791F1F' : '#5a5a78', fontSize: 14, padding: 24, textAlign: 'center' }}>
        {error ? `Couldn't reach the backend: ${error}` : 'Loading…'}
      </div>
    )
  }

  const registeredWebinarIds = new Set(state.registeredSessionIds)
  const webinarMidSessionIds = new Set(state.midSessionIds)

  return (
    <div className="desktop-wrapper">
      {topScreen === 'landing' && <Landing onSelect={setTopScreen} />}

      {topScreen === 'student' && (
        <div className="phone-wrapper">
          <StudentApp
            sessions={state.sessions}
            registeredWebinarIds={registeredWebinarIds}
            webinarMidSessionIds={webinarMidSessionIds}
            webinarActions={state.actionsBySession}
            isPaidUser={isPaidUser}
            toggleIsPaidUser={() => setIsPaidUser(p => !p)}
            webinarDiscountPct={state.discountPct}
            programCap={state.programCap}
            onRegister={registerWebinar}
            onJoinLive={joinWebinarLive}
            onCompleteStudyMaterial={completeStudyMaterial}
            onEndSession={endWebinarLive}
            onCompleteQuiz={completeWebinarQuiz}
            onSubmitFollowUp={submitWebinarFollowUp}
            onExit={exitToLanding}
          />
        </div>
      )}

      {topScreen === 'cms' && (
        <AdminPanel
          sessions={state.sessions}
          onUpdateSession={updateSession}
          onCreateSession={createSession}
          notificationLog={state.notifications}
          onSimulateReminder={simulateReminder}
          onExit={exitToLanding}
        />
      )}

      {topScreen === 'sharedlink' && (
        <div className="phone-wrapper">
          <SharedLinkFlow session={state.sessions.find(s => s.status === 'live') || state.sessions[0]} onExit={exitToLanding} />
        </div>
      )}
    </div>
  )
}
