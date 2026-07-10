import { useRef, useState } from 'react'
import WebinarTab from './WebinarTab'
import WebinarDetail from './WebinarDetail'
import WebinarLive from './WebinarLive'
import WebinarPostSession from './WebinarPostSession'

const DEPTH = { webinar: 0, detail: 1, live: 2, post: 1 }

export default function StudentApp({
  sessions, registeredWebinarIds, isPaidUser, toggleIsPaidUser, webinarDiscountPct, programCap,
  webinarActions, webinarMidSessionIds,
  onRegister, onJoinLive, onCompleteStudyMaterial, onEndSession, onCompleteQuiz, onSubmitFollowUp,
  onExit,
}) {
  const [screen, setScreen] = useState('webinar')
  const [currentId, setCurrentId] = useState(null)
  const animDirRef = useRef('forward')

  const goTo = (next) => {
    const currDepth = DEPTH[screen] ?? 0
    const nextDepth = DEPTH[next] ?? 0
    animDirRef.current = nextDepth >= currDepth ? 'forward' : 'backward'
    setScreen(next)
  }

  const currentSession = sessions.find(s => s.id === currentId) || null

  const openWebinar = (session) => {
    setCurrentId(session.id)
    goTo(session.status === 'completed' ? 'post' : 'detail')
  }

  const joinLive = (session) => {
    onJoinLive(session)
    setCurrentId(session.id)
    goTo('live')
  }

  const endLive = (session, opts) => {
    onEndSession(session, opts)
    goTo('post')
  }

  return (
    <div className="phone">
      <div key={screen} className={`screen-trans screen-${animDirRef.current}`}>
        {screen === 'webinar' && (
          <WebinarTab
            sessions={sessions}
            registeredWebinarIds={registeredWebinarIds}
            isPaidUser={isPaidUser}
            toggleIsPaidUser={toggleIsPaidUser}
            webinarDiscountPct={webinarDiscountPct}
            programCap={programCap}
            openWebinar={openWebinar}
            onExit={onExit}
          />
        )}
        {screen === 'detail' && (
          <WebinarDetail
            session={currentSession}
            isRegistered={currentSession ? registeredWebinarIds.has(currentSession.id) : false}
            isMidSessionRegistrant={currentSession ? webinarMidSessionIds.has(currentSession.id) : false}
            studyMaterialDone={currentSession ? !!webinarActions[currentSession.id]?.studyMaterial : false}
            onBack={() => goTo('webinar')}
            onRegister={onRegister}
            onJoinLive={joinLive}
            onCompleteStudyMaterial={onCompleteStudyMaterial}
          />
        )}
        {screen === 'live' && (
          <WebinarLive session={currentSession} onBack={() => goTo('webinar')} onEndSession={endLive} />
        )}
        {screen === 'post' && (
          <WebinarPostSession
            session={currentSession}
            isRegistered={currentSession ? registeredWebinarIds.has(currentSession.id) : false}
            isPaidUser={isPaidUser}
            quizDone={currentSession ? !!webinarActions[currentSession.id]?.quiz : false}
            onBack={() => goTo('webinar')}
            onCompleteQuiz={onCompleteQuiz}
            onSubmitFollowUp={onSubmitFollowUp}
          />
        )}
      </div>
    </div>
  )
}
