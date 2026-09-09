# BUILD: Chairside — The Dental Operatory Agent

**Working title:** Chairside
**Purpose:** A hands-free agent that lives in the dental operatory. It listens to the hygienist's spoken perio shorthand and serves **two audiences from one voice stream**: (1) it charts structured perio data in real time for the clinician, and (2) it translates the findings into plain language and animated 3D visuals on the patient-facing screen — turning the patient from a bored hostage into an engaged participant.
**Event:** AI Tinkerers Atlanta hackathon. Theme: *"Build an agent for a place people already work, talk, or live, then make it meaningfully more useful because of that context."*
**Build target:** Cursor, end-to-end, single repo, runs fully offline on an Apple M3 (28 GB RAM). `npm run demo` or `make demo` starts everything.
**Timeline:** 2 days. Scope is ruthlessly cut to what demos.

---

## 0. Framing (read this first, Cursor)

This is a **demo-grade** product, not a clinical product. Three properties matter more than feature count:

1. **The demo must never fail on stage.** Everything runs locally — local speech-to-text, local parsing, local rendering. No wifi dependency, no cloud API on the critical path. A scripted fallback mode must exist (see §9).
2. **One hero tooth, gorgeous.** Do NOT model 32 photoreal teeth. One tooth (#14, upper left first molar) gets full 3D treatment with gum/pocket animation. The rest of the mouth is a clean stylized 2D arch chart. Judges only ever look at the close-up.
3. **The split-screen moment is the product.** The wow is watching one utterance — "tooth fourteen, distal, five millimeters, bleeding" — simultaneously (a) fill a clinical chart cell and (b) animate the hero tooth's gum pocket deepening with a plain-language caption. Optimize everything for that moment.

Do not add features outside this spec. Depth over breadth.

---

## 1. The demo narrative (build backwards from this)

Opening line (spoken by presenter): *"Who here enjoys staring at a ceiling tile while someone runs a 3,000 RPM brush inside your mouth?"*

Then, live on stage:

1. Presenter plays the hygienist. Wears/holds a mic, speaks natural perio shorthand.
2. **Left screen (Clinician view):** perio chart cells populate in real time, exactly as they would write back to Open Dental.
3. **Right screen (Patient view):** the hero tooth in stylized 3D. When "tooth 14, distal, 5, bleeding" is spoken, the camera glides to tooth 14, the gum pocket visibly deepens from its last-visit value (3 mm) to 5 mm, a small bleed indicator pulses, and a caption appears: *"This spot has gotten deeper since March. It's a sign your gums are pulling away here."*
4. "Since last visit" comparison: a timeline scrubber shows March → Today, the pocket animating between states.
5. Exam ends; agent generates the **patient take-home summary** — 4 plain-language sentences plus a mini image of their trouble spots — displayed as a phone-sized card.
6. Closing line: *"Engaged patients say yes to treatment. That's the business case in one sentence."*

Total demo runtime target: **3 minutes.**

---

## 2. Architecture

```
┌────────────┐   audio    ┌──────────────┐  transcript  ┌─────────────┐
│  Mic input │──────────▶│  STT engine   │─────────────▶│ Perio Parser │
│ (hygienist)│           │ (local Whisper)│              │  (rules+FSM) │
└────────────┘           └──────────────┘               └──────┬──────┘
                                                               │ structured events
                                        ┌──────────────────────┼──────────────────────┐
                                        ▼                      ▼                      ▼
                                ┌──────────────┐      ┌──────────────┐       ┌──────────────┐
                                │ Chart Store   │      │ Patient      │       │ Mock Open     │
                                │ (state + diff │      │ Translator   │       │ Dental        │
                                │ vs last visit)│      │ (templates)  │       │ write-back    │
                                └──────┬───────┘      └──────┬───────┘       └──────────────┘
                                       │                     │
                                       ▼                     ▼
                              ┌────────────────┐    ┌────────────────────┐
                              │ Clinician View │    │ Patient View        │
                              │ (perio grid)   │    │ (3D hero tooth +    │
                              │                │    │  captions + timeline)│
                              └────────────────┘    └────────────────────┘
```

**Process model:** one Python backend (FastAPI + WebSocket) doing STT + parsing + state; one browser frontend (single Vite app) rendering both views as two routes/windows (`/clinician`, `/patient`). Events stream over WebSocket. Both windows open on the same laptop, dragged to two displays (laptop screen + external monitor/projector).

---

## 3. Tech stack (pinned for the M3)

| Layer | Choice | Why |
|---|---|---|
| STT | `faster-whisper` with `small.en` model, Metal/CTranslate2 CPU int8 | Runs comfortably in RAM on M3, ~real-time for short utterances, fully offline. `base.en` as fallback if latency is poor. |
| VAD / segmentation | `webrtcvad` or Silero VAD, 300 ms silence cutoff | Chunk speech into utterances; perio callouts are short phrases. |
| Backend | Python 3.11, FastAPI, `websockets` | One process, easy event fan-out. |
| Parser | Deterministic rules + small finite-state machine (see §5) | NO LLM on the charting path. Determinism = stage safety. |
| Patient translation | Template engine with slot-filling (see §6) | Same reason. An optional local-LLM "color commentary" mode via Ollama is a stretch goal ONLY (§10). |
| Frontend | Vite + React + TypeScript | Fast to build, hot reload. |
| 3D | Three.js (react-three-fiber + drei) | Hero tooth scene. NOTE: keep to well-supported geometries; build the tooth from primitives/lathe geometry or load a single free glTF molar model checked into the repo. |
| 2D arch chart | SVG components | Stylized, clean, cheap. |
| Charts/animation | Framer Motion for UI, Three.js spring/lerp for the pocket | |
| Persistence | JSON files on disk (`patients/rita_shah.json`) | It's a demo. No database. |

---

## 4. Domain model

### 4.1 Perio primer (enough to build with)

- Teeth numbered **1–32** (Universal system). Hero tooth is **#14**.
- Each tooth has **6 probing sites**: mesio-buccal (MB), buccal (B), disto-buccal (DB), mesio-lingual (ML), lingual (L), disto-lingual (DL). Hygienists usually call three per side: "three two three."
- **Pocket depth (PD):** millimeters, 1–12. 1–3 healthy, 4 warning, 5+ problem.
- **Bleeding on probing (BOP):** boolean per site. Called as "bleeding" after a number.
- **Recession (REC):** mm of gum recession, per site.
- **Mobility:** 0–3 per tooth. **Furcation:** class 1–3 (molars). **Suppuration:** boolean.
- "Watch" = a flagged site to monitor.

### 4.2 Core types

```typescript
type Site = "MB" | "B" | "DB" | "ML" | "L" | "DL";

interface SiteReading {
  pd?: number;        // pocket depth mm
  bop?: boolean;      // bleeding on probing
  rec?: number;       // recession mm
}

interface ToothState {
  tooth: number;                       // 1..32
  sites: Record<Site, SiteReading>;
  mobility?: 0 | 1 | 2 | 3;
  furcation?: 0 | 1 | 2 | 3;
  notes: string[];                     // "watch", free text
  missing?: boolean;
}

interface Exam {
  patientId: string;
  date: string;            // ISO
  teeth: Record<number, ToothState>;
}

interface ChartEvent {                  // what the parser emits
  kind: "reading" | "flag" | "navigation" | "summary_request";
  tooth?: number;
  side?: "buccal" | "lingual";
  readings?: number[];                  // e.g. [3,2,3]
  bopSites?: Site[];
  note?: string;
  raw: string;                          // original utterance
  confidence: "high" | "low";
}
```

### 4.3 Seed data

Check in `patients/rita_shah.json` containing a **March 2026 exam** (the "last visit"): mostly healthy 2–3 mm readings, with tooth 14 distal sites at 3 mm and a "watch" note, tooth 19 at 4 mm. This is the baseline the demo animates *from*.

---

## 5. Perio Parser (deterministic — the heart of stage safety)

A finite-state machine over utterances. **No LLM.** Rules:

1. **Tooth navigation:** "tooth fourteen", "number fourteen", "on fourteen", "moving to three" → set current tooth context. Accept spoken numbers ("fourteen") and digits ("14"); Whisper emits both.
2. **Side context:** "buccal", "facial" (= buccal), "lingual", "palatal" (= lingual).
3. **Triplet readings:** an utterance containing exactly three small integers ("three two three", "3 2 3") → assign to the three sites of the current tooth+side in order (M, mid, D).
4. **Single-site readings:** "distal five", "mesial four" → single site of current tooth+side.
5. **Modifiers:** "bleeding" → BOP on the most recently assigned site(s). "Bleeding on distal" → that site. "Recession two" → REC. "Mobility one", "class two furcation".
6. **Flags:** "watch", "watch that" → note on current tooth/site.
7. **Corrections:** "correction", "scratch that", "make that five" → replace the last-written value. MUST work; the presenter will demo it deliberately.
8. **Summary trigger:** "let's wrap up", "generate summary" → fire the take-home summary.
9. Number-word mapping for one–twelve; tolerate Whisper artifacts ("to"/"two", "for"/"four") via context: inside a reading triplet, prefer the numeric interpretation.
10. Anything unparseable → emit a `low` confidence event shown in a small "heard: …" ticker on the clinician view (transparency, and it makes STT visible to judges), but never write garbage to the chart.

**Unit tests are mandatory for the parser.** Table-driven: ≥30 utterance → expected-event cases, including the correction flow and Whisper-typo cases. This is the one component where bugs kill the demo.

---

## 6. Patient Translator (templates)

Every `ChartEvent` maps to a patient-facing caption via templates with severity logic:

| Condition | Caption template |
|---|---|
| PD 1–3 | "This one looks healthy — the gum is snug against the tooth." |
| PD 4 | "This spot is a little deeper than we'd like. Worth keeping an eye on." |
| PD 5+ | "This spot has gotten deeper — a sign the gum is pulling away here." |
| PD increased vs last visit | "In March this was {prev} mm. Today it's {now} mm — it's moved in the wrong direction." |
| PD improved | "Good news — this spot improved since your last visit. Whatever you're doing, keep doing it." |
| BOP | "The bleeding here means the gum is inflamed — it's the gum's way of asking for help." |
| Watch flag | "Nothing to fix today — we're just going to watch this spot." |
| Summary | 3–5 sentence recap: overall status, the one or two trouble spots, one behavior suggestion, next-visit framing. |

Tone rules: warm, zero jargon, no fear-mongering, second person, ≤ 20 words per caption. Captions appear on the patient view with a gentle fade, one at a time.

---

## 7. Patient View (the star)

Single React route rendering a full-screen, dark, calm scene. Layout:

1. **Hero tooth (center, ~60% of screen).** One stylized 3D molar (#14) with visible gumline. Requirements:
   - Stylized-realistic: smooth ceramic-white crown, soft pink gum collar, subtle subsurface-looking material (MeshPhysicalMaterial with transmission/clearcoat tuned — no textures needed), rim lighting, slow idle rotation.
   - **Pocket animation:** the gum collar on the named site visibly recedes/deepens. Implement as a morph between two gum meshes (healthy vs receded) or vertex displacement on the gum geometry near that site, animated over ~1.2 s with easing. A thin measurement indicator (animated depth line + "3 mm → 5 mm" label) accompanies it.
   - **Bleed indicator:** small soft red pulse at the site, tasteful, not gory.
   - Camera: gentle dolly/orbit to the active site when a reading for #14 arrives.
2. **Arch strip (bottom).** Stylized 2D SVG of all 32 teeth. Each tooth colored by worst-site status: green (≤3), amber (4), red (≥5), grey (no data yet). Fills in live as the exam proceeds — the patient literally watches their mouth get mapped.
3. **Caption band (lower third).** The translator captions, large friendly type.
4. **Timeline scrubber ("March → Today").** Appears when a delta exists; scrubbing (or auto-playing) interpolates the hero tooth between last-visit and current state. This is the killer 10 seconds of the demo — make it buttery.
5. **Take-home card.** On summary trigger, the scene dims and a phone-proportioned card slides in: patient name, date, arch mini-map with trouble spots ringed, the summary sentences, one tip. Include a "sent to your phone" toast (fake).

Non-#14 teeth receiving readings: arch strip updates + caption only. The hero stays #14. (If time permits ONLY: a generic low-poly stand-in tooth may swap in for other teeth — this is stretch, see §10.)

---

## 8. Clinician View + Mock Open Dental write-back

1. **Perio grid:** classic 32-tooth table, 6 sites per tooth, upper and lower arches. Cells fill as events arrive; 5+ readings auto-red, 4 amber, BOP as red dot, REC row beneath. Current tooth highlighted. Delta badges (↑2 since 3/2026) on changed sites.
2. **"Heard" ticker:** last raw utterance + parse result, small, top corner.
3. **Write-back panel:** a collapsible drawer labeled "Open Dental — Periodontal Exam API (mock)" showing the JSON payloads the agent would POST, appended live. Implement as an actual local HTTP endpoint (`POST /mock/opendental/perio`) the backend calls, with the drawer tailing its log — so the pitch line "it writes back to the practice management system" is architecturally true, just pointed at a mock.
4. Exam save/load to the patient JSON file.

---

## 9. Reliability & fallback (non-negotiable)

1. **Rehearsal mode:** `?script=demo1` loads a scripted event sequence; pressing **spacebar advances to the next scripted event**, bypassing the mic entirely. Identical visuals. This is the panic button if the room's acoustics defeat STT. The presenter can narrate the same lines aloud while spacebar-driving — the audience cannot tell.
2. **Mic mode with confidence gate:** low-confidence parses never touch the chart (§5.10).
3. Everything boots with one command; no cloud calls anywhere; test with wifi off.
4. Target end-to-end latency (end of utterance → screen update) **< 1.5 s**. If `small.en` misses that, drop to `base.en`.

---

## 10. Stretch goals (touch ONLY if §1–§9 are done and rehearsed)

1. Ollama-powered "warmer" summary generation (template output stays as instant fallback).
2. Generic hero-tooth stand-in for non-#14 teeth.
3. Voice output: agent reads the take-home summary aloud (macOS `say` or Piper TTS, local).
4. Second scripted patient showing an *improving* mouth (positive-arc demo variant).

---

## 11. Task order (2-day plan)

| # | Task | Acceptance criteria |
|---|---|---|
| 1 | Repo scaffold: FastAPI + WS backend, Vite React frontend, two routes, event bus | `make demo` opens both views; a test button on the backend pushes an event visible in both |
| 2 | Domain types + seed patient JSON (March baseline) | Exam loads; arch strip renders baseline greys |
| 3 | Perio parser + 30-case test table | All tests pass, incl. corrections and Whisper-typo cases |
| 4 | Clinician grid wired to events | Speaking-order simulation fills grid correctly with deltas |
| 5 | STT loop: mic → VAD → faster-whisper → parser | Live utterance appears in "heard" ticker and grid < 1.5 s |
| 6 | Hero tooth scene: model, materials, lighting, idle state | It looks *good* standing still before any animation exists |
| 7 | Pocket-depth morph + measurement indicator + bleed pulse | "distal five bleeding" animates convincingly |
| 8 | Captions + arch strip live coloring | |
| 9 | Timeline scrubber March→Today | Buttery interpolation, auto-play mode |
| 10 | Take-home card + summary trigger | |
| 11 | Mock Open Dental endpoint + write-back drawer | |
| 12 | Rehearsal mode (spacebar script) | Full 3-min demo runnable with zero mic input |
| 13 | Rehearse the actual script 3×, tune latency/animation timing | |

Order matters: **the tooth must look great by end of day 1** (tasks 1–7). Day 2 is polish, safety, and rehearsal.

---

## 12. Demo script (check in as `DEMO.md`)

Include the full spoken script: the wall-staring opener, the exact utterance sequence ("Let's look at tooth fourteen… buccal… three two three… distal five… bleeding… correction, make that five… watch that one… let's wrap up"), the timeline-scrubber beat, the take-home card beat, and the closing business line: *"Perio charting capture is a crowded market — Pearl, Alta, Denti all ship it. Nobody is building for the second person in the room. Engaged patients accept treatment. That's Chairside."*

---

## 13. Out of scope (do not build)

- Real Open Dental integration, HIPAA anything, auth, multi-patient management
- Face/mouth cameras or imaging analysis
- Photoreal full-arch 3D, per-tooth unique models
- Cloud STT or cloud LLM on any critical path
- Mobile app (the take-home card is a rendered mock)
