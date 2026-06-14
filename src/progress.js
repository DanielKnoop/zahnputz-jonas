// src/progress.js
const KEY = 'jonas-zahnputz-v1';

function blank() {
  return { entries: {}, streak: 0, lastDate: null, hinkelsteine: 0 };
}

export function loadState(storage) {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return blank();
    return { ...blank(), ...JSON.parse(raw) };
  } catch {
    return blank();
  }
}

function prevDay(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function recordBrushing(state, isoDate, rating) {
  const next = { ...state, entries: { ...state.entries, [isoDate]: rating } };
  if (state.lastDate === isoDate) {
    // gleicher Tag: nur Bewertung aktualisieren, Streak unverändert
  } else if (state.lastDate === prevDay(isoDate)) {
    next.streak = state.streak + 1;
  } else {
    next.streak = 1;
  }
  next.lastDate = isoDate;
  next.hinkelsteine = Object.keys(next.entries).length;
  return next;
}

export function saveState(storage, state) {
  storage.setItem(KEY, JSON.stringify(state));
}

export function todayIso(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  });
  return fmt.format(date); // 'YYYY-MM-DD'
}
