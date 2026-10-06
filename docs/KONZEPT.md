# Heartbreak – Konzept für den klickbaren Draft

> Fokus: User Journey und Erlebnis. Kein Login, keine Security, kein Datenschutz-Setup.
> Daten nur lokal (localStorage) bzw. als Mock. Firebase kommt später hinter dieselbe Schnittstelle.
> Mobile-first Web-App, Deutsch, warm, leicht humorvoll (Humor-Dosis je Phase).

---

## 1. Leitprinzipien

1. **Halt vor Leistung.** Die App fordert nie, sie lädt ein. Jede Übung < 2 Minuten, jede darf übersprungen werden.
2. **Keine Strafe.** Keine brechenden Streaks, keine welkenden Pflanzen, kein „Du hast 3 Tage verpasst“. Pausen heißen „Ruhetag“.
3. **Belohnung folgt Fortschritt, nie Stimmung.** Eine 2/10 löst nie eine Belohnung aus und nie einen Verlust.
4. **Rückschritt ist normal.** Die Phase kann zurückgehen; der Garten und alles Gesammelte bleiben.
5. **Content ist Daten.** Alle Texte, Übungen, Habits, Empfehlungen liegen in JSON. Der Code rendert nur Typen.
6. **Eigene Übungen, keine Buchinhalte.** Bücher werden empfohlen, Konzepte nur als Inspiration genutzt (keine Zitate, keine nacherzählten Kapitel).
7. **Hilfe ist immer einen Tap entfernt.** Schwebender Button auf jedem Screen.

---

## 2. Screen-Flow

```
                    ┌──────────────┐
                    │  Willkommen  │
                    └──────┬───────┘
                           ▼
       ┌──────────── Onboarding (7 Screens) ───────────┐
       │ Spitzname → Alter → Wie lange her → Wer hat   │
       │ sich getrennt → Kontakt → Stimmung → Freude   │
       └──────────────────────┬────────────────────────┘
                              ▼
                   ┌─────────────────────┐
                   │ „Hier stehst du“     │  ← berechnete Startphase,
                   │ (Phasen-Reveal)      │    erste 1–2 Habits wählen
                   └──────────┬──────────┘
                              ▼
 ┌────────────────────────── HEUTE (Home) ──────────────────────────┐
 │  Begrüßung (Phase-Ton)                                           │
 │  [1] Check-in-Karte ──► Check-in ──► (ggf. Phasen-Hinweis)       │
 │  [2] Übung des Tages ─► Übungs-Player (Typ-basiert) ──► Fertig   │
 │  [3] Habits abhaken ──► Garten-Animation                         │
 │  [4] Garten-Vorschau ─► Garten                                   │
 │  Belohnungs-Moment (Modal), wenn ein Meilenstein erreicht wurde  │
 └───────────────────────────────────────────────────────────────────┘
        │ Tab-Bar:  Heute · Garten · Mein Weg · Sammlung
        │
        ├─ Garten          Pflanzen je Habit, Wachstumsstufen, Habit verwalten
        ├─ Mein Weg        Phasen als Landkarte, aktuelle Phase erklärt,
        │                  Werkstätten der Phase (Top-5, Ikigai, Was-wäre-wenn …)
        └─ Sammlung        Listen, Journal-Einträge, Briefe, freigeschaltete
                           Empfehlungen, Selbst-Dates

 Überall:  (♡ Hilfe) ─► Hilfe-Sheet (Telefonseelsorge 142, Atemübung, „Ich bin nicht allein“)
 Nur Draft: (⚙ Dev)  ─► Phase setzen, Tag vorspulen, Stimmung simulieren, Reset
```

### Täglicher Loop (Kernerlebnis, ~3 Minuten)

```
Check-in (Stimmung 1–10 + optional 1 Gefühls-Chip)
   ▼
Antwort im Phasen-Ton  (+ ggf. Schutzmodus / Phasen-Vorschlag)
   ▼
1 Mini-Übung (< 2 Min.)   ── überspringen jederzeit erlaubt
   ▼
Habits abhaken (1–3)
   ▼
Garten wächst (Animation)  → evtl. Meilenstein → Belohnungs-Moment
   ▼
„Für heute reicht das. Wirklich.“
```

---

## 3. Onboarding & Startphase

### Fragen (`content/onboarding.json`)

