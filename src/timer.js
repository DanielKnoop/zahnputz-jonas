// src/timer.js
// Reine Funktion: aus Schrittliste + vergangenen Sekunden den Zustand ableiten.
export function stepAtElapsed(steps, elapsed) {
  const total = steps.length ? steps[steps.length - 1].end : 0;
  if (elapsed >= total) {
    const last = steps[steps.length - 1] ?? null;
    return { done: true, index: steps.length - 1, step: last, remainingInStep: 0, totalRemaining: 0 };
  }
  const index = steps.findIndex((s) => elapsed < s.end);
  const step = steps[index];
  return {
    done: false,
    index,
    step,
    remainingInStep: step.end - elapsed,
    totalRemaining: total - elapsed,
  };
}
