export function serializeSession(row, registrants = []) {
  return {
    id: row.id,
    status: row.status,
    host: row.host,
    topperName: row.topper_name,
    topperRank: row.topper_rank,
    topic: row.topic,
    dateLabel: row.date_label,
    timeLabel: row.time_label,
    daysOut: row.days_out,
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
