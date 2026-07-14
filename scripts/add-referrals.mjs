// One-time, non-destructive migration: adds the referral-program tables without
// touching any existing data. Run with: node --env-file=.env.local scripts/add-referrals.mjs
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const SCHEMA = `
CREATE TABLE IF NOT EXISTS referral_codes (
  student_key TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_key TEXT NOT NULL,
  friend_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'invited',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  registered_at TIMESTAMPTZ,
  attended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS referral_rewards (
  student_key TEXT PRIMARY KEY,
  reward_type TEXT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`

async function main() {
  console.log('Creating referral tables...')
  for (const stmt of SCHEMA.split(';').map(s => s.trim()).filter(Boolean)) {
    await sql.query(stmt)
  }
  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
