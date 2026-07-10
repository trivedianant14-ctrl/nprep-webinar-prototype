import { useState } from 'react'

const P = '#534AB7', PL = '#EEEDFE', PB = '#AFA9EC', PD = '#3C3489'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'

const FLOWS = [
  {
    id: 'student',
    tag: 'Student journey',
    title: 'Student App',
    desc: 'Webinar tab, homepage banner, registration + study material, embedded live player with chat, post-session quiz & recording, discount meter.',
  },
  {
    id: 'cms',
    tag: 'Marketing & topper journey',
    title: 'Marketing CMS',
    desc: 'Create/edit sessions, change status, see auto-triggered student & faculty notifications, export the registered list for sales.',
  },
  {
    id: 'sharedlink',
    tag: 'Acquisition journey · P1',
    title: 'New User / Shared Link',
    desc: 'What happens when a friend taps a shared webinar link — with the app, without the app, or via a plain YouTube link.',
  },
]

const TOPPER_STEPS = [
  ['T-2 weeks', 'Marketing calls topper, confirms availability, agrees compensation'],
  ['T-1 week', 'Script + session brief sent via WhatsApp or email'],
  ['T-24 hours', 'YouTube Live co-host link sent to topper by marketing'],
  ['T-15 minutes', 'Marketing check-in call — technical verification before going live'],
  ['If topper cancels', 'Marketing decides: faculty-only, alternate topper, or reschedule — no automated fallback'],
  ['Post-session', 'Compensation processed; roster decision is marketing\'s call'],
]

export default function Landing({ onSelect }) {
  const [showOps, setShowOps] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px', background: 'linear-gradient(180deg, #eeeef5 0%, #f5f5fb 100%)' }}>
      <div style={{ width: '100%', maxWidth: 720 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: PL, color: PD, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, marginBottom: 14 }}>
            NPrep Webinar Program — Prototype
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: T1, marginBottom: 8 }}>Every flow in the webinar journey</h1>
          <p style={{ fontSize: 14, color: T2, maxWidth: 480, margin: '0 auto', lineHeight: 1.5 }}>
            Pick a flow below to walk through it end to end, exactly as scoped in the PRD.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
          {FLOWS.map(f => (
            <button key={f.id} onClick={() => onSelect(f.id)} style={{ textAlign: 'left', background: 'white', border: `1.5px solid ${BD}`, borderRadius: 16, padding: '20px 18px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: PD, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.tag}</span>
              <span style={{ fontSize: 17, fontWeight: 700, color: T1 }}>{f.title}</span>
              <span style={{ fontSize: 12, color: T2, lineHeight: 1.5, flex: 1 }}>{f.desc}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: P, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                Open flow <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </span>
            </button>
          ))}
        </div>

        <button onClick={() => setShowOps(v => !v)} style={{ width: '100%', textAlign: 'left', background: BG2, border: `1px solid ${BD}`, borderRadius: 12, padding: '14px 18px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ops process · not a screen in the app</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: T1, marginTop: 3 }}>Topper Coordination Timeline</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.5" style={{ transform: showOps ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}><path d="M9 18l6-6-6-6"/></svg>
          </div>
          {showOps && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TOPPER_STEPS.map(([step, desc]) => (
                <div key={step} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: P, minWidth: 100, flexShrink: 0 }}>{step}</span>
                  <span style={{ fontSize: 12, color: T2, lineHeight: 1.5 }}>{desc}</span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: T3, marginTop: 4, fontStyle: 'italic' }}>
                Product's only dependency here is the cancellation/reschedule notification, covered inside the Marketing CMS flow.
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
