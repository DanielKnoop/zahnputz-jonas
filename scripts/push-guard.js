// scripts/push-guard.js
import { berlinParts } from '../src/schedule.js';

// Cron läuft sonntags 17:30 UND 18:30 UTC. Nur der Lauf, der in Berlin
// 19:xx (25–40 min) trifft, sendet — damit über Sommer-/Winterzeit hinweg
// genau einmal um 19:30 Berliner Zeit gesendet wird.
export function shouldSendNow(date) {
  const { weekday, hour, minute } = berlinParts(date);
  return weekday === 'Sun' && hour === 19 && minute >= 25 && minute <= 40;
}
