import { useState } from 'react'
import Landing from './screens/Landing'
import StudentApp from './screens/student/StudentApp'
import AdminPanel from './screens/cms/AdminPanel'
import SharedLinkFlow from './screens/sharedlink/SharedLinkFlow'
import {
  INITIAL_SESSIONS, DISCOUNT_PER_ACTION, SESSION_DISCOUNT_CAP, PROGRAM_DISCOUNT_CAP,
} from './data/webinarData'

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function App() {
  const [topScreen, setTopScreen] = useState('landing') // landing | student | cms | sharedlink

  const [sessions, setSessions] = useState(INITIAL_SESSIONS)
  const [registeredWebinarIds, setRegisteredWebinarIds] = useState(() => new Set())
  const [webinarMidSessionIds, setWebinarMidSessionIds] = useState(() => new Set())
  const [webinarActions, setWebinarActions] = useState({}) // { [sessionId]: { studyMaterial, liveAttendance, quiz } }
  const [webinarFollowUps, setWebinarFollowUps] = useState([])
  const [isPaidUser, setIsPaidUser] = useState(false)
  const [notificationLog, setNotificationLog] = useState([])

  const logNotification = (kind, title, body) => {
    setNotificationLog(prev => [...prev, { kind, title, body, time: nowLabel() }])
  }

  // ── CMS handlers ──
  const updateSession = (id, patch, meta = {}) => {
    setSessions(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)))
    if (meta.statusChanged && patch.status === 'cancelled') {
      const session = sessions.find(s => s.id === id)
      const count = session?.registeredStudents.length ?? 0
      logNotification('cancel', 'Cancellation pushed to registered students', `${count} student(s) notified that "${session?.topic}" has been cancelled.`)
      logNotification('alert', 'Internal faculty alert', `${session?.host} notified: their session "${session?.topic}" was cancelled.`)
    }
    if (meta.dateChanged) {
      const session = sessions.find(s => s.id === id)
      const count = session?.registeredStudents.length ?? 0
      logNotification('cancel', 'Reschedule pushed to registered students', `${count} student(s) notified of the new date/time for "${session?.topic}".`)
      logNotification('alert', 'Internal faculty alert', `${session?.host} notified of the reschedule for "${session?.topic}".`)
    }
  }

  const createSession = (session) => setSessions(prev => [...prev, session])

  const simulateReminder = (session, kind) => {
    if (kind === 'T-24h') logNotification('reminder', 'T-24h reminder sent', `Push + WhatsApp sent to ${session.registeredStudents.length} registered student(s) for "${session.topic}".`)
    if (kind === 'T-1h') logNotification('reminder', 'T-1h reminder sent', `Push + WhatsApp sent to ${session.registeredStudents.length} registered student(s) for "${session.topic}".`)
    if (kind === 'broadcast') logNotification('reminder', 'Broadcast: "You missed it" (P1 experiment)', `Push sent to all app users who never registered for "${session.topic}" — marketing evaluates performance.`)
  }

  // ── Student handlers ──
  const registerWebinar = (session) => {
    setRegisteredWebinarIds(prev => new Set(prev).add(session.id))
    if (session.status === 'live') {
      setWebinarMidSessionIds(prev => new Set(prev).add(session.id))
    }
  }

  const joinWebinarLive = (session) => {
    if (!registeredWebinarIds.has(session.id)) registerWebinar(session)
  }

  const setWebinarAction = (sessionId, action, value = true) => {
    setWebinarActions(prev => ({ ...prev, [sessionId]: { ...prev[sessionId], [action]: value } }))
  }

  const completeStudyMaterial = (sessionId) => {
    if (webinarMidSessionIds.has(sessionId)) return
    setWebinarAction(sessionId, 'studyMaterial')
  }

  const endWebinarLive = (session, { watchedEnough, viaYoutubeDirect }) => {
    if (watchedEnough && !viaYoutubeDirect) setWebinarAction(session.id, 'liveAttendance')
    logNotification('reminder', 'Post-session push fired', `Registered students for "${session.topic}" were pushed back to the post-session screen.`)
  }

  const completeWebinarQuiz = (sessionId) => setWebinarAction(sessionId, 'quiz')

  const submitWebinarFollowUp = (sessionId, text) => {
    setWebinarFollowUps(prev => [...prev, { sessionId, text, submittedAt: Date.now() }])
  }

  const webinarDiscountPct = Math.min(
    PROGRAM_DISCOUNT_CAP,
    Object.values(webinarActions).reduce((sum, actions) => {
      const earned = Object.values(actions).filter(Boolean).length * DISCOUNT_PER_ACTION
      return sum + Math.min(SESSION_DISCOUNT_CAP, earned)
    }, 0)
  )

  const exitToLanding = () => setTopScreen('landing')

  return (
    <div className="desktop-wrapper">
      {topScreen === 'landing' && <Landing onSelect={setTopScreen} />}

      {topScreen === 'student' && (
        <div className="phone-wrapper">
          <StudentApp
            sessions={sessions}
            registeredWebinarIds={registeredWebinarIds}
            webinarMidSessionIds={webinarMidSessionIds}
            webinarActions={webinarActions}
            isPaidUser={isPaidUser}
            toggleIsPaidUser={() => setIsPaidUser(p => !p)}
            webinarDiscountPct={webinarDiscountPct}
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
          sessions={sessions}
          onUpdateSession={updateSession}
          onCreateSession={createSession}
          notificationLog={notificationLog}
          onSimulateReminder={simulateReminder}
          onExit={exitToLanding}
        />
      )}

      {topScreen === 'sharedlink' && (
        <div className="phone-wrapper">
          <SharedLinkFlow session={sessions.find(s => s.status === 'live') || sessions[0]} onExit={exitToLanding} />
        </div>
      )}
    </div>
  )
}
