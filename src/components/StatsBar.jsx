import { daysUntilExam } from '../utils/dates'

export default function StatsBar({ schedule, subjects, activeSubjects }) {
  const days          = Object.keys(schedule)
  const activeDays    = days.filter(d => schedule[d].length > 0).length
  const totalHours    = activeSubjects.reduce((t, s) => t + s.hours, 0)
  const totalSessions = days.reduce((t, d) => t + schedule[d].length, 0)
  const avgPerDay     = activeDays > 0 ? (totalSessions / activeDays).toFixed(1) : 0

  // Next exam
  const upcoming = activeSubjects
    .filter(s => s.examDate)
    .map(s => daysUntilExam(s.examDate))
    .filter(d => d >= 0)
    .sort((a, b) => a - b)
  const nextExam = upcoming.length > 0 ? upcoming[0] : null

  // Most urgent subject
  const urgentSubj = activeSubjects
    .filter(s => s.examDate && daysUntilExam(s.examDate) >= 0)
    .sort((a, b) => daysUntilExam(a.examDate) - daysUntilExam(b.examDate))[0]

  // Busiest day
  const busiest = days.reduce((best, d) =>
    (schedule[d]?.length || 0) > (schedule[best]?.length || 0) ? d : best,
    days[0]
  )

  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat-label">Total Hours</span>
        <span className="stat-value">{totalHours}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Subjects</span>
        <span className="stat-value">{activeSubjects.length}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Days Active</span>
        <span className="stat-value">{activeDays}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Avg / Day</span>
        <span className="stat-value">{avgPerDay}</span>
      </div>
      {nextExam !== null && (
        <div className="stat">
          <span className="stat-label">Next Exam</span>
          <span
            className="stat-value"
            style={{ color: nextExam <= 2 ? 'var(--danger)' : nextExam <= 5 ? 'var(--accent)' : 'var(--success)' }}
          >
            {nextExam === 0 ? 'Today!' : `${nextExam}d`}
          </span>
        </div>
      )}
      {urgentSubj && (
        <div className="stat">
          <span className="stat-label">Most Urgent</span>
          <span className="stat-value stat-value--sm" style={{ color: 'var(--danger)' }}>
            {urgentSubj.name}
          </span>
        </div>
      )}
      {busiest && schedule[busiest]?.length > 0 && (
        <div className="stat">
          <span className="stat-label">Busiest Day</span>
          <span className="stat-value">{busiest.slice(0, 3)}</span>
        </div>
      )}
    </div>
  )
}