| # | Frage | Typ | Werte (id) |
|---|-------|-----|------------|
| 1 | Wie dürfen wir dich nennen? | Text | `nickname` |
| 2 | Wie alt bist du ungefähr? | Single | `u20`, `20-29`, `30-39`, `40-54`, `55+` |
| 3 | Wie lange ist die Trennung her? | Single | `lt2w`, `2w-2m`, `2m-6m`, `gt6m` |
| 4 | Wer hat sich getrennt? | Single | `them`, `me`, `mutual`, `unclear` |
| 5 | Habt ihr noch Kontakt? | Single | `none`, `rare`, `often`, `daily` |
| 6 | Wie geht's dir heute, ehrlich? | Slider 1–10 | `mood` |
| 7 | Was hat dir früher Freude gemacht? | Multi-Chips + Freitext | `joys[]` |

Altersgruppe steuert nur Beispiele/Wortwahl (z. B. Selbst-Date-Vorschläge), nie die Phase.
`joys[]` speist später Habit-Vorschläge, Selbst-Dates und Ikigai Schritt 1.

### Berechnung (deterministisch, als Regeln in `content/phases.json` konfigurierbar)

```
score = Basis(Zeit)  +  Σ Modifikatoren

Basis(Zeit):      lt2w = 1.0 · 2w-2m = 2.0 · 2m-6m = 3.0 · gt6m = 3.5
Wer:              them = −0.5 · unclear = −0.25 · me / mutual = 0
Kontakt:          daily = −0.5 · often = −0.25 · rare / none = 0
Stimmung:         ≤3 = −1.0 · 4–6 = 0 · ≥7 = +0.5

startPhase = clamp(floor(score), 1, 4)
Sonderregeln:
  - Phase 4 als Start nur, wenn gt6m UND Stimmung ≥ 7, sonst max. 3.
  - Stimmung ≤ 2 → Startphase 1 + Hilfe-Button wird einmalig sanft hervorgehoben.
```

Beispiel: vor 3 Wochen, verlassen worden, täglicher Kontakt, Stimmung 3 → 2.0 − 0.5 − 0.5 − 1.0 = 0 → **Phase 1**.

### Reveal-Screen „Hier stehst du“
Phasen-Landkarte, eigener Punkt markiert, 2 Sätze dazu, was jetzt hilft. Danach Auswahl von 1–2 Start-Habits aus der Phase (vorausgewählt nach `joys`).
Wichtig im Wording: „Das ist kein Urteil, nur ein Startpunkt. Du kannst dich hier frei bewegen.“

---

## 4. Phasen-Logik

### Die vier Phasen (`content/phases.json`)

| | 1 Schock | 2 Gefühle | 3 Neuorientierung | 4 Gleichgewicht |
|---|---|---|---|---|
| Ziel | Halt, Grundversorgung | Gefühle zulassen, Selbstwert | Neue Richtung, eigenes Leben | Integrieren, abschließen |
| Humor (0–3) | 0–1 (sehr sanft) | 2 (trocken, Top-5-Stil) | 2–3 (verspielt) | 1–2 (warm, nachdenklich) |
| Übungstypen | Atem, Erdung, Mini-Fürsorge | Top-5-Listen, Wut-Ventil, Trauer-Raum, Inneres-Kind-Übungen | Was-wäre-wenn-Journal, Ikigai-Werkstatt, Habit-Design | Rückblick, Brief ans frühere Ich, Abschluss-Ritual |
| Habits | Wasser, kurz raus, Schlafenszeit | + Bewegung, Kontakt zu Freund:in | 1–3 selbst designte Habits (Atomic-Habits-Raster) | eigene Habits halten, Selbst-Dates |
| Empfehlung | „Wenn der Partner geht“ – Doris Wolf | Stefanie Stahl (Inneres Kind); Nick Hornby „High Fidelity“ | Matt Haig „Die Mitternachtsbibliothek“; James Clear „Die 1%-Methode / Atomic Habits“ | bell hooks „Alles über Liebe“ |
| Selbst-Dates | – | (optional, sehr klein) | erste Selbst-Dates | Selbst-Dates als Ritual |

### Aufstieg (immer als Angebot, nie automatisch)

Ein Phasenwechsel wird vorgeschlagen, wenn **alle** Bedingungen erfüllt sind; die Person bestätigt („Ja, fühlt sich richtig an“ / „Lieber noch bleiben“).

