// localStorage helpers — all reads and writes go through here

const KEYS = {
  subjects:   'studyflow_subjects',
  colorIndex: 'studyflow_colorIndex',
  theme:      'studyflow_theme',
  intensity:  'studyflow_intensity',
}

export function loadSubjects() {
  try {
    const saved = localStorage.getItem(KEYS.subjects)
    const ci    = localStorage.getItem(KEYS.colorIndex)
    return {
      subjects:   saved ? JSON.parse(saved) : [],
      colorIndex: ci    ? parseInt(ci) || 0  : 0,
    }
  } catch {
    return { subjects: [], colorIndex: 0 }
  }
}

export function saveSubjects(subjects, colorIndex) {
  try {
    localStorage.setItem(KEYS.subjects,   JSON.stringify(subjects))
    localStorage.setItem(KEYS.colorIndex, colorIndex)
  } catch (e) {
    console.warn('localStorage unavailable', e)
  }
}

export function loadTheme() {
  return localStorage.getItem(KEYS.theme) || 'dark'
}

export function saveTheme(theme) {
  localStorage.setItem(KEYS.theme, theme)
}

export function loadIntensity() {
  return localStorage.getItem(KEYS.intensity) || 'normal'
}

export function saveIntensity(intensity) {
  localStorage.setItem(KEYS.intensity, intensity)
}
