// Smart scheduling algorithm — pure functions, no DOM, no React
// Same logic as the vanilla version, fully separated for easy testing

import {
  DAYS, WEEKEND, URGENT_DAYS, SOON_DAYS,
  todayDayName, daysUntilExam,
} from './dates.js'

export const DIFF_MULT = { 1: 1, 2: 2, 3: 3 }

export const COLORS = [
  '#f5a623','#3dd68c','#6eb5ff','#ff4d6d','#c084fc',
  '#fb923c','#22d3ee','#a3e635','#f472b6','#facc15',
]

const MAX_SUBJ_WEEKDAY = 4
const MAX_SUBJ_WEEKEND = 3

export function intensityMultiplier(intensity) {
  return intensity === 'light' ? 0.6 : intensity === 'intense' ? 1.5 : 1.0
}

export function examWeight(subject) {
  const d = daysUntilExam(subject.examDate)
  if (d === null)        return 1  // no exam date
  if (d < 0)            return 0  // exam passed — never schedule
  if (d === 0)          return 3  // exam today
  if (d <= URGENT_DAYS) return 3  // 1–2 days
  if (d <= SOON_DAYS)   return 2  // 3–5 days
  return 1                        // 6+ days
}

export function buildSmartSchedule(subjectsArr, days, intensity) {
  const isWknd = d => WEEKEND.includes(d)
  const mult   = intensityMultiplier(intensity)

  // Step 1: session counts per subject
  const sessionMap = {}
  subjectsArr.forEach(s => {
    const base = Math.round(s.hours * mult)
    sessionMap[s.id] = Math.max(1, Math.min(base, 28))
  })

  // Step 2: priority sort — urgent exam → hardest → most hours
  const priority = [...subjectsArr].sort((a, b) => {
    const wa = examWeight(a) * (DIFF_MULT[a.difficulty] || 1)
    const wb = examWeight(b) * (DIFF_MULT[b.difficulty] || 1)
    return wb - wa || b.difficulty - a.difficulty || a.name.localeCompare(b.name)
  })

  // Step 3: slots per day
  const totalSessions = Object.values(sessionMap).reduce((a, b) => a + b, 0)
  const wdCount = days.filter(d => !isWknd(d)).length
  const weCount = days.filter(d =>  isWknd(d)).length
  const wdBase  = wdCount > 0 ? Math.ceil(totalSessions / (wdCount + weCount * 0.6)) : 0
  const weBase  = Math.max(1, Math.round(wdBase * 0.6))

  const maxUniq = d => {
    const base = isWknd(d) ? MAX_SUBJ_WEEKEND : MAX_SUBJ_WEEKDAY
    return intensity === 'light'   ? Math.max(2, base - 1)
         : intensity === 'intense' ? base + 1
         : base
  }

  const slotsPerDay = {}
  days.forEach(d => { slotsPerDay[d] = isWknd(d) ? weBase : wdBase })

  // Step 4: order days starting from today
  const todayIdx    = days.indexOf(todayDayName())
  const orderedDays = todayIdx >= 0
    ? [...days.slice(todayIdx), ...days.slice(0, todayIdx)]
    : days

  const dayOffset = {}
  days.forEach(d => {
    const idx = orderedDays.indexOf(d)
    dayOffset[d] = idx >= 0 ? idx : 999
  })

  const schedule  = {}
  const remaining = { ...sessionMap }
  days.forEach(d => { schedule[d] = [] })

  // Step 5: fill schedule — multiple passes
  let changed = true
  let passes  = 0
  while (changed && passes < 20) {
    changed = false
    passes++

    orderedDays.forEach(day => {
      const slots       = slotsPerDay[day]
      const maxU        = maxUniq(day)
      const usedToday   = new Set(schedule[day].map(s => s.id))
      const offsetToday = dayOffset[day]

      while (schedule[day].length < slots) {
        const lastPlaced = schedule[day][schedule[day].length - 1]

        const candidate = priority.find(s => {
          if (remaining[s.id] <= 0) return false
          if (!usedToday.has(s.id) && usedToday.size >= maxU) return false
          if (lastPlaced && lastPlaced.id === s.id) return false
          // Only schedule on days before exam
          if (s.examDate) {
            const daysLeft = daysUntilExam(s.examDate)
            if (daysLeft !== null && offsetToday > daysLeft) return false
          }
          return true
        })

        if (!candidate) break

        schedule[day].push({ ...candidate, sessionDuration: 1 })
        usedToday.add(candidate.id)
        remaining[candidate.id]--
        changed = true
      }
    })
  }

  // Step 6: merge consecutive same-subject slots
  days.forEach(day => {
    const merged = []
    schedule[day].forEach(s => {
      const last = merged[merged.length - 1]
      if (last && last.id === s.id) last.sessionDuration++
      else merged.push({ ...s })
    })
    schedule[day] = merged
  })

  return schedule
}

// Group all same-subject slots per day into one block for display
export function groupSessionsBySubject(sessions) {
  const grouped = []
  const seen    = {}
  sessions.forEach(s => {
    if (seen[s.id] !== undefined) {
      grouped[seen[s.id]].sessionDuration += s.sessionDuration
    } else {
      seen[s.id] = grouped.length
      grouped.push({ ...s })
    }
  })
  return grouped
}
