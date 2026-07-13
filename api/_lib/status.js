// Status is schedule-driven, matching how live-class platforms (and the PRD) work:
// "CTA flips from Register to Join Now only when the stream start time is reached —
// not before, not manually." Only cancellation is a human decision; everything else
// derives from the clock.
export function computeStatus(row, now = new Date()) {
  if (row.status === 'cancelled') return 'cancelled'
  const start = new Date(row.start_at)
  const end = new Date(row.end_at)
  if (now < start) return 'scheduled'
  if (now <= end) return 'live'
  return 'completed'
}
