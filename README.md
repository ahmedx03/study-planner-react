# ⚡ StudyFlow — Smart Study Planner

A smart, exam-aware study planner built with **React + Vite**. Plan your week intelligently based on exam dates and subject difficulty.

🔗 **Live Demo:** [ahmedx03.github.io/study-planner-react](https://ahmedx03.github.io/study-planner-react)

---

## Features

- **Smart scheduling** — harder subjects get more sessions, urgent exams get priority
- **Exam-aware** — subjects only appear on days before their exam date
- **Live countdowns** — real-time timer to every upcoming exam
- **Intensity control** — Light, Normal, or Intense study plans
- **Done detection** — subjects with past exam dates are automatically removed from the timetable
- **Dark / light mode** — persists across sessions
- **localStorage** — all data saved in your browser, survives refresh
- **Fully responsive** — works on mobile and desktop
- **Export / print** — save your timetable as a PDF

---

## How the Algorithm Works

When you click **Generate Timetable**, the scheduler:

1. Sorts subjects by exam proximity (closest first), then difficulty
2. Calculates session counts: `hours × difficultyMultiplier × examUrgencyWeight`
3. Fills each day slot-by-slot, always picking the highest-priority subject that:
   - Has remaining sessions for the week
   - Hasn't hit the max unique subjects for that day (3–4)
   - Isn't the same as the last subject placed on that day
   - Has an exam date that hasn't passed yet
4. Groups same-subject sessions into a single block per day (e.g. `Math 3h`)

---

## Tech Stack

| | |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Styling | Plain CSS (CSS variables, dark/light theme) |
| Data | localStorage (no backend) |
| Deployment | GitHub Pages via GitHub Actions |

---

## Project Structure

```
src/
├── App.jsx                 # Root component, holds all state
├── index.css               # Global styles
├── main.jsx                # Entry point
├── components/
│   ├── Header.jsx          # Logo + theme toggle
│   ├── SubjectForm.jsx     # Add subject form
│   ├── SubjectList.jsx     # Subject cards + delete
│   ├── ExamBanner.jsx      # Live countdown pills
│   ├── Timetable.jsx       # Weekly day cards
│   ├── StatsBar.jsx        # Summary statistics
│   └── Toast.jsx           # Notification toasts
└── utils/
    ├── dates.js            # Date helpers, urgency logic
    ├── scheduling.js       # The scheduling algorithm
    └── storage.js          # localStorage read/write
```

---

## Running Locally

```bash
git clone https://github.com/ahmedx03/study-planner-react.git
cd study-planner-react
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deployment

This app auto-deploys to GitHub Pages on every push to `main` via GitHub Actions.

To deploy your own copy:

1. Fork or clone this repo
2. Go to **Settings → Pages → Source → GitHub Actions**
3. Push any change to `main`
4. Your app will be live at `https://ahmedx03.github.io/study-planner-react`

---

## Development Phases

| Phase | What was built |
|---|---|
| 0 | Planning & data structure |
| 1 | Core setup — add/display subjects |
| 2 | Basic timetable engine |
| 3 | Exam dates + difficulty selector |
| 4 | Smart scheduling algorithm |
| 5 | Real-time behaviour — today highlight, countdowns |
| 6 | localStorage persistence |
| 7 | UI/UX polish — dark mode, colour coding |
| 8 | Edge cases — validation, overload warning |
| 9 | React conversion + GitHub Pages deployment |