| Wechsel | Mindest-Tage in Phase | Ø-Stimmung der letzten 7 Check-ins | Schlüssel-Aktivitäten |
|---|---|---|---|
| 1 → 2 | 5 | ≥ 4.0 | ≥ 4 Check-ins, ≥ 3 Übungen |
| 2 → 3 | 10 | ≥ 5.0 | ≥ 2 Top-5-Listen, ≥ 1 Inneres-Kind-Übung |
| 3 → 4 | 14 | ≥ 6.0 | Ikigai abgeschlossen, 1 Habit ≥ 7× abgehakt, ≥ 1 Selbst-Date |
| 4 → Abschluss | 7 | ≥ 6.5 | Rückblick + Brief geschrieben |

„Lieber noch bleiben“ → erneuter Vorschlag frühestens nach 5 Tagen.

### Rückstufung (ohne Bestrafung)

- **Schutzmodus (tagesweise):** Check-in ≤ 2 → heute nur Phase-1-Inhalte (Atem, Wasser, Hilfe-Hinweis). Phase bleibt. Kein Text à la „schlechter Tag“.
- **Phasen-Rückschritt (Vorschlag):** 3 der letzten 4 Check-ins liegen ≥ 2 Punkte unter der Aufstiegsschwelle der aktuellen Phase **oder** Gefühls-Chip „Fühlt sich an wie am Anfang“ → Angebot: „Wollen wir ein paar Tage einen Gang runterschalten?“
- Bei Rückschritt bleibt alles erhalten: Garten, Sammlung, Meilensteine, freigeschaltete Empfehlungen. Die Landkarte zeigt den Weg als Schleife, nicht als Absturz („Wege sind selten gerade.“).
- Trigger-Ereignis optional im Check-in: Chip „Kontakt mit Ex gehabt“ → nächste Übung aus Pool `after_contact`, keine Phasenänderung.

### State (lokal, später Firestore-Dokument pro User)

```ts
type UserState = {
  profile: { nickname: string; ageGroup: string; joys: string[] };
  onboarding: { answers: Record<string, unknown>; startPhase: 1|2|3|4; completedAt: string };
  phase: { current: 1|2|3|4; enteredAt: string; history: { phase: number; from: string; reason: 'start'|'advance'|'step_back' }[] };
  checkins: { date: string; mood: number; chips: string[] }[];
  exerciseLog: { exerciseId: string; date: string; output?: unknown }[]; // Listen, Journal-Texte, Briefe
  habits: { id: string; templateId?: string; custom?: HabitDesign; completions: string[]; active: boolean }[];
  milestones: { id: string; reachedAt: string; rewardId?: string; claimed: boolean }[];
  ikigai?: { love: string[]; good: string[]; world: string[]; paid: string[]; insight?: string };
  settings: { helplineRegion: 'AT'|'DE'|'CH' };
};
```

Zugriff nur über ein `StorageAdapter`-Interface (`load/save/subscribe`) – heute `LocalStorageAdapter`, später `FirestoreAdapter`. Die Phasen-Logik ist eine reine Funktion `evaluatePhase(state, rules) → { suggestion: 'advance'|'step_back'|'protect'|null }`, damit sie ohne UI testbar ist.

---

## 5. Struktur der Content-Daten

```
content/
  onboarding.json       Fragen, Optionen, Mikro-Reaktionen nach jeder Antwort
  phases.json           Phasen, Ton, Humor-Level, Aufstiegs-/Rückstufungsregeln, Scoring
  exercises.json        alle Übungen (typisiert)
  habits.json           Habit-Vorlagen + Atomic-Habits-Designer-Prompts
  recommendations.json  Bücher, Selbst-Dates, „Gönn dir was“-Momente
  rewards.json          Meilensteine → Belohnungen
  copy.json             Mikrotexte: Begrüßungen, Check-in-Antworten, Leerzustände (pro Phase)
  help.json             Notfallnummern je Region, Hilfe-Texte
```

Platzhalter in Texten: `{{nickname}}`, `{{days}}`, `{{habit}}`. Textvarianten als Arrays → zufällige Auswahl, damit es sich nicht wiederholt.

