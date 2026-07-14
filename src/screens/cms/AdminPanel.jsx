import { useEffect, useState } from 'react'

const P = '#1D5BF0', PL = '#EAF0FE', PB = '#A9C4FA', PD = '#12339B'
const G = '#3B6D11', GL = '#EAF3DE', GB = '#97C459'
const R = '#791F1F', RL = '#FCEBEB', RB = '#F09595'
const A = '#633806', AL = '#FAEEDA', AB = '#FAC775'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'

const STATUS_STYLE = {
  scheduled: { bg: PL, color: PD, border: PB, label: 'Scheduled' },
  live: { bg: '#FFEAEA', color: '#C62828', border: '#FF6B6B', label: 'Live' },
  completed: { bg: GL, color: G, border: GB, label: 'Completed' },
  cancelled: { bg: RL, color: R, border: RB, label: 'Cancelled' },
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T2, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      {children}
    </label>
  )
}

const inputStyle = { width: '100%', padding: '9px 12px', border: `1px solid ${BD}`, borderRadius: 8, fontSize: 13, fontFamily: 'inherit', color: T1 }

// ISO ↔ datetime-local ("YYYY-MM-DDTHH:mm" in the marketer's local time)
const toLocal = (iso) => {
  const d = new Date(iso)
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}
const fromLocal = (v) => new Date(v).toISOString()

