// One-time setup: creates tables and seeds initial demo data.
// Run with: node --env-file=.env.local scripts/setup-db.mjs
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const SCHEMA = `
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'scheduled',
  host TEXT NOT NULL DEFAULT '',
  topper_name TEXT NOT NULL DEFAULT '',
  topper_rank TEXT NOT NULL DEFAULT '',
  topic TEXT NOT NULL DEFAULT '',
  date_label TEXT NOT NULL DEFAULT '',
  time_label TEXT NOT NULL DEFAULT '',
  days_out INTEGER NOT NULL DEFAULT 30,
  youtube_embed_id TEXT NOT NULL DEFAULT '',
  study_material_url TEXT NOT NULL DEFAULT '',
  recording_url TEXT NOT NULL DEFAULT '',
  cancelled_reason TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_key TEXT NOT NULL,
  student_name TEXT NOT NULL DEFAULT '',
  student_phone TEXT NOT NULL DEFAULT '',
  mid_session BOOLEAN NOT NULL DEFAULT false,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, student_key)
);

CREATE TABLE IF NOT EXISTS actions (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_key TEXT NOT NULL,
  study_material BOOLEAN NOT NULL DEFAULT false,
  live_attendance BOOLEAN NOT NULL DEFAULT false,
  quiz BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(session_id, student_key)
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS followups (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_key TEXT NOT NULL DEFAULT 'demo',
  body TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`

const SESSIONS = [
  {
    status: 'scheduled', host: 'Aman Singhal', topperName: '', topperRank: '',
    topic: 'Cracking NORCET in 90 Days — A Study Plan That Works',
    dateLabel: 'Sat, 18 Jul', timeLabel: '7:00 PM – 8:00 PM', daysOut: 8,
    youtubeEmbedId: 'dQw4w9WgXcQ', studyMaterialUrl: '', recordingUrl: '',
    registrants: [],
  },
  {
    status: 'scheduled', host: 'Priya Sharma', topperName: 'Rohit Meena', topperRank: 'AIR 15, NORCET 9',
    topic: 'From Tier-3 City to AIR 15 — My NORCET Journey',
    dateLabel: 'Tue, 21 Jul', timeLabel: '6:30 PM – 7:30 PM', daysOut: 11,
    youtubeEmbedId: 'dQw4w9WgXcQ', studyMaterialUrl: '/study-material/norcet-journey-notes.pdf', recordingUrl: '',
    registrants: [
      { name: 'Kavya R.', phone: '98xxxxx210' },
      { name: 'Suresh M.', phone: '87xxxxx004' },
    ],
  },
  {
    status: 'live', host: 'Aman Singhal', topperName: 'Sanya Kapoor', topperRank: 'AIR 42, NORCET 9',
    topic: 'MCQ Discussion — Community Health Nursing High-Yield Topics',
    dateLabel: 'Today', timeLabel: '4:00 PM – 5:00 PM', daysOut: 0,
    youtubeEmbedId: 'dQw4w9WgXcQ', studyMaterialUrl: '/study-material/chn-high-yield.pdf', recordingUrl: '',
    registrants: [
      { name: 'Priya S.', phone: '99xxxxx881' },
      { name: 'Rohit K.', phone: '90xxxxx117' },
      { name: 'Anjali M.', phone: '81xxxxx552' },
    ],
  },
  {
    status: 'completed', host: 'Priya Sharma', topperName: 'Karan Deshmukh', topperRank: 'AIR 8, NORCET 8',
    topic: 'Time Table Secrets of a Topper — Balancing Job + Prep',
    dateLabel: '3 Jul 2026', timeLabel: '7:00 PM – 8:00 PM', daysOut: -7,
    youtubeEmbedId: 'dQw4w9WgXcQ', studyMaterialUrl: '/study-material/time-table-secrets.pdf', recordingUrl: '/recordings/topper-time-table.mp4',
    registrants: [
      { name: 'Deepak V.', phone: '70xxxxx339' },
      { name: 'Sneha R.', phone: '96xxxxx662' },
    ],
  },
  {
    status: 'completed', host: 'Aman Singhal', topperName: 'Ritika Nair', topperRank: 'AIR 23, NORCET 7',
    topic: 'Last 15 Days Revision Strategy Before the Exam',
    dateLabel: '20 Jun 2026', timeLabel: '6:00 PM – 7:00 PM', daysOut: -20,
    youtubeEmbedId: 'dQw4w9WgXcQ', studyMaterialUrl: '/study-material/last-15-days.pdf', recordingUrl: '/recordings/last-15-days-revision.mp4',
    registrants: [{ name: 'Meera J.', phone: '82xxxxx773' }],
  },
  {
    status: 'cancelled', host: 'Priya Sharma', topperName: 'Vikram Rathi', topperRank: 'AIR 55, NORCET 9',
    topic: 'Interview Prep for Government Nursing Postings',
    dateLabel: 'Fri, 10 Jul', timeLabel: '7:00 PM – 8:00 PM', daysOut: -1,
    youtubeEmbedId: '', studyMaterialUrl: '', recordingUrl: '',
    cancelledReason: 'Topper unavailable due to a scheduling conflict',
    registrants: [{ name: 'Farhan A.', phone: '93xxxxx208' }],
  },
]

async function main() {
  console.log('Creating schema...')
  for (const stmt of SCHEMA.split(';').map(s => s.trim()).filter(Boolean)) {
    await sql.query(stmt)
  }

  console.log('Clearing existing demo data...')
  await sql.query('TRUNCATE followups, notifications, actions, registrations, sessions RESTART IDENTITY CASCADE')

  console.log('Seeding sessions...')
  for (const s of SESSIONS) {
    const [row] = await sql`
      INSERT INTO sessions (status, host, topper_name, topper_rank, topic, date_label, time_label, days_out, youtube_embed_id, study_material_url, recording_url, cancelled_reason)
      VALUES (${s.status}, ${s.host}, ${s.topperName}, ${s.topperRank}, ${s.topic}, ${s.dateLabel}, ${s.timeLabel}, ${s.daysOut}, ${s.youtubeEmbedId}, ${s.studyMaterialUrl}, ${s.recordingUrl}, ${s.cancelledReason || ''})
      RETURNING id
    `
    let i = 0
    for (const r of s.registrants) {
      i += 1
      await sql`
        INSERT INTO registrations (session_id, student_key, student_name, student_phone)
        VALUES (${row.id}, ${'seed-' + row.id + '-' + i}, ${r.name}, ${r.phone})
      `
    }
  }

  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
