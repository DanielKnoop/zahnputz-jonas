# Zähneputz-Helfer für Jonas — Design / Spezifikation

**Datum:** 2026-06-14
**Status:** Abgestimmt, bereit für Implementierungsplan

## Ziel

Eine Web-App (PWA), die dem 6–8-jährigen Jonas hilft, abends **alle** Zähne
gründlich zu putzen. Sie führt nach dem **KAI-Prinzip** durch 3 Minuten,
zeigt per Animation **wo gerade geputzt werden muss**, motiviert im
**Comic-Stil (eigene Gallier-Figuren, Asterix-Gefühl)** und erinnert
**sonntags an das elmex gelée**. Nur Abend-Routine.

## Zielgruppe & Ton

- Jungs 6–8 Jahre. Du-Form, locker, kindgerecht.
- Held: ein junger Gallier namens **Jonas**, der „die Karies-Römer vertreibt".
- Comic-Optik: gallisches Dorf, Helm, Schnurrbart, Hinkelsteine, Zaubertrank-Kessel.
- **Wichtig (Recht):** Keine geschützten Original-Asterix-Figuren/Bilder.
  Alle Grafiken sind selbst gezeichnete Original-SVGs im gallischen Stil.

## Fachlicher Hintergrund (recherchiert)

KAI = Reihenfolge **K**auflächen → **A**ußenflächen → **I**nnenflächen.

- **K – Kauflächen:** kurze Hin-und-Her-Bewegungen.
- **A – Außenflächen:** Zähne aufeinander, kreisende Bewegungen, von der Mitte nach rechts und links.
- **I – Innenflächen:** kleine Kreise „von Rot nach Weiß" (Zahnfleisch → Zahn).

Empfehlung ab 6 Jahren: mind. 2 Min, 3 Min ideal. **elmex gelée**: Fluorid-Gel,
ab 6 Jahren **1× wöchentlich** → fest auf Sonntag gelegt.

Quellen: kindergesundheit-info.de, Familienhandbuch (IFP), Prof. Dr. Dhom.

## Ablauf (Zustandsautomat)

1. **Begrüßung** – „Hallo Jonas!" + großer Start-Knopf. Sonntags zusätzlich
   schon hier ein dezenter elmex-Hinweis möglich.
2. **Putzreise (180s)** – KAI-Phasen mit Mund-Animation + Countdown.
3. **Bewertung** – „Wie gut hat es geklappt?" (3 Comic-Gesichter).
4. **Belohnung** – Hinkelstein/Streak, Lob. Sonntags: elmex-Banner.
5. Zurück zur Begrüßung.

## KAI-Timer & „Wo putze ich gerade?"-Animation

- Großes **Mund-SVG** (Ober-/Unterkiefer, links/rechts). Der aktuell zu
  putzende Bereich **pulsiert/leuchtet**; Pfeil + Gallier zeigt die Bewegung
  (hin-und-her / kreisen / von Rot nach Weiß).
- **Ring-Countdown** pro Schritt + Gesamtfortschritt als sich füllender
  **Zaubertrank-Kessel**.
- Phasenwechsel: Comic-Sound + Spruch („K geschafft! Jetzt die Außenseiten, Jonas!").

**Zeitaufteilung — eine zentrale Konstante im Code, leicht anpassbar:**

| Phase | Dauer | Zonen | Bewegung |
|-------|-------|-------|----------|
| K – Kauflächen | 40s | oben 20s / unten 20s | Hin-und-Her |
| A – Außenflächen | 75s | 4 Quadranten à ~19s | Kreisen |
| I – Innenflächen | 65s | oben/unten je ~32s | Von Rot nach Weiß |
| **Gesamt** | **180s** | | |

## Bewertung & Motivation

- 3 große Comic-Gesichter: **Super / Ganz gut / Muss ich üben**.
- Belohnung: jeder abgeschlossene Abend = **Hinkelstein** im Dorf; sichtbare
  Sammlung wächst. **Streak-Zähler** („🔥 5 Abende in Folge!").
- Speicherung lokal (**localStorage**): pro Datum Bewertung + Streak. Kein Konto.
- Motivation/Konzentration: Held putzt mit, ermutigende Sprüche, klare große
  Ziele pro Schritt, sichtbarer Fortschritt.

## Sonntag = elmex-Tag

- **In-App-Banner (immer):** wird die App sonntags geöffnet, erscheint nach dem
  Putzen ein auffälliger Comic-Hinweis „Heute ist elmex-Tag!". Zero-Maintenance.
- **Echter Push (primärer Wecker):** jeden **Sonntag 19:30 Uhr** Benachrichtigung
  aufs iPad.

## Technische Architektur

**Statische PWA, gehostet auf GitHub Pages (HTTPS, kostenlos).**

Dateien:
- `index.html`, `styles.css`, `app.js`
- `manifest.webmanifest`, `service-worker.js`
- Icons (192/512), Inline- oder Datei-SVGs (Held, Mund, Hinkelstein, Kessel)
- Eltern-/Setup-Bildschirm: zeigt Push-Abo als kopierbaren Text

**Push-Architektur (kein Dauerserver):**
1. PWA abonniert Web-Push mit **VAPID** (öffentlicher Schlüssel im Frontend).
2. Push-Abo (JSON) + privater VAPID-Schlüssel werden **einmalig** als
   **GitHub-Secrets** hinterlegt.
3. **GitHub-Actions-Cron** läuft sonntags 19:30 (lokale Zeit beachten, Cron in
   UTC: 17:30 UTC im Sommer / 18:30 UTC im Winter — Workflow auf 17:30 UTC,
   Datums-/Zeitprüfung im Skript), sendet via `web-push` die Benachrichtigung.

> **iOS-Bedingungen (bekannt & akzeptiert):** Push funktioniert nur, wenn die
> PWA zum Home-Bildschirm hinzugefügt und die Benachrichtigung erlaubt wurde.
> Eine rein lokale geplante Benachrichtigung ist auf iOS nicht möglich — daher
> der Cron-Push-Server-Ansatz.

## Zugänge / Voraussetzungen

- **gh CLI installieren + einloggen** (`brew install gh`, `gh auth login`) →
  danach erledigt Claude Repo-Erstellung, Pages-Aktivierung und Secrets.
- **iPad-Einmalschritt** (nur am Gerät): PWA öffnen → Home-Bildschirm →
  Benachrichtigung erlauben → abonnieren → Abo-Text kopieren → als Secret ablegen.
- Vorhanden: git (konfiguriert), node/npm, openssl. Keine Anthropic-Skills nötig.

## Bewusst NICHT im Scope (YAGNI)

- Kein Morgen-Modus.
- Kein Benutzerkonto / kein Backend mit Datenbank.
- Keine Mehrbenutzer-Verwaltung (genau ein Kind: Jonas).
- Keine Original-Asterix-Lizenzgrafiken.

## Offene Punkte

- Genaue Cron-Zeitzonen-Logik (Sommer-/Winterzeit) wird im Plan fixiert.
- Konkrete Comic-Sprüche werden bei der Umsetzung gesammelt.
