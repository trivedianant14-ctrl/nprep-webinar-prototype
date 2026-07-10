import { useState } from 'react'
import { blankSession } from '../../data/webinarData'

const P = '#534AB7', PL = '#EEEDFE', PB = '#AFA9EC', PD = '#3C3489'
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

export default function AdminPanel({ sessions, onUpdateSession, onCreateSession, notificationLog, onSimulateReminder, onExit }) {
  const [selectedId, setSelectedId] = useState(sessions[0]?.id ?? null)
  const [showLog, setShowLog] = useState(false)
  const selected = sessions.find(s => s.id === selectedId) || null

  const handleField = (field, value) => {
    onUpdateSession(selectedId, { [field]: value })
  }

  const handleStatusChange = (newStatus) => {
    onUpdateSession(selectedId, { status: newStatus }, { statusChanged: true })
  }

  const handleNew = () => {
    const id = Math.max(0, ...sessions.map(s => s.id)) + 1
    onCreateSession(blankSession(id))
    setSelectedId(id)
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

  return (
    <div className="wide-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <button onClick={onExit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T2, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
          All flows
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T1 }}>Marketing CMS — Webinar Sessions</div>
          <div style={{ fontSize: 11, color: T3 }}>Create and manage sessions without engineering involvement</div>
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
          {notificationLog.length === 0 && <div style={{ fontSize: 12, color: T3 }}>No notifications fired yet. Change a session's status or date, or use the reminder buttons in the session editor.</div>}
          {[...notificationLog].reverse().map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: `1px solid ${BD}` }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: n.kind === 'alert' ? AL : n.kind === 'cancel' ? RL : GL, color: n.kind === 'alert' ? A : n.kind === 'cancel' ? R : G, border: `1px solid ${n.kind === 'alert' ? AB : n.kind === 'cancel' ? RB : GB}`, flexShrink: 0, height: 'fit-content' }}>
                {n.kind.toUpperCase()}
              </span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T1 }}>{n.title}</div>
                <div style={{ fontSize: 11, color: T2, marginTop: 2 }}>{n.body}</div>
                <div style={{ fontSize: 10, color: T3, marginTop: 3 }}>{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Session list */}
          <div style={{ width: 260, borderRight: `1px solid ${BD}`, overflowY: 'auto', flexShrink: 0 }}>
            <div style={{ padding: 12 }}>
              <button onClick={handleNew} style={{ width: '100%', padding: '9px', borderRadius: 8, background: P, color: 'white', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                + New Session
              </button>
            </div>
            {sessions.map(s => {
              const st = STATUS_STYLE[s.status]
              return (
                <button key={s.id} onClick={() => setSelectedId(s.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 14px', background: selectedId === s.id ? BG2 : 'white', border: 'none', borderBottom: `1px solid ${BD}`, cursor: 'pointer' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T1, marginTop: 6, lineHeight: 1.3 }}>{s.topic || '(untitled session)'}</div>
                  <div style={{ fontSize: 10, color: T3, marginTop: 3 }}>{s.dateLabel || 'no date set'}</div>
                </button>
              )
            })}
          </div>

          {/* Editor */}
          <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
            {!selected ? (
              <div style={{ fontSize: 13, color: T3 }}>Select a session, or create a new one.</div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  {Object.entries(STATUS_STYLE).map(([key, st]) => (
                    <button key={key} onClick={() => handleStatusChange(key)}
                      style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        background: selected.status === key ? st.color : 'white',
                        color: selected.status === key ? 'white' : st.color,
                        border: `1.5px solid ${st.color}` }}>
                      {st.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  <Field label="Host name">
                    <input style={inputStyle} value={selected.host} onChange={e => handleField('host', e.target.value)} placeholder="e.g. Aman Singhal" />
                  </Field>
                  <Field label="Topic">
                    <input style={inputStyle} value={selected.topic} onChange={e => handleField('topic', e.target.value)} placeholder="Session topic" />
                  </Field>
                  <Field label="Topper name (optional)">
                    <input style={inputStyle} value={selected.topperName} onChange={e => handleField('topperName', e.target.value)} placeholder="e.g. Rohit Meena" />
                  </Field>
                  <Field label="NORCET rank (optional)">
                    <input style={inputStyle} value={selected.topperRank} onChange={e => handleField('topperRank', e.target.value)} placeholder="e.g. AIR 15, NORCET 9" />
                  </Field>
                  <Field label="Date">
                    <input style={inputStyle} value={selected.dateLabel} onChange={e => handleField('dateLabel', e.target.value)} placeholder="e.g. Sat, 18 Jul" onBlur={() => onUpdateSession(selectedId, {}, { dateChanged: true })} />
                  </Field>
                  <Field label="Time">
                    <input style={inputStyle} value={selected.timeLabel} onChange={e => handleField('timeLabel', e.target.value)} placeholder="e.g. 7:00 PM – 8:00 PM" onBlur={() => onUpdateSession(selectedId, {}, { dateChanged: true })} />
                  </Field>
                  <Field label="YouTube embed link/ID">
                    <input style={inputStyle} value={selected.youtubeEmbedId} onChange={e => handleField('youtubeEmbedId', e.target.value)} placeholder="YouTube video ID" />
                  </Field>
                  <Field label="Study material (file or link)">
                    <input style={inputStyle} value={selected.studyMaterialUrl} onChange={e => handleField('studyMaterialUrl', e.target.value)} placeholder="Leave blank until ready — shows a placeholder, not an error" />
                  </Field>
                  <Field label="Recording (uploaded after session ends)">
                    <input style={inputStyle} value={selected.recordingUrl} onChange={e => handleField('recordingUrl', e.target.value)} placeholder="/recordings/session.mp4" />
                  </Field>
                  {selected.status === 'cancelled' && (
                    <Field label="Cancellation reason">
                      <input style={inputStyle} value={selected.cancelledReason || ''} onChange={e => handleField('cancelledReason', e.target.value)} placeholder="Shown to students on the card" />
                    </Field>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 6, marginBottom: 24, flexWrap: 'wrap' }}>
                  <button onClick={() => onSimulateReminder(selected, 'T-24h')} style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${BD}`, background: 'white', color: T2, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Simulate T-24h reminder</button>
                  <button onClick={() => onSimulateReminder(selected, 'T-1h')} style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${BD}`, background: 'white', color: T2, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Simulate T-1h reminder</button>
                  <button onClick={() => onSimulateReminder(selected, 'broadcast')} style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${BD}`, background: 'white', color: T2, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Simulate "you missed it" broadcast (P1)</button>
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
