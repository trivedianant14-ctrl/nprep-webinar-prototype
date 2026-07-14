function genCode() {
  return 'NP-' + Math.random().toString(36).slice(2, 7).toUpperCase()
}

export async function getOrCreateReferralCode(db, studentKey) {
  const [existing] = await db`SELECT code FROM referral_codes WHERE student_key = ${studentKey}`
  if (existing) return existing.code
  const code = genCode()
  const [row] = await db`
    INSERT INTO referral_codes (student_key, code) VALUES (${studentKey}, ${code})
    ON CONFLICT (student_key) DO UPDATE SET student_key = EXCLUDED.student_key
    RETURNING code
  `
  return row.code
}
