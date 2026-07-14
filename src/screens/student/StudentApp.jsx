import { useRef, useState } from 'react'
import Home from './Home'
import Tests from './Tests'
import WebinarTab from './WebinarTab'
import WebinarDetail from './WebinarDetail'
import WebinarLive from './WebinarLive'
import WebinarPostSession from './WebinarPostSession'

const DEPTH = { home: 0, tests: 1, webinar: 1, detail: 2, post: 2, live: 3 }

export default function StudentApp({
  sessions, registeredWebinarIds, isPaidUser, toggleIsPaidUser, webinarDiscountPct, programCap,
  webinarActions, webinarMidSessionIds,
  onRegister, onJoinLive, onCompleteStudyMaterial, onEndSession, onCompleteQuiz, onSubmitFollowUp,
  shareCredits, unlockedSessionIds, onShare, onUnlock,
  onExit,
}) {
  const [screen, setScreen] = useState('home')
  const [currentId, setCurrentId] = useState(null)
  // Where the detail/post screens should return to — the webinar tab normally, but the
  // homepage banner deep-links straight into a session, so back should go home from there.
  const [webinarReturnTo, setWebinarReturnTo] = useState('webinar')
  const animDirRef = useRef('forward')

  const goTo = (next) => {
    const currDepth = DEPTH[screen] ?? 0
    const nextDepth = DEPTH[next] ?? 0
    animDirRef.current = nextDepth >= currDepth ? 'forward' : 'backward'
    setScreen(next)
  }

  const currentSession = sessions.find(s => s.id === currentId) || null

  const openWebinar = (session, from = 'webinar') => {
    setCurrentId(session.id)
    setWebinarReturnTo(from)
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
        {screen === 'home' && (
          <Home
            sessions={sessions}
            registeredWebinarIds={registeredWebinarIds}
            onOpenWebinarTab={() => goTo('webinar')}
            onOpenTests={() => goTo('tests')}
            onOpenWebinar={(session) => openWebinar(session, 'home')}
            onExit={onExit}
          />
        )}
        {screen === 'tests' && <Tests onBack={() => goTo('home')} />}
        {screen === 'webinar' && (
          <WebinarTab
            sessions={sessions}
            registeredWebinarIds={registeredWebinarIds}
            isPaidUser={isPaidUser}
            toggleIsPaidUser={toggleIsPaidUser}
            webinarDiscountPct={webinarDiscountPct}
            programCap={programCap}
            shareCredits={shareCredits}
            unlockedSessionIds={unlockedSessionIds}
            openWebinar={(session) => openWebinar(session, 'webinar')}
            onExit={() => goTo('home')}
          />
        )}
        {screen === 'detail' && (
          <WebinarDetail
            session={currentSession}
            isRegistered={currentSession ? registeredWebinarIds.has(currentSession.id) : false}
            isMidSessionRegistrant={currentSession ? webinarMidSessionIds.has(currentSession.id) : false}
            studyMaterialDone={currentSession ? !!webinarActions[currentSession.id]?.studyMaterial : false}
            isPaidUser={isPaidUser}
            onBack={() => goTo(webinarReturnTo)}
            onRegister={onRegister}
            onJoinLive={joinLive}
            onCompleteStudyMaterial={onCompleteStudyMaterial}
            onShare={onShare}
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
            shareCredits={shareCredits}
            isUnlocked={currentSession ? unlockedSessionIds.has(currentSession.id) : false}
            onUnlock={onUnlock}
            onBack={() => goTo(webinarReturnTo)}
            onCompleteQuiz={onCompleteQuiz}
            onSubmitFollowUp={onSubmitFollowUp}
          />
        )}
      </div>
    </div>
  )
}
