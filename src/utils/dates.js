// All date / time utility functions

export const DAYS     = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
export const WEEKDAYS = DAYS.slice(0, 5)
export const WEEKEND  = DAYS.slice(5)

// Urgency thresholds
export const URGENT_DAYS = 2  // 0–2 days  → URGENT
export const SOON_DAYS   = 5  // 3–5 days  → SOON
                               // 6+ days   → NORMAL

export function todayDayName() {
  return DAYS[(new Date().getDay() + 6) % 7]
}

export function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function daysUntilExam(examDate) {
  if (!examDate) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const exam  = new Date(examDate); exam.setHours(0,0,0,0)
  return Math.ceil((exam - today) / 86400000)
}

export function secondsUntilExam(examDate) {
  if (!examDate) return null
  const exam = new Date(examDate); exam.setHours(23,59,59,999)
  return Math.max(0, Math.floor((exam - Date.now()) / 1000))
}

export function getUrgency(days) {
  if (days === null) return 'none'
  if (days < 0)     return 'none'  // exam passed — not urgent, it's done
  if (days === 0)   return 'urgent'
  if (days <= URGENT_DAYS) return 'urgent'
  if (days <= SOON_DAYS)   return 'soon'
  return 'ok'
}

export function isExamDone(subject) {
  if (!subject.examDate) return false
  return daysUntilExam(subject.examDate) < 0
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function formatCountdown(secs) {
  if (secs <= 0) return 'NOW'
  const d = Math.floor(secs / 86400)
  const h = Math.floor((secs % 86400) / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  const p = n => String(n).padStart(2, '0')
  if (d > 0) return `${d}d ${p(h)}h ${p(m)}m ${p(s)}s`
  if (h > 0) return `${p(h)}h ${p(m)}m ${p(s)}s`
  return `${p(m)}m ${p(s)}s`
}
