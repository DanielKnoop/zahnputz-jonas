// src/schedule.js
// Zeitzonen-sichere Auswertung über Intl, unabhängig von der Server-Zeitzone.
export function berlinParts(date) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    weekday: parts.weekday,           // 'Sun', 'Mon', ...
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

export function isSundayInBerlin(date) {
  return berlinParts(date).weekday === 'Sun';
}