### `phases.json` (Auszug)
```json
{
  "phases": [
    {
      "id": 1,
      "key": "schock",
      "title": "Erstmal atmen",
      "subtitle": "Phase 1 · Schock",
      "humorLevel": 0,
      "color": "#E9D8C8",
      "description": "Gerade ist alles zu viel. Hier geht es nur darum, gut durch den Tag zu kommen.",
      "exercisePools": ["breath", "grounding", "self_care_micro"],
      "habitTemplates": ["water", "outside_5min", "sleep_time"],
      "recommendations": ["book_wolf_partner_geht"],
      "advance": { "minDays": 5, "minAvgMood7": 4.0, "require": { "checkins": 4, "exercises": 3 } }
    }
  ],
  "scoring": {
    "base": { "lt2w": 1.0, "2w-2m": 2.0, "2m-6m": 3.0, "gt6m": 3.5 },
    "who": { "them": -0.5, "unclear": -0.25, "me": 0, "mutual": 0 },
    "contact": { "daily": -0.5, "often": -0.25, "rare": 0, "none": 0 },
    "mood": [ { "max": 3, "add": -1.0 }, { "min": 7, "add": 0.5 } ]
  },
  "protectMode": { "moodAtOrBelow": 2 },
  "stepBack": { "window": 4, "hits": 3, "belowThresholdBy": 2, "chip": "like_beginning" }
}
```

### `exercises.json` – ein Schema, viele Typen
Der Übungs-Player rendert nach `type`; neue Übungen = neue JSON-Einträge, kein Code.

| `type` | Rendering | Beispiel |
|---|---|---|
| `breath` | animierter Kreis, Takt aus Daten | 4-7-8 Atmen, 60 s |
| `grounding` | Schritt-Karten | 5-4-3-2-1 Sinne |
| `micro_action` | 1 Aufgabe + „Erledigt“ | „Öffne ein Fenster. Ja, jetzt.“ |
| `list_top5` | 5 nummerierte Felder, Titel im Plattenladen-Stil | „Top 5 Dinge, die ich nicht vermisse“ |
| `vent` | Freitext, der danach „verbrannt“ werden kann | Wut-Ventil |
| `inner_child` | Prompt + Antwort, sanfte Rahmung | „Was hätte die 8-jährige du heute gebraucht?“ |
| `journal` | 1 Prompt, Freitext | Was-wäre-wenn-Eintrag |
| `ikigai_step` | Chips + Freitext, Teil einer Werkstatt | Schritt 2: Was kann ich? |
| `habit_design` | 4-Schritte-Wizard | offensichtlich / attraktiv / einfach / befriedigend |
| `letter` | Brief-Editor, wird in Sammlung abgelegt | Brief ans frühere Ich |
| `reflection` | Zeitleiste aus eigenen Daten + Prompt | Rückblick |

```json
{
  "id": "p2_top5_not_miss",
  "type": "list_top5",
  "phases": [2],
  "pool": "top5",
  "durationSec": 120,
  "humorLevel": 2,
  "title": "Top 5 Dinge, die ich nicht vermisse",
  "intro": ["Ganz ehrlich, {{nickname}}: Da war auch Zeug, das nervte. Platz 5 bis 1, bitte."],
  "placeholders": ["Platz 5 – das Kleinliche", "Platz 4", "Platz 3", "Platz 2", "Platz 1 – der Klassiker"],
  "outro": ["Liste gespeichert. Gut zu wissen, dass da Material ist."],
  "inspiredBy": "concept:top5_lists",
  "savesTo": "collection.lists"
}
```

```json
{
  "id": "p3_ikigai",
  "type": "workshop",
  "phases": [3],
  "title": "Ikigai-Werkstatt",
  "steps": [
    { "exerciseId": "p3_ikigai_love",  "key": "love",  "prompt": "Was liebst du – auch wenn es keinen Zweck hat?", "seedFrom": "profile.joys" },
    { "exerciseId": "p3_ikigai_good",  "key": "good",  "prompt": "Was kannst du? Auch kleine Dinge zählen." },
    { "exerciseId": "p3_ikigai_world", "key": "world", "prompt": "Was braucht die Welt (oder deine Straße)?" },
    { "exerciseId": "p3_ikigai_paid",  "key": "paid",  "prompt": "Wofür wirst du bezahlt – oder könntest du es?" }
  ],
  "result": { "type": "overlap_view", "next": "habit_design", "maxHabits": 3 }
}
```

Werkstätten (`workshop`) sind mehrteilig und dürfen über mehrere Tage gehen – je Tag ein Schritt, damit die 2-Minuten-Regel hält.

