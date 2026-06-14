// src/kai-sequence.js
import { KAI_CONFIG } from './kai-config.js';

export function buildSequence(config = KAI_CONFIG) {
  const steps = [];
  let start = 0;
  for (const phase of config) {
    for (const zone of phase.zones) {
      steps.push({
        phase: phase.phase,
        phaseLabel: phase.label,
        motion: phase.motion,
        hint: phase.hint,
        zoneId: zone.id,
        zoneName: zone.name,
        seconds: zone.seconds,
        start,
        end: start + zone.seconds,
      });
      start += zone.seconds;
    }
  }
  return steps;
}

export function totalSeconds(config = KAI_CONFIG) {
  return config.reduce(
    (sum, phase) => sum + phase.zones.reduce((s, z) => s + z.seconds, 0),
    0,
  );
}
