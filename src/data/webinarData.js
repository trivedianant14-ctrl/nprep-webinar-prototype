// Seed data for the CMS-managed webinar sessions. Fields mirror the PRD's CMS spec:
// host name, topper name, NORCET rank, topic, date, time, status, YouTube embed link,
// study material upload, recording upload.
// `status` drives the card CTA state directly (prototype); in production Scheduled → Live
// → Completed transitions are computed off stream start/end time, never set manually —
// only Cancelled is a marketing-initiated status change.

export const DISCOUNT_ACTIONS = ['studyMaterial', 'liveAttendance', 'quiz']
export const DISCOUNT_PER_ACTION = 5
export const SESSION_DISCOUNT_CAP = 15
export const PROGRAM_DISCOUNT_CAP = 40

export const INITIAL_SESSIONS = [
  {
    id: 201,
    status: 'scheduled',
    host: 'Aman Singhal',
    topperName: '',
    topperRank: '',
    topic: 'Cracking NORCET in 90 Days — A Study Plan That Works',
    dateLabel: 'Sat, 18 Jul',
    timeLabel: '7:00 PM – 8:00 PM',
    daysOut: 8,
    youtubeEmbedId: 'dQw4w9WgXcQ',
    studyMaterialUrl: '', // not uploaded yet → placeholder, not error
    recordingUrl: '',
    registeredStudents: [],
  },
  {
    id: 202,
    status: 'scheduled',
    host: 'Priya Sharma',
    topperName: 'Rohit Meena',
    topperRank: 'AIR 15, NORCET 9',
    topic: 'From Tier-3 City to AIR 15 — My NORCET Journey',
    dateLabel: 'Tue, 21 Jul',
    timeLabel: '6:30 PM – 7:30 PM',
    daysOut: 11,
    youtubeEmbedId: 'dQw4w9WgXcQ',
    studyMaterialUrl: '/study-material/norcet-journey-notes.pdf',
    recordingUrl: '',
    registeredStudents: [
      { name: 'Kavya R.', phone: '98xxxxx210', registeredAt: '2026-07-08' },
      { name: 'Suresh M.', phone: '87xxxxx004', registeredAt: '2026-07-09' },
    ],
  },
  {
    id: 203,
    status: 'live',
    host: 'Aman Singhal',
    topperName: 'Sanya Kapoor',
    topperRank: 'AIR 42, NORCET 9',
    topic: 'MCQ Discussion — Community Health Nursing High-Yield Topics',
    dateLabel: 'Today',
    timeLabel: '4:00 PM – 5:00 PM',
    daysOut: 0,
    youtubeEmbedId: 'dQw4w9WgXcQ',
    studyMaterialUrl: '/study-material/chn-high-yield.pdf',
    recordingUrl: '',
    registeredStudents: [
      { name: 'Priya S.', phone: '99xxxxx881', registeredAt: '2026-07-08' },
      { name: 'Rohit K.', phone: '90xxxxx117', registeredAt: '2026-07-09' },
      { name: 'Anjali M.', phone: '81xxxxx552', registeredAt: '2026-07-10' },
    ],
  },
  {
    id: 204,
    status: 'completed',
    host: 'Priya Sharma',
    topperName: 'Karan Deshmukh',
    topperRank: 'AIR 8, NORCET 8',
    topic: 'Time Table Secrets of a Topper — Balancing Job + Prep',
    dateLabel: '3 Jul 2026',
    timeLabel: '7:00 PM – 8:00 PM',
    daysOut: -7,
    youtubeEmbedId: 'dQw4w9WgXcQ',
    studyMaterialUrl: '/study-material/time-table-secrets.pdf',
    recordingUrl: '/recordings/topper-time-table.mp4',
    registeredStudents: [
      { name: 'Deepak V.', phone: '70xxxxx339', registeredAt: '2026-07-01' },
      { name: 'Sneha R.', phone: '96xxxxx662', registeredAt: '2026-07-02' },
    ],
  },
  {
    id: 205,
    status: 'completed',
    host: 'Aman Singhal',
    topperName: 'Ritika Nair',
    topperRank: 'AIR 23, NORCET 7',
    topic: 'Last 15 Days Revision Strategy Before the Exam',
    dateLabel: '20 Jun 2026',
    timeLabel: '6:00 PM – 7:00 PM',
    daysOut: -20,
    youtubeEmbedId: 'dQw4w9WgXcQ',
    studyMaterialUrl: '/study-material/last-15-days.pdf',
    recordingUrl: '/recordings/last-15-days-revision.mp4',
    registeredStudents: [
      { name: 'Meera J.', phone: '82xxxxx773', registeredAt: '2026-06-15' },
    ],
  },
  {
    id: 206,
    status: 'cancelled',
    cancelledReason: 'Topper unavailable due to a scheduling conflict',
    host: 'Priya Sharma',
    topperName: 'Vikram Rathi',
    topperRank: 'AIR 55, NORCET 9',
    topic: 'Interview Prep for Government Nursing Postings',
    dateLabel: 'Fri, 10 Jul',
    timeLabel: '7:00 PM – 8:00 PM',
    daysOut: -1,
    youtubeEmbedId: '',
    studyMaterialUrl: '',
    recordingUrl: '',
    registeredStudents: [
      { name: 'Farhan A.', phone: '93xxxxx208', registeredAt: '2026-07-05' },
    ],
  },
]

export function blankSession(id) {
  return {
    id,
    status: 'scheduled',
    host: '',
    topperName: '',
    topperRank: '',
    topic: '',
    dateLabel: '',
    timeLabel: '',
    daysOut: 30,
    youtubeEmbedId: '',
    studyMaterialUrl: '',
    recordingUrl: '',
    registeredStudents: [],
  }
}
