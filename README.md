# Heartbreak 💛

Klickbarer Draft einer mobilen Web-App, die Menschen durch Liebeskummer begleitet –
warm, leicht humorvoll, in kleinen Schritten. Konzept und Begründungen: [`docs/KONZEPT.md`](docs/KONZEPT.md).

> Draft-Fokus: User Journey & Erlebnis. Kein Login, keine Security, kein Datenschutz-Setup.
> Alle Daten liegen nur im `localStorage` des Browsers.

## Starten

```bash
npm install
npm run dev        # http://localhost:5173 – am besten in der Handy-Ansicht der DevTools
npm test           # Logik- und Content-Tests
npm run build      # statischer Build in dist/ (läuft auf jedem Static-Hosting)
```

## Online zeigen (Firebase Hosting)

Live-Adresse: **https://heartbreak-effdf.web.app**

- **Automatisch:** Jeder Push auf `main` testet, baut und deployt über `.github/workflows/deploy.yml`.
  Einmalig nötig: GitHub-Secret `FIREBASE_SERVICE_ACCOUNT_HEARTBREAK_EFFDF` (siehe unten).
- **Manuell vom eigenen Rechner:** `npx firebase-tools login` (einmalig), dann `npm run deploy`.

Secret einrichten (einmalig): `npx firebase-tools init hosting:github` im Projektordner ausführen,
Repo `AS825/Heartbreak` angeben. Das legt das Service-Konto an und speichert das Secret in GitHub.
Die Fragen nach Build-Skript und automatischem Deploy mit **Nein** beantworten – der Workflow existiert schon. Legt das Tool trotzdem neue Dateien unter `.github/workflows/` an, diese einfach nicht committen.

## Was drin ist

| Bereich | Inhalt |
|---|---|
| Onboarding | 7 Fragen mit Mikro-Reaktionen → berechnete Startphase → 1–2 Start-Gewohnheiten |
| Heute | Check-in → Mini-Übung (< 2 Min., „Andere Übung“ jederzeit) → Gewohnheiten abhaken → Garten |
| Check-in | Stimmung 1–10 + Gefühls-Chips; Schutzmodus bei ≤ 2; Chip „Kontakt mit Ex“ wählt passende Übung |
| Phasen | Aufstieg/Rückschritt immer nur als Angebot; manueller Wechsel in „Mein Weg“ |
| Übungen | 11 Typen: Atmen, Erdung, Mini-Aktion, Top-5-Liste, Wut-Ventil, Inneres Kind, Journal, Rückblick, Brief, Ikigai-Schritt, Gewohnheits-Werkstatt |
| Garten | Pflanzen wachsen mit jeder Abhakung, welken nie; Selbst-Dates bringen Deko |
| Belohnungen | Meilensteine nur für Aktivität (nie Stimmung): Buch, „Gönn dir was“, Selbst-Date |
| Sammlung | Top-5-Listen, Journal, Briefe, Belohnungen |
| Hilfe | Immer sichtbar: TelefonSeelsorge 142 (AT), Rat auf Draht 147 (u20), Rettung 144 |

## Demo-Steuerung

Oben links „⚙ Demo“: Tage vorspulen, Phase direkt setzen, 14 Check-ins mit fester Stimmung
simulieren, alle Pflanzen gießen, Phasen-Prüfung auslösen, alles zurücksetzen.

**Phasenwechsel vorführen:** Phase 1 → drei Übungen machen → Demo → „+7 Tage“ → Check-ins „6“ simulieren
→ Angebot „Bereit für den nächsten Schritt?“ erscheint.

## Inhalte bearbeiten

Alle Texte, Übungen, Gewohnheiten, Empfehlungen und Regeln liegen in [`content/`](content/) als JSON.
Neue Übungen eines bestehenden Typs brauchen keinen Code. `npm test` prüft, dass alle Verweise
(Pools, Vorlagen, Empfehlungen, Werkstatt-Schritte) existieren und keine Übung länger als 2 Minuten dauert.

| Datei | Inhalt |
|---|---|
| `onboarding.json` | Fragen, Optionen, Reaktionen, Reveal-Texte |
| `phases.json` | Phasen, Farben, Humor-Level, Pools, Aufstiegs- und Rückschritt-Regeln, Scoring |
| `exercises.json` | Übungen + Werkstätten (Ikigai) |
| `habits.json` | Gewohnheits-Vorlagen, Pflanzen, Wachstumsstufen, Atomic-Habits-Designer |
| `recommendations.json` | Bücher, Treats, Selbst-Dates (Affiliate-Links = Platzhalter) |
| `rewards.json` | Meilensteine → Belohnungsart |
| `copy.json` | Begrüßungen, Check-in-Antworten je Phase, Mikrotexte |
| `help.json` | Notfallnummern Österreich |

## Struktur

```
src/
  app/          Routing + Layout (Tab-Bar, Hilfe-Button, Overlays)
  screens/      Welcome, Onboarding (+Reveal), Today, Checkin, ExerciseScreen, Garden, Path,
                WorkshopScreen, Collection, Abschluss
  exercises/    ein Renderer pro Übungstyp
  components/   UI-Bausteine, PhaseMap, HabitRow, Help/Reward/Suggestion-Modals, DevPanel
  logic/        reine, getestete Logik: phase.ts, daily.ts, garden.ts, milestones.ts, dates.ts
  store/        Zustand-Store + StorageAdapter (heute localStorage, später Firebase)
  content/      typisierter Zugriff auf /content/*.json
```

**Firebase später:** Persistenz läuft ausschließlich über `src/store/storage.ts` (`StorageAdapter`).
Ein `FirestoreAdapter` mit derselben Schnittstelle ersetzt `localStorageAdapter`; Logik und Screens bleiben unverändert.