### `habits.json`
```json
{
  "templates": [
    { "id": "water", "phases": [1,2,3,4], "title": "Ein Glas Wasser", "plant": "fern", "cue": "Nach dem Aufstehen" },
    { "id": "outside_5min", "phases": [1,2], "title": "5 Minuten raus", "plant": "daisy" },
    { "id": "sleep_time", "phases": [1,2], "title": "Handy weg um {{time}}", "plant": "moonflower" }
  ],
  "designer": {
    "steps": [
      { "key": "obvious",    "prompt": "Woran erinnerst du dich? (Wann/wo genau?)", "example": "Nach dem Kaffee, am Küchentisch" },
      { "key": "attractive", "prompt": "Womit verbindest du es, damit du Lust drauf hast?", "example": "Nur dabei läuft mein Lieblingspodcast" },
      { "key": "easy",       "prompt": "Was ist die 2-Minuten-Version?", "example": "Eine Seite lesen" },
      { "key": "satisfying", "prompt": "Wie feierst du es danach?", "example": "Pflanze gießen in der App 🌱" }
    ]
  }
}
```

### `recommendations.json` & `rewards.json`
```json
{
  "items": [
    { "id": "book_wolf_partner_geht", "kind": "book", "phase": 1, "title": "Wenn der Partner geht", "author": "Doris Wolf",
      "why": "Für die ersten Wochen: nimmt dich an der Hand, ohne zu drängen.", "affiliateUrl": "{{AFFILIATE_PLACEHOLDER}}" },
    { "id": "treat_chocolate", "kind": "treat", "phases": [1,2,3,4], "title": "Richtig gute Schokolade",
      "text": "Nicht die aus dem Automaten. Die, bei der man das Papier langsam aufmacht." },
    { "id": "date_museum", "kind": "self_date", "phases": [3,4], "ageGroups": ["*"], "title": "Allein ins Museum",
      "text": "Du bestimmst das Tempo. Niemand will in den Shop. Außer du." }
  ]
}
```
```json
{
  "milestones": [
    { "id": "checkins_3",   "when": { "checkinsTotal": 3 },     "reward": { "kind": "treat" } },
    { "id": "checkins_7",   "when": { "checkinsTotal": 7 },     "reward": { "kind": "book", "matchPhase": true } },
    { "id": "first_plant_bloom", "when": { "habitStage": 3 },   "reward": { "kind": "self_date" } },
    { "id": "phase_advance","when": { "event": "phase_advance" },"reward": { "kind": "book", "matchPhase": true } },
    { "id": "ikigai_done",  "when": { "event": "workshop_done:p3_ikigai" }, "reward": { "kind": "self_date" } }
  ]
}
```
Bedingungen zählen nur Aktivität (Check-ins **gesamt**, nicht in Folge; Übungen; Habit-Abhaken; Phasenereignisse). Ein Feld `mood` ist in `when` bewusst nicht erlaubt.

---

## 6. Gamification

| Element | Mechanik | Bewusst vermieden |
|---|---|---|
| **Habit-Garten** | Jeder Habit = eine Pflanze. Wachstum nach Anzahl Abhakungen (gesamt): Samen (0) → Keimling (3) → Pflanze (8) → Blüte (15) → „Blüht immer wieder“ (+Variation). | Kein Welken. Nicht gepflegt = „Ruht in der Erde“. |
| **Ruhetage** | Verpasste Tage zählen als Ruhe. Rückkehr wird begrüßt („Schön, dass du da bist.“), nicht kommentiert. | Streak-Zähler, Verlust-Hinweise |
| **Wegkarte** | Phasen als Landschaft (Nebel → Regen → Lichtung → Hügel mit Aussicht). Eigener Pfad inkl. Schleifen. | Fortschrittsbalken in % |
| **Sammlung** | Top-5-Listen als „Platten“, Journal als „Bücher in der Bibliothek der anderen Leben“, Briefe als Umschläge. | Punkte, Ranglisten |
| **Meilenstein-Momente** | Modal mit Belohnung: Buchkarte, „Gönn dir was“, Selbst-Date-Vorschlag. Einlösen optional, „Selbst-Date erledigt“ lässt Garten-Deko (Bank, Laterne) erscheinen. | Belohnung an Stimmung, Lootboxen |
| **Abschluss** | Phase 4 endet mit einem Ritual (Brief versiegeln, Garten-Foto). App bleibt danach als „Garten“ offen. | Endlos-Engagement erzwingen |

---

## 7. Hilfe-Button

