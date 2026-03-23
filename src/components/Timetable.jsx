import { useEffect, useRef } from 'react'
import { DAYS, WEEKDAYS, WEEKEND, todayDayName, daysUntilExam, getUrgency, formatDate } from '../utils/dates'
import { groupSessionsBySubject } from '../utils/scheduling'

export default function Timetable({ schedule, showWeekend }) {
  const days    = showWeekend ? DAYS : WEEKDAYS
  const today   = todayDayName()
  const todayRef = useRef(null)

  // Scroll today into view whenever schedule changes
  useEffect(() => {
    if (todayRef.current) {
      setTimeout(() => {
        todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 150)
    }
  }, [schedule])

  return (
    <div className="timetable-container">
      {days.map((day, i) => {
        const sessions  = schedule[day] || []
        const isWknd    = WEEKEND.includes(day)
        const isToday   = day === today
        const totalHrs  = sessions.reduce((sum, s) => sum + s.sessionDuration, 0)
        const hasUrgent = sessions.some(s => getUrgency(daysUntilExam(s.examDate)) === 'urgent')
        const hasSoon   = !hasUrgent && sessions.some(s => getUrgency(daysUntilExam(s.examDate)) === 'soon')

        const classes = [
          'day-card',
          isWknd    && 'weekend',
          isToday   && 'today',
          hasUrgent && 'has-urgent',
          hasSoon   && 'has-soon',
        ].filter(Boolean).join(' ')

        const grouped = groupSessionsBySubject(sessions)

        return (
          <div
            key={day}
            className={classes}
            style={{ animationDelay: `${i * 0.04}s` }}
            ref={isToday ? todayRef : null}
          >
            <div className="day-header">
              <span className="day-name">
                {day}
                {isToday && <span className="today-badge">TODAY</span>}
              </span>
              <span className="day-hours">
                {totalHrs > 0 ? `${totalHrs}h` : 'Free'}
              </span>
            </div>

            {!grouped.length ? (
              <div className="free-day">Rest day — no sessions scheduled</div>
            ) : (
              <>
                <div className="day-subject-count">
                  {grouped.length} subject{grouped.length !== 1 ? 's' : ''}
                </div>
                <div className="day-sessions">
                  {grouped.map(s => (
                    <SessionBlock key={s.id} session={s} />
                  ))}
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SessionBlock({ session: s }) {
  const u = getUrgency(daysUntilExam(s.examDate))
  const urgClass = (u === 'urgent' || u === 'soon') ? ` session-${u}` : ''

  return (
    <div
      className={`session-block${urgClass}`}
      title={`${s.name} · ${s.sessionDuration}h${s.examDate ? ' · Exam ' + formatDate(s.examDate) : ''}`}
    >
      <span className="session-color" style={{ background: s.color }} />
      <span className="session-name">{s.name}</span>
      <span className="session-dur">{s.sessionDuration}h</span>
      {u === 'urgent' && <span className="session-urg-label">Urgent</span>}
      {u === 'soon'   && <span className="session-urg-label soon">Soon</span>}
    </div>
  )
}
