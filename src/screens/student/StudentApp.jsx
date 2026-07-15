import { useEffect, useRef, useState } from 'react'
import Home from './Home'
import Tests from './Tests'
import WebinarTab from './WebinarTab'
import WebinarDetail from './WebinarDetail'
import WebinarLive from './WebinarLive'
import WebinarPostSession from './WebinarPostSession'
import ReferralJourney from './ReferralJourney'
import { attendedCountFrom } from './shared'

const DEPTH = { home: 0, tests: 1, webinar: 1, detail: 2, post: 2, live: 3, referral: 2 }

export default function StudentApp({
  sessions, registeredWebinarIds, isPaidUser, toggleIsPaidUser, webinarDiscountPct, programCap,
  webinarActions, webinarMidSessionIds,
  onRegister, onJoinLive, onCompleteStudyMaterial, onEndSession, onCompleteQuiz, onSubmitFollowUp,
  shareCredits, unlockedSessionIds, onShare, onUnlock,
  referralCode, referrals, referralReward, onInviteFriend, onAdvanceReferral, onClaimReferralReward,
  onResetJourney,
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
  const attendedCount = attendedCountFrom(webinarActions)

  // Referral's reward is a free test/video — nothing in it for a paid member, who already
  // has both. The entry banner is hidden for them, but the demo's Freemium/Paid toggle can
  // still flip mid-screen, so bounce out defensively rather than leave a dead-end open.
  useEffect(() => { if (isPaidUser && screen === 'referral') goTo('webinar') }, [isPaidUser, screen]) // eslint-disable-line react-hooks/exhaustive-deps

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
            attendedCount={attendedCount}
            openWebinar={(session) => openWebinar(session, 'webinar')}
            onOpenReferrals={() => goTo('referral')}
            onResetJourney={onResetJourney}
            onExit={() => goTo('home')}
          />
        )}
        {screen === 'referral' && (
          <ReferralJourney
            code={referralCode}
            referrals={referrals}
            reward={referralReward}
            onInvite={onInviteFriend}
            onAdvance={onAdvanceReferral}
            onClaim={onClaimReferralReward}
            onClose={() => goTo('webinar')}
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
            attendedCount={attendedCount}
            thisSessionAttended={currentSession ? !!webinarActions[currentSession.id]?.liveAttendance : false}
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