- Schwebender, kleiner Button unten rechts (♡), auf jedem Screen inkl. Onboarding.
- Bottom-Sheet: **Telefonseelsorge 142** (Österreich, 0–24 Uhr, kostenlos), Anruf-Link `tel:142`, 60-Sekunden-Atemübung, Satz: „Du musst das nicht allein schaffen.“
- Nummern in `help.json` pro Region, weil 142 nur in Österreich gilt (DE: 0800 111 0 111 / 0800 111 0 222, CH: 143). Draft-Default: AT.
- Im Schutzmodus und bei Onboarding-Stimmung ≤ 2 wird der Button einmal sanft hervorgehoben (Puls, kein Popup).

---

## 8. Umfang erster Draft

### Rein (klickbar, mit Mock-/Local-Daten)

| # | Screen | Warum im Draft |
|---|---|---|
| 1 | Willkommen | Ton setzen |
| 2 | Onboarding (7 Fragen, 1 pro Screen) | Kernerlebnis + Phasenberechnung |
| 3 | Phasen-Reveal + Start-Habits wählen | Ergebnis greifbar machen |
| 4 | Heute (Home) | täglicher Loop |
| 5 | Check-in | inkl. Schutzmodus & Phasen-Vorschlag (vor/zurück) |
| 6 | Übungs-Player | generisch; Typen im Draft: `breath`, `micro_action`, `list_top5`, `inner_child`, `journal`, `ikigai_step`/`workshop`, `habit_design`, `letter` |
| 7 | Garten | Wachstumsstufen sichtbar |
| 8 | Mein Weg | Phasenkarte + Werkstätten der Phase |
| 9 | Belohnungs-Modal | Buch / Gönn-dir-was / Selbst-Date |
| 10 | Hilfe-Sheet | Pflicht |
| 11 | Dev-Panel | Phase setzen, Tage vorspulen, Check-ins simulieren, Reset – damit alle 4 Phasen in 5 Minuten demonstrierbar sind |

Content im Draft: je Phase ca. 5–6 Übungen, 3–4 Habit-Vorlagen, 1–2 Empfehlungen, 3 Selbst-Dates, 3 Treats.

### Später
Sammlung als eigener Tab (im Draft: einfache Liste unter „Mein Weg“), Reflection-Zeitleiste & volles Abschluss-Ritual, Erinnerungen/Push, Einstellungen, Firebase-Adapter, echte Affiliate-Links, Illustrationen statt Platzhalter-Emoji.

---

## 9. Technischer Vorschlag (Draft)

- **Vite + React + TypeScript**, Routing über `react-router`, State in **Zustand** mit Persist-Middleware hinter `StorageAdapter`.
- **Tailwind** für schnelles Mobile-first-Styling; Animationen sparsam mit CSS/Framer Motion (Garten, Atemkreis).
- Content per `import` aus `content/*.json`, beim Start gegen ein Zod-Schema validiert (fängt Tippfehler in Daten früh ab).
- Reine Logik-Module mit Unit-Tests: `computeStartPhase`, `evaluatePhase`, `pickDailyExercise`, `evaluateMilestones`, `plantStage`.

```
src/
  app/            Routing, Layout (inkl. HelpButton, DevPanel)
  screens/        Welcome, Onboarding, PhaseReveal, Today, Checkin, Exercise, Garden, Path
  exercises/      ein Renderer pro type (BreathPlayer, Top5List, Workshop, HabitDesigner …)
  logic/          phase.ts, milestones.ts, daily.ts, garden.ts (pur, getestet)
  store/          userStore.ts, storage/LocalStorageAdapter.ts
  content/        loader.ts + schemas.ts
content/          *.json (siehe Abschnitt 5)
```

### Auswahl der Tagesübung (`pickDailyExercise`)
1. Schutzmodus? → Pool `breath`/`grounding`.
2. Chip „Kontakt mit Ex“? → Pool `after_contact`.
3. Offene Werkstatt der Phase? → nächster Schritt (max. 1 pro Tag).
4. Sonst: Übung der aktuellen Phase, die am längsten nicht gemacht wurde; Humor-Level ≤ Phasen-Level.

---

## 10. Offene Fragen

1. Zielregion: Nur Österreich (142) oder AT/DE/CH mit Auswahl?
2. Soll die Person ihre Phase im „Mein Weg“-Screen auch manuell wechseln dürfen (Vorschlag: ja, mit kurzer Rückfrage)?
3. Visueller Stil: illustriert/verspielt (Garten im Aquarell-Look) oder ruhig-minimal?
4. Wie viel Kontakt-Thematik (No-Contact-Unterstützung) soll in den Draft?
