import { useState, useEffect } from 'react'
import { daysUntilExam, secondsUntilExam, getUrgency, formatCountdown, isExamDone } from '../utils/dates'

export default function ExamBanner({ subjects }) {
  const [, setTick] = useState(0)

  // Tick every second to update countdowns
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const upcoming = subjects
    .filter(s => s.examDate && !isExamDone(s))
    .map(s => ({ ...s, daysLeft: daysUntilExam(s.examDate) }))
    .filter(s => s.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)

  if (!upcoming.length) return null

  return (
    <div className="exam-banner" aria-live="polite">
      {upcoming.map(s => {
        const u    = getUrgency(s.daysLeft)
        const icon = u === 'urgent' ? '🔴' : u === 'soon' ? '🟡' : '🟢'
        const lbl  = s.daysLeft === 0 ? 'TODAY'
                   : s.daysLeft === 1 ? 'Tomorrow'
                   : `${s.daysLeft}d`
        const secs = secondsUntilExam(s.examDate)

        return (
          <div key={s.id} className={`exam-pill exam-pill--${u}`}>
            <span className="exam-pill-dot" style={{ background: s.color }} />
            <span className="exam-pill-name">{s.name}</span>
            <span className="exam-pill-sep">·</span>
            <span className="exam-pill-date">{icon} {lbl}</span>
            {secs != null && (
              <span className="exam-pill-countdown">{formatCountdown(secs)}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
