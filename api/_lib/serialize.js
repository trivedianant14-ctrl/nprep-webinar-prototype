import { computeStatus } from './status.js'

export function serializeSession(row, registrants = []) {
  return {
    id: row.id,
    status: computeStatus(row),
    host: row.host,
    topperName: row.topper_name,
    topperRank: row.topper_rank,
    topic: row.topic,
    startAt: new Date(row.start_at).toISOString(),
    endAt: new Date(row.end_at).toISOString(),
    thumbnailUrl: row.thumbnail_url,
    paidOnly: row.paid_only,
    youtubeEmbedId: row.youtube_embed_id,
    studyMaterialUrl: row.study_material_url,
    recordingUrl: row.recording_url,
    cancelledReason: row.cancelled_reason,
    registeredStudents: registrants.map(r => ({
      name: r.student_name,
      phone: r.student_phone,
      registeredAt: new Date(r.registered_at).toISOString().slice(0, 10),
    })),
  }
}