// Live countdown/elapsed copy for the status chip
function timingCopy(session) {
  const now = Date.now()
  const start = new Date(session.startAt).getTime()
  const end = new Date(session.endAt).getTime()
  const span = (ms) => {
    const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.max(1, Math.floor((ms % 36e5) / 6e4))
    return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`
  }
  if (session.status === 'cancelled') return 'not visible to students'
  if (session.status === 'scheduled') return `goes live in ${span(start - now)}`
  if (session.status === 'live') return `ends in ${span(end - now)}`
  return `ended ${span(now - end)} ago`
}

function WhatsAppBubble({ body }) {
  return (
    <div style={{ marginTop: 8, maxWidth: 420 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#128C7E', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="#25D366"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.5 14.2c-.2.7-1.4 1.3-1.9 1.3-.5.1-1.1.1-1.8-.1a16 16 0 01-6.7-5.9c-.5-.9-.9-2-.7-2.9.1-.6.7-1.6 1.3-1.7h.9c.3 0 .5.1.7.6l.8 2c.1.2.1.4 0 .6l-.5.8c-.2.2-.2.4-.1.6a8 8 0 003.6 3.2c.2.1.5.1.6-.1l.8-1c.2-.2.4-.3.6-.2l2 1c.4.2.5.4.4.8z"/></svg>
        WhatsApp preview · sent to registered students
      </div>
      <div style={{ background: '#DCF8C6', borderRadius: '2px 10px 10px 10px', padding: '8px 10px', fontSize: 11.5, color: '#1a1a2e', lineHeight: 1.5, boxShadow: '0 1px 1px rgba(0,0,0,0.08)' }}>
        {body}
        <div style={{ textAlign: 'right', fontSize: 9, color: '#7a9b76', marginTop: 3 }}>now ✓✓</div>
      </div>
    </div>
  )
}

export default function AdminPanel({ sessions, onUpdateSession, onCreateSession, notificationLog, onSimulateReminder, onExit }) {
  const [selectedId, setSelectedId] = useState(sessions[0]?.id ?? null)
  const [showLog, setShowLog] = useState(false)
  const selected = sessions.find(s => s.id === selectedId) || null

  // Local draft so typing doesn't fire a network request per keystroke — each field is
  // PATCHed to the backend on blur. The backend detects real vs no-op changes before
  // firing any reschedule/cancel notification, so blurring an untouched field is safe.
  const [draft, setDraft] = useState(selected)
  useEffect(() => { setDraft(selected) }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps
  // Keep the draft's non-focused fields in sync when the poller refreshes sessions
  useEffect(() => { if (selected && document.activeElement?.tagName !== 'INPUT') setDraft(selected) }, [selected]) // eslint-disable-line react-hooks/exhaustive-deps

  // Tick every 30s so "goes live in…" countdowns stay current
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const setDraftField = (field, value) => setDraft(d => ({ ...d, [field]: value }))
  const saveField = (field) => onUpdateSession(selectedId, { [field]: draft[field] })

  const handleNew = async () => {
    const created = await onCreateSession()
    if (created?.id) setSelectedId(created.id)
  }

  const exportCSV = (session) => {
    const rows = [['Name', 'Phone', 'Registered At'], ...session.registeredStudents.map(s => [s.name, s.phone, s.registeredAt])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${session.topic.slice(0, 30).replace(/[^a-z0-9]+/gi, '-')}-registrants.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const st = selected ? STATUS_STYLE[selected.status] : null

  return (
    <div className="wide-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <button onClick={onExit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T2, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
          All flows
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T1 }}>Marketing CMS — Webinar Sessions</div>
          <div style={{ fontSize: 11, color: T3 }}>Status is schedule-driven — set the times and the platform handles Scheduled → Live → Completed on its own</div>
        </div>
        <button onClick={() => setShowLog(v => !v)} style={{ position: 'relative', padding: '7px 14px', borderRadius: 8, border: `1px solid ${BD}`, background: showLog ? P : 'white', color: showLog ? 'white' : T2, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          Notification Log {notificationLog.length > 0 && `(${notificationLog.length})`}
        </button>
      </div>

      {showLog ? (
        <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          <div style={{ fontSize: 13, color: T3, marginBottom: 14 }}>
            Every push/WhatsApp/internal alert the system fires automatically — no manual marketing action required (PRD req. #5, #7, #9).
          </div>
          {notificationLog.length === 0 && <div style={{ fontSize: 12, color: T3 }}>No notifications fired yet. Cancel or reschedule a session, or use the reminder buttons in the session editor.</div>}
          {[...notificationLog].reverse().map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: `1px solid ${BD}` }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: n.kind === 'alert' ? AL : n.kind === 'cancel' ? RL : GL, color: n.kind === 'alert' ? A : n.kind === 'cancel' ? R : G, border: `1px solid ${n.kind === 'alert' ? AB : n.kind === 'cancel' ? RB : GB}`, flexShrink: 0, height: 'fit-content' }}>
                {n.kind.toUpperCase()}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T1 }}>{n.title}</div>
                <div style={{ fontSize: 11, color: T2, marginTop: 2 }}>{n.body}</div>
                <div style={{ fontSize: 10, color: T3, marginTop: 3 }}>{n.time}</div>
                {(n.kind === 'cancel' || (n.kind === 'reminder' && n.body.includes('WhatsApp'))) && <WhatsAppBubble body={n.body} />}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Session list */}
          <div style={{ width: 280, borderRight: `1px solid ${BD}`, overflowY: 'auto', flexShrink: 0 }}>
            <div style={{ padding: 12 }}>
              <button onClick={handleNew} style={{ width: '100%', padding: '9px', borderRadius: 8, background: P, color: 'white', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                + New Session
              </button>
            </div>
            {sessions.map(s => {
              const sty = STATUS_STYLE[s.status]
              return (
                <button key={s.id} onClick={() => setSelectedId(s.id)} style={{ display: 'flex', gap: 10, width: '100%', textAlign: 'left', padding: '11px 12px', background: selectedId === s.id ? BG2 : 'white', border: 'none', borderBottom: `1px solid ${BD}`, cursor: 'pointer', alignItems: 'flex-start' }}>
                  <div style={{ width: 64, height: 40, borderRadius: 6, overflow: 'hidden', background: 'linear-gradient(135deg,#12339B,#3B79FF)', flexShrink: 0 }}>
                    {s.thumbnailUrl && <img src={s.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: sty.bg, color: sty.color, border: `1px solid ${sty.border}` }}>{sty.label}</span>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: T1, marginTop: 4, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.topic || '(untitled session)'}</div>
                    <div style={{ fontSize: 9.5, color: T3, marginTop: 2 }}>{new Date(s.startAt).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Editor */}
          <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
            {!selected || !draft ? (
              <div style={{ fontSize: 13, color: T3 }}>Select a session, or create a new one.</div>
            ) : (
              <>
                {/* Schedule & status — the status chip is computed, never set by hand */}
                <div style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 12, padding: '14px 16px', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, padding: '5px 14px', borderRadius: 20, background: st.bg, color: st.color, border: `1.5px solid ${st.border}` }}>
                      {selected.status === 'live' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF3B5C', animation: 'livePulse 1.4s ease-in-out infinite' }} />}
                      {st.label}
                    </span>
                    <span style={{ fontSize: 11.5, color: T2 }}>· {timingCopy(selected)}</span>
                    <span style={{ fontSize: 10, color: T3, marginLeft: 'auto' }}>auto-updates from the times below</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                    <Field label="Starts at">
                      <input type="datetime-local" style={inputStyle} value={toLocal(draft.startAt)}
                        onChange={e => setDraftField('startAt', fromLocal(e.target.value))}
                        onBlur={() => saveField('startAt')} />
                    </Field>
                    <Field label="Ends at">
                      <input type="datetime-local" style={inputStyle} value={toLocal(draft.endAt)}
                        onChange={e => setDraftField('endAt', fromLocal(e.target.value))}
                        onBlur={() => saveField('endAt')} />
                    </Field>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {selected.status === 'scheduled' && (
                      <button onClick={() => {
                        const now = new Date()
                        onUpdateSession(selectedId, { startAt: now.toISOString(), endAt: new Date(Math.max(new Date(selected.endAt), now.getTime() + 60 * 60 * 1000)).toISOString() })
                      }} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#FF3B5C', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        ▶ Go live now
                      </button>
                    )}
                    {selected.status === 'live' && (
                      <button onClick={() => onUpdateSession(selectedId, { endAt: new Date().toISOString() })}
                        style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${BD}`, background: 'white', color: T1, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        ■ End now
                      </button>
                    )}
                    {selected.status !== 'cancelled' && selected.status !== 'completed' && (
                      <button onClick={() => onUpdateSession(selectedId, { status: 'cancelled' })}
                        style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${RB}`, background: RL, color: R, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        Cancel session
                      </button>
                    )}
                    {selected.status === 'cancelled' && (
                      <button onClick={() => onUpdateSession(selectedId, { status: 'scheduled' })}
                        style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${GB}`, background: GL, color: G, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        Restore session
                      </button>
                    )}
                  </div>
                  {selected.status === 'cancelled' && (
                    <div style={{ fontSize: 10.5, color: R, marginTop: 8 }}>
                      Hidden from the student app. Registered students were told via push + WhatsApp (see Notification Log).
                    </div>
                  )}
                  {/* Per-session access control (PRD P2, pulled forward): freemium sees the
                      card with a PRO lock + upgrade CTA instead of Register */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, cursor: 'pointer', width: 'fit-content' }}>
                    <input type="checkbox" checked={!!selected.paidOnly} onChange={e => onUpdateSession(selectedId, { paidOnly: e.target.checked })} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#8a5200' }}>👑 Paid members only</span>
                    <span style={{ fontSize: 10, color: T3 }}>— freemium users see it locked with an upgrade CTA</span>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  <Field label="Host name">
                    <input style={inputStyle} value={draft.host} onChange={e => setDraftField('host', e.target.value)} onBlur={() => saveField('host')} placeholder="e.g. Aman Singhal" />
                  </Field>
                  <Field label="Topic">
                    <input style={inputStyle} value={draft.topic} onChange={e => setDraftField('topic', e.target.value)} onBlur={() => saveField('topic')} placeholder="Session topic" />
                  </Field>
                  <Field label="Topper name (optional)">
                    <input style={inputStyle} value={draft.topperName} onChange={e => setDraftField('topperName', e.target.value)} onBlur={() => saveField('topperName')} placeholder="e.g. Rohit Meena" />
                  </Field>
                  <Field label="NORCET rank (optional)">
                    <input style={inputStyle} value={draft.topperRank} onChange={e => setDraftField('topperRank', e.target.value)} onBlur={() => saveField('topperRank')} placeholder="e.g. AIR 15, NORCET 9" />
                  </Field>
                  <Field label="YouTube embed link/ID">
                    <input style={inputStyle} value={draft.youtubeEmbedId} onChange={e => setDraftField('youtubeEmbedId', e.target.value)} onBlur={() => saveField('youtubeEmbedId')} placeholder="YouTube video ID" />
                  </Field>
                  <Field label="Study material (file or link)">
                    <input style={inputStyle} value={draft.studyMaterialUrl} onChange={e => setDraftField('studyMaterialUrl', e.target.value)} onBlur={() => saveField('studyMaterialUrl')} placeholder="Leave blank until ready — shows a placeholder, not an error" />
                  </Field>
                  <Field label="Recording (uploaded after session ends)">
                    <input style={inputStyle} value={draft.recordingUrl} onChange={e => setDraftField('recordingUrl', e.target.value)} onBlur={() => saveField('recordingUrl')} placeholder="/recordings/session.mp4" />
                  </Field>
                  {selected.status === 'cancelled' && (
                    <Field label="Cancellation reason">
                      <input style={inputStyle} value={draft.cancelledReason || ''} onChange={e => setDraftField('cancelledReason', e.target.value)} onBlur={() => saveField('cancelledReason')} placeholder="Included in the push + WhatsApp message" />
                    </Field>
                  )}
                </div>

                {/* Thumbnail — every session card in the app is thumbnail-first */}
                <div style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 12, padding: '14px 16px', marginBottom: 18, display: 'flex', gap: 16 }}>
                  <div style={{ width: 176, height: 99, borderRadius: 8, overflow: 'hidden', background: 'linear-gradient(135deg,#12339B,#3B79FF)', flexShrink: 0 }}>
                    {draft.thumbnailUrl && <img src={draft.thumbnailUrl} alt="thumbnail preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Field label="Thumbnail (shown on every webinar card)">
                      <input style={inputStyle} value={draft.thumbnailUrl} onChange={e => setDraftField('thumbnailUrl', e.target.value)} onBlur={() => saveField('thumbnailUrl')} placeholder="Image URL — or pull it from the YouTube video" />
                    </Field>
                    <button
                      disabled={!draft.youtubeEmbedId}
                      onClick={() => {
                        const url = `https://img.youtube.com/vi/${draft.youtubeEmbedId}/hqdefault.jpg`
                        setDraft(d => ({ ...d, thumbnailUrl: url }))
                        onUpdateSession(selectedId, { thumbnailUrl: url })
                      }}
                      style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${draft.youtubeEmbedId ? PB : BD}`, background: draft.youtubeEmbedId ? PL : 'white', color: draft.youtubeEmbedId ? PD : T3, fontSize: 11, fontWeight: 700, cursor: draft.youtubeEmbedId ? 'pointer' : 'not-allowed' }}>
                      Use YouTube thumbnail
                    </button>
                  </div>
                </div>

                {/* Topper coordination — the product's slice of the ops timeline: the
                    co-host link goes to the topper at T-24h so they can test their setup */}
                <div style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 12, padding: '14px 16px', marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: T1, marginBottom: 3 }}>🎙 Topper & faculty access</div>
                  <div style={{ fontSize: 10.5, color: T3, marginBottom: 10 }}>
                    YouTube Live co-host link — send at T-24h, then the T-15 min check-in call catches technical issues before going live.
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <code style={{ flex: 1, minWidth: 220, fontSize: 11, color: T2, background: 'white', border: `1px solid ${BD}`, borderRadius: 8, padding: '8px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      studio.youtube.com/live/{selected.youtubeEmbedId || 'xxxxxxxx'}/cohost?key=np-{selected.id}
                    </code>
                    <button onClick={(e) => { navigator.clipboard?.writeText(`https://studio.youtube.com/live/${selected.youtubeEmbedId}/cohost?key=np-${selected.id}`); e.target.textContent = 'Copied ✓'; setTimeout(() => { e.target.textContent = 'Copy link' }, 1500) }}
                      style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${PB}`, background: PL, color: PD, fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                      Copy link
                    </button>
                    <button onClick={() => onSimulateReminder(selected, 'cohost')} disabled={selected.status !== 'scheduled'}
                      style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: selected.status === 'scheduled' ? P : BD, color: selected.status === 'scheduled' ? 'white' : T3, fontSize: 11, fontWeight: 700, cursor: selected.status === 'scheduled' ? 'pointer' : 'not-allowed', flexShrink: 0 }}>
                      Send to {selected.topperName ? selected.topperName.split(' ')[0] : 'topper'} (T-24h)
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  {(() => {
                    const remindersEnabled = selected.status === 'scheduled'
                    const broadcastEnabled = selected.status === 'completed'
                    const btnStyle = (enabled) => ({ padding: '7px 12px', borderRadius: 8, border: `1px solid ${BD}`, background: 'white', color: enabled ? T2 : T3, fontSize: 11, fontWeight: 600, cursor: enabled ? 'pointer' : 'not-allowed', opacity: enabled ? 1 : 0.5 })
                    return (
                      <>
                        <button onClick={() => onSimulateReminder(selected, 'T-24h')} disabled={!remindersEnabled} style={btnStyle(remindersEnabled)}>Simulate T-24h reminder</button>
                        <button onClick={() => onSimulateReminder(selected, 'T-1h')} disabled={!remindersEnabled} style={btnStyle(remindersEnabled)}>Simulate T-1h reminder</button>
                        <button onClick={() => onSimulateReminder(selected, 'broadcast')} disabled={!broadcastEnabled} style={btnStyle(broadcastEnabled)}>Simulate "you missed it" broadcast (P1)</button>
                      </>
                    )
                  })()}
                </div>
                <div style={{ fontSize: 10, color: T3, marginBottom: 16 }}>
                  Reminders are only available while a session is Scheduled; the broadcast only applies once it's Completed.
                </div>

                <div style={{ borderTop: `1px solid ${BD}`, paddingTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Registered students ({selected.registeredStudents.length})</span>
                    <button onClick={() => exportCSV(selected)} disabled={selected.registeredStudents.length === 0}
                      style={{ padding: '6px 14px', borderRadius: 8, background: selected.registeredStudents.length ? P : BD, color: selected.registeredStudents.length ? 'white' : T3, border: 'none', fontSize: 11, fontWeight: 700, cursor: selected.registeredStudents.length ? 'pointer' : 'default' }}>
                      Export list (.csv)
                    </button>
                  </div>
                  {selected.registeredStudents.length === 0 ? (
                    <div style={{ fontSize: 12, color: T3 }}>No registrations yet.</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ textAlign: 'left', color: T3, fontSize: 10, textTransform: 'uppercase' }}>
                          <th style={{ padding: '4px 0' }}>Name</th><th>Phone</th><th>Registered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.registeredStudents.map((s, i) => (
                          <tr key={i} style={{ borderTop: `1px solid ${BD}` }}>
                            <td style={{ padding: '6px 0', color: T1 }}>{s.name}</td>
                            <td style={{ color: T2 }}>{s.phone}</td>
                            <td style={{ color: T2 }}>{s.registeredAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  <div style={{ fontSize: 10, color: T3, marginTop: 8 }}>Manual export in v1 — delivered to sales within 24 hours of each session (PRD req. per Success Metrics).</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
