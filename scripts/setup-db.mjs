// One-time setup: creates tables and seeds initial demo data.
// Run with: node --env-file=.env.local scripts/setup-db.mjs
// Times are seeded RELATIVE TO NOW so the schedule-driven status logic demos well:
// one session is live right now, the next starts in ~2 days, and statuses flip
// automatically as the clock passes each boundary.
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
  start_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  thumbnail_url TEXT NOT NULL DEFAULT '',
  youtube_embed_id TEXT NOT NULL DEFAULT '',
  study_material_url TEXT NOT NULL DEFAULT '',
  recording_url TEXT NOT NULL DEFAULT '',
  cancelled_reason TEXT NOT NULL DEFAULT ''
);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS thumbnail_url TEXT NOT NULL DEFAULT '';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS paid_only BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS shares (
  id SERIAL PRIMARY KEY,
  student_key TEXT NOT NULL,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_key, session_id)
);

CREATE TABLE IF NOT EXISTS unlocked_recordings (
  id SERIAL PRIMARY KEY,
  student_key TEXT NOT NULL,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_key, session_id)
);

CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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

const now = Date.now()
const MIN = 60 * 1000, HOUR = 60 * MIN, DAY = 24 * HOUR
const at = (offsetMs) => new Date(now + offsetMs).toISOString()

const SESSIONS = [
  {
    // LIVE right now — started 20 minutes ago, ends in 40
    status: 'scheduled', host: 'Aman Singhal', topperName: 'Sanya Kapoor', topperRank: 'AIR 42, NORCET 9',
    topic: 'MCQ Discussion — Community Health Nursing High-Yield Topics',
    startAt: at(-20 * MIN), endAt: at(40 * MIN),
    thumbnailUrl: 'https://picsum.photos/seed/nprep-chn/640/360',
    youtubeEmbedId: 'dQw4w9WgXcQ', studyMaterialUrl: '/study-material/chn-high-yield.pdf', recordingUrl: '',
    registrants: [
      { name: 'Priya S.', phone: '99xxxxx881' },
      { name: 'Rohit K.', phone: '90xxxxx117' },
      { name: 'Anjali M.', phone: '81xxxxx552' },
    ],
  },
  {
    // Next up — in ~2 days
    status: 'scheduled', host: 'Priya Sharma', topperName: 'Rohit Meena', topperRank: 'AIR 15, NORCET 9',
    topic: 'From Tier-3 City to AIR 15 — My NORCET Journey',
    startAt: at(2 * DAY + 3 * HOUR), endAt: at(2 * DAY + 4 * HOUR),
    thumbnailUrl: 'https://picsum.photos/seed/nprep-journey/640/360',
    youtubeEmbedId: 'dQw4w9WgXcQ', studyMaterialUrl: '/study-material/norcet-journey-notes.pdf', recordingUrl: '',
    registrants: [
      { name: 'Kavya R.', phone: '98xxxxx210' },
      { name: 'Suresh M.', phone: '87xxxxx004' },
    ],
  },
  {
    // Far out — revealed in the app only after the one above is registered.
    // Paid-only: demos the per-session access flag (freemium sees it locked with an upgrade CTA).
    status: 'scheduled', host: 'Aman Singhal', topperName: '',  topperRank: '',
    paidOnly: true,
    topic: 'Cracking NORCET in 90 Days — A Study Plan That Works',
    startAt: at(36 * DAY), endAt: at(36 * DAY + 1 * HOUR),
    thumbnailUrl: 'https://picsum.photos/seed/nprep-plan/640/360',
    youtubeEmbedId: 'dQw4w9WgXcQ', studyMaterialUrl: '', recordingUrl: '',
    registrants: [],
  },
  {
    // Completed last week — recording up
    status: 'scheduled', host: 'Priya Sharma', topperName: 'Karan Deshmukh', topperRank: 'AIR 8, NORCET 8',
    topic: 'Time Table Secrets of a Topper — Balancing Job + Prep',
    startAt: at(-7 * DAY), endAt: at(-7 * DAY + 1 * HOUR),
    thumbnailUrl: 'https://picsum.photos/seed/nprep-timetable/640/360',
    youtubeEmbedId: 'dQw4w9WgXcQ', studyMaterialUrl: '/study-material/time-table-secrets.pdf', recordingUrl: '/recordings/topper-time-table.mp4',
    registrants: [
      { name: 'Deepak V.', phone: '70xxxxx339' },
      { name: 'Sneha R.', phone: '96xxxxx662' },
    ],
  },
  {
    // Completed three weeks ago — recording up
    status: 'scheduled', host: 'Aman Singhal', topperName: 'Ritika Nair', topperRank: 'AIR 23, NORCET 7',
    topic: 'Last 15 Days Revision Strategy Before the Exam',
    startAt: at(-20 * DAY), endAt: at(-20 * DAY + 1 * HOUR),
    thumbnailUrl: 'https://picsum.photos/seed/nprep-revision/640/360',
    youtubeEmbedId: 'dQw4w9WgXcQ', studyMaterialUrl: '/study-material/last-15-days.pdf', recordingUrl: '/recordings/last-15-days-revision.mp4',
    registrants: [{ name: 'Meera J.', phone: '82xxxxx773' }],
  },
  {
    // Cancelled — never shown to students; exists so the CMS can demo the
    // cancellation → push + WhatsApp flow and the restore action.
    status: 'cancelled', host: 'Priya Sharma', topperName: 'Vikram Rathi', topperRank: 'AIR 55, NORCET 9',
    topic: 'Interview Prep for Government Nursing Postings',
    startAt: at(3 * DAY), endAt: at(3 * DAY + 1 * HOUR),
    thumbnailUrl: 'https://picsum.photos/seed/nprep-interview/640/360',
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
  await sql.query('TRUNCATE followups, notifications, actions, registrations, shares, unlocked_recordings, resources, sessions RESTART IDENTITY CASCADE')

  console.log('Seeding sessions...')
  for (const s of SESSIONS) {
    const [row] = await sql`
      INSERT INTO sessions (status, host, topper_name, topper_rank, topic, start_at, end_at, thumbnail_url, youtube_embed_id, study_material_url, recording_url, cancelled_reason, paid_only)
      VALUES (${s.status}, ${s.host}, ${s.topperName}, ${s.topperRank}, ${s.topic}, ${s.startAt}, ${s.endAt}, ${s.thumbnailUrl}, ${s.youtubeEmbedId}, ${s.studyMaterialUrl}, ${s.recordingUrl}, ${s.cancelledReason || ''}, ${s.paidOnly || false})
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
    // Marketing-uploaded downloadables for the student "Resources" section
    if (s.studyMaterialUrl) {
      await sql`INSERT INTO resources (session_id, title, url) VALUES (${row.id}, 'Session Notes (PDF)', ${'/resources/' + row.id + '-notes.pdf'})`
      await sql`INSERT INTO resources (session_id, title, url) VALUES (${row.id}, 'High-Yield MCQ Sheet (PDF)', ${'/resources/' + row.id + '-mcq-sheet.pdf'})`
    }
  }

  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
