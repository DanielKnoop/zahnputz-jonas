# Jonas' Zahn-Mission 🛡️🦷

PWA, die Jonas abends per KAI-Prinzip durch 3 Minuten Zähneputzen führt und
sonntags 19:30 (Berliner Zeit) per Push an das elmex gelée erinnert.

## Betrieb
- Hosting: GitHub Pages (Branch `main`, Ordner `/`).
- Sonntags-Push: GitHub Actions (`.github/workflows/elmex-sunday.yml`),
  Cron 17:30 + 18:30 UTC, Guard sendet genau um 19:30 Berliner Zeit.
- Secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `PUSH_SUBSCRIPTION`.
- Push-Abo erneuern: in der App unter „Eltern" neu aktivieren, kopieren,
  `gh secret set PUSH_SUBSCRIPTION --body '<JSON>'`.

## Tests
`node --test` — deckt KAI-Sequenz, Timer, Zeit-/Sonntagslogik, Streak und
Push-Guard ab.

## Zeitaufteilung anpassen
Alle Putzzeiten stehen zentral in `src/kai-config.js`.
