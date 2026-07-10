export const DISCOUNT_PER_ACTION = 5
export const SESSION_DISCOUNT_CAP = 15
export const PROGRAM_DISCOUNT_CAP = 40

// Single implicit "logged in" student — this prototype has no auth. Seeded historical
// registrants use their own student_key (seed-<sessionId>-<n>) so they show up in the
// CMS's registrant list/export without ever being confused with the interactive demo user.
export const DEMO_STUDENT_KEY = 'demo'
