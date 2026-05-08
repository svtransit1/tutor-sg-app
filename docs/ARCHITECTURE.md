# tutor-sg — Architecture

> **Authoritative product spec:** [App Design Document](https://github.com/aaas-pte-ltd/tutor-sg-app/blob/main/docs/ARCHITECTURE.md) (repo copy) ←→ [wiki ADD](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md) (Obsidian source of truth)
>
> **Locked decisions:** [[decisions-locked]](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fdecisions-locked.md)
>
> **Derived from:** Owl's architecture memo (`wiki/projects/tutor-sg/architecture.md`), ADD §3, ADD §7, and the DeepTutor architecture lift (`wiki/projects/tutor-sg/articles/04-deeptutor-architecture-lift.md`).

---

## 1. System topology

```
┌─────────────────────────────────────────────────┐
│                    Mobile App                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Camera /  │  │  LLM     │  │  Parent       │  │
│  │ OCR       │  │  Runtime │  │  Dashboard    │  │
│  └────┬─────┘  └────┬─────┘  │  (PIN-gated)  │  │
│       │             │        └───────┬───────┘  │
│  ┌────┴─────────────┴────────────────┴───────┐  │
│  │              SQLite + sqlite-vec           │  │
│  │   (sessions, profiles, syllabus RAG,       │  │
│  │    mistake bank, usage counters)           │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────┘
                       │  opt-in only, anonymized
                       ▼
┌──────────────────────────────────────────────────┐
│                  Cloud (thin)                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Supabase │  │  HitPay  │  │ Cloudflare R2  │  │
│  │ (auth,   │  │ (billing │  │ (model CDN,    │  │
│  │  sync,   │  │  webhook)│  │  integrity-    │  │
│  │  webhook)│  │          │  │  hashed)       │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
└──────────────────────────────────────────────────┘
```

**Key principle:** All child data stays on-device. The cloud layer handles only auth, billing, and opt-in anonymized telemetry. No server-side LLM, no server-side OCR, no server-side child content.

---

## 2. Stack

| Layer | Choice |
|---|---|
| App framework | React Native + Expo + TypeScript |
| Build service | Expo EAS |
| On-device LLM (iOS) | ExecuTorch + Gemma 4 E2B/E4B via `react-native-executorch` |
| On-device LLM (Android) | LiteRT-LM + Gemma 4 E2B/E4B |
| Chinese MT LLM | Qwen 3.5 2B/4B via ExecuTorch (iOS) / LiteRT-LM (Android) |
| Vision/OCR (iOS) | Apple Vision Framework |
| Vision/OCR (Android) | Google ML Kit Text Recognition |
| On-device DB | SQLite + sqlite-vec |
| Backend | Supabase (auth, billing webhooks, parent dashboard sync) |
| Payments | HitPay (Apple Pay, Google Pay, PayNow) |
| IAP SDK | Apple StoreKit 2, Google Play Billing v6 |
| CDN | Cloudflare R2 (model files, signed URLs) |
| i18n | Flat phrase-keyed JSON, `keySeparator: false`, EN + zh-Hans-SG |

---

## 3. On-device LLM runtime

### 3.1 Model inventory

| Model | Size | Use | Inference Engine |
|---|---|---|---|
| Gemma 4 E4B | ~2.5 GB | English, Math, Science — high tier | ExecuTorch / LiteRT-LM |
| Gemma 4 E2B | ~1.3 GB | English, Math, Science — mid tier | ExecuTorch / LiteRT-LM |
| Qwen 3.5 4B | ~2.4 GB | Chinese Mother Tongue — high tier | ExecuTorch / LiteRT-LM |
| Qwen 3.5 2B | ~1.2 GB | Chinese Mother Tongue — mid tier | ExecuTorch / LiteRT-LM |

### 3.2 Model routing

```
Subject requested
├── Chinese Mother Tongue → Qwen 3.5 (4B if high-tier, 2B if mid-tier)
└── English / Math / Science → Gemma 4 (E4B if high-tier, E2B if mid-tier)
```

Routing is a static config map — never hardcode model IDs in conditionals:

```ts
const MODEL_ROUTING: ModelRoutingTable = {
  english:    { high: "gemma-e4b", mid: "gemma-e2b" },
  math:       { high: "gemma-e4b", mid: "gemma-e2b" },
  science:    { high: "gemma-e4b", mid: "gemma-e2b" },
  chinese_mt: { high: "qwen-4b",    mid: "qwen-2b" },
};
```

### 3.3 Capability-based inference budget

Each feature declares a `modelTier` in its manifest:

| Capability | Model tier | Rationale |
|---|---|---|
| `photo_solve` | E4B | Multi-step reasoning |
| `quick_chat` | E2B | Casual, low latency |
| `chinese_stroke_check` | E4B | Stroke-order precision |

If the device is mid-tier but the capability demands E4B, the router downgrades to E2B and the capability adapts (shorter response, fewer reasoning steps). The user is not shown the downgrade.

### 3.4 Device tier detection

Run once at first launch, persisted in SQLite.

| Tier | RAM | NPU | Models |
|---|---|---|---|
| `high` | ≥ 6 GB | Modern NPU (A14+ / SD8Gen1+ / Dimensity 9000+) | E4B / Qwen 4B |
| `mid` | 3–5 GB | Any | E2B / Qwen 2B |
| `unsupported` | < 3 GB | — | None (blocked) |

**iOS:** `NSProcessInfo.processInfo.physicalMemory` via native module.
**Android:** `/proc/meminfo` + `ActivityManager.MemoryInfo` via native module.

### 3.5 First-launch model download

1. Show loading screen: "Setting up your tutor..." / "正在设置你的导师..."
2. Detect device tier
3. Fetch `index.json` from Cloudflare R2 CDN
4. For each required file: download with HTTP Range resume support → verify SHA-256 → move to permanent storage
5. On integrity failure: retry once, then show error
6. All files verified → load into inference engine → transition to main UI

Model files are never bundled in the app package (app stays under 50 MB). On-device footprint: ~4.9 GB (high tier), ~2.5 GB (mid tier).

### 3.6 Model version upgrades

When CDN `index.json` version increments:
1. New models download in the background (non-blocking)
2. After verification, old model is swapped atomically on next cold launch
3. Old files deleted after successful swap

---

## 4. Data flow

### 4.1 Homework photo pipeline

```
Camera capture
  → Stage 1: Platform OCR (Apple Vision / ML Kit)
    → Confidence scoring per text block
      → Blocks ≥ 0.6 confidence: keep
      → Blocks < 0.6 confidence: prompt manual input ("Tap to type")
      → All blocks < 0.3: show retake prompt
  → Stage 2: Gemma semantic analysis
    → Input: OcrResult { blocks, subject, level }
    → Output: { plan, steps, final } — single-pass structured JSON
  → Stage 3: Response rendering in chat UI
  → Auto-save session to Parent Log (local SQLite)
```

### 4.2 Parent log generation

```
Session events (on-device)
  → AI-generated summary (on-device LLM, no cloud)
    → Written to sessions table in SQLite
      → Rendered in Parent Dashboard (PIN-gated, local reads)
```

### 4.3 Entitlement check flow

```
App foreground
  → Check cached entitlement (valid 5 min)
  → If expired → fetch from Supabase
  → Match against feature gate table
  → Render UI with appropriate gates
```

Feature gates are evaluated from a static table:

```ts
const FEATURE_GATES: FeatureGate[] = [
  { feature: "photo_solve",              minimumTier: "free" },
  { feature: "photo_solve_unlimited",    minimumTier: "trial" },
  { feature: "parent_report",            minimumTier: "trial" },
  { feature: "chinese_stroke_check",     minimumTier: "trial" },
  { feature: "study_programme",          minimumTier: "paid" },
];
```

### 4.4 Offline resilience

All core features work fully offline. Only these require connectivity:
- Model download (first launch only)
- IAP purchase
- Parent report sync (queued locally, synced when online)
- Entitlement check fallback (uses cached entitlement when offline)

---

## 5. Stylus input architecture

The stylus subsystem enables kids to write answers directly on AI-generated practice worksheets. It spans iOS (Apple Pencil via PencilKit) and Android (active stylus via S Pen SDK / stylus-aware gesture APIs), with platform-native handwriting recognition and on-device LLM-powered marking.

### 5.1 Platform-specific APIs

| Platform | Stylus capture | Handwriting recognition | Pressure/tilt |
|---|---|---|---|
| iOS (Apple Pencil) | PencilKit `PKCanvasView` | Apple Vision `VNRecognizeTextRequest` | `PKStroke` (native) |
| Android (active stylus) | `MotionEvent.getToolType()` / `STYLUS` | ML Kit Digital Ink Recognition | `getPressure()` / `getAxisValue()` |

**iOS detail:** A custom React Native native module wraps `PKCanvasView`. Apple Pencil input is automatically distinguished from finger touch (palm rejection is a PencilKit built-in). Double-tap gesture on Apple Pencil 2 toggles between pen and eraser modes. Ink strokes are captured as `PKStroke` objects, rendered at 60 fps, and destructively serialized for session replay.

**Android detail:** A custom React Native native view handles `MotionEvent` stream classification — stylus events are routed to the ink layer, touch events are ignored when stylus proximity is detected. Samsung S Pen-specific extensions (`SpenEvent`, `SpenRemoteKeyEvent`) are available but the core path uses the universal `MotionEvent.TOOL_TYPE_STYLUS` API covering Wacom-powered, USI, and other active styli.

### 5.2 Cross-platform abstraction

```ts
type InkStroke = {
  points: Array<{ x: number; y: number; pressure: number; timestamp: number }>;
  tool: "pen" | "eraser";
  color: string;
  width: number;
};

type RecognizedText = {
  text: string;
  confidence: number;        // 0.0–1.0
  boundingBox: Rect;
};

interface HandwritingRecognitionResult {
  rawText: string;
  characters: RecognizedText[];
  language: "en" | "zh-Hans" | "math";
}

interface MarkingFeedback {
  isCorrect: boolean;
  explanation?: string;      // LLM-generated, if wrong
  strokeOrderIssues?: Array<{ character: string; correctOrder: string }>;
}

// Platform-specific native modules expose a common interface:
const StylusBridge: {
  startCapture(worksheetId: string, answerZone: Rect): void;
  stopCapture(): Promise<InkStroke[]>;
  recognize(strokes: InkStroke[], language: Language): Promise<HandwritingRecognitionResult>;
  clear(): void;
  undo(): void;
  setTool(tool: "pen" | "eraser"): void;
};
```

### 5.3 Handwriting recognition pipeline

```
Stylus strokes captured
  → Platform handwriting recognition (Apple Vision / ML Kit Digital Ink)
    → Confidence scoring per character/word:
      ├── ≥ 0.8: auto-accepted (green)
      ├── 0.5–0.79: flagged in yellow, suggested text shown
      └── < 0.5: red squiggle underline, "Tap to type" fallback prompt
  → Subject-aware validation (routed through model router, §3.2):
      ├── Math answers    → parsed ± compared against computed answer
      ├── Chinese MT      → Qwen 4B stroke-order + character correctness check
      └── English answers → Gemma E4B/E2B spelling + grammar check
  → Real-time marking:
      ├── Correct → green checkmark
      └── Wrong   → red cross + expandable LLM-generated explanation
```

### 5.4 Worksheet rendering + stylus integration

- Worksheets are rendered as a scrollable React Native view with an embedded native canvas layer (iOS: `PKCanvasView`, Android: custom stylus-aware `View`).
- Each worksheet carries a **zone manifest** — a JSON map of answer areas with coordinates, expected answer type, and correct answer hash:

```ts
type AnswerZone = {
  id: string;
  rect: Rect;               // absolute coordinates on the worksheet
  type: "handwriting" | "drawing" | "typed";
  subject: Subject;
  expectedHash: string;     // SHA-256 of expected answer (never plaintext in UI)
  maxStrokes?: number;
};
```

- Zones can overlap and scroll independently of the canvas. A zone becomes active when the kid taps it (finger) or starts writing inside it (stylus).
- Drawing zones support math diagrams (model-drawing, number bonds, bar models — core P3–P6 Math techniques).
- Zones default to stylus input; typed fallback is available via a long-press action.

### 5.5 Chinese MT stroke-order checking

Chinese Mother Tongue handwriting is a first-class stylus use case (per [[decisions-locked]] and ADD §7). Stroke order is a graded criterion in MOE Chinese exams.

Architecture:
1. Kid writes a character in a stylus zone, language = `zh-Hans`.
2. Apple Vision / ML Kit Digital Ink returns the recognized character and its stroke sequence.
3. The stroke sequence is sent to Qwen 4B via the model router with a structured prompt: "Check if 我 is written with correct stroke order. Strokes observed: [sequence]. Return: { isCorrect, issues }."
4. If incorrect, the LLM returns the correct stroke order sequence; the app renders an animated stroke-order overlay on the character area.
5. Stroke-order data is sourced from the curated content corpus (static SQLite database, per [[decisions-locked]] and [[articles/01-product-thesis]]).

### 5.6 Data flow summary

```
Worksheet render (from corpus DB)
  → Kid writes in stylus zone → Strokes captured
    → Handwriting recognition (on-device, platform-native)
      → Subject router (§3.2) → LLM validation (Gemma / Qwen)
        → Marking feedback rendered on worksheet
          → Session event auto-saved → Parent Log (§6.3 via SQLite)
```

### 5.7 Performance budget

| Metric | Target |
|---|---|
| Stroke rendering | < 16 ms per frame (60 fps during writing) |
| Handwriting recognition | < 500 ms per answer zone (after last stroke) |
| LLM validation (Math/English) | < 3 seconds (E4B tier), < 6 seconds (E2B tier) |
| LLM validation (Chinese stroke-order) | < 5 seconds (Qwen 4B), < 10 seconds (Qwen 2B) |
| Zone rendering on worksheet scroll | No jank; virtualized canvas for worksheets > 2 screen heights |

### 5.8 Device tier implications

- **High tier (≥6 GB RAM):** Full stylus feature set — pressure sensitivity, stroke-order animations, real-time preview.
- **Mid tier (3–5 GB RAM):** Stylus works but stroke-order animations are static (no playback); pressure data captured but not animated.
- **Unsupported (<3 GB RAM):** Stylus features disabled — worksheet interaction is typed-input only.

### 5.9 Privacy boundary

All stylus input stays on-device, consistent with §6.4:
- Ink strokes: in-memory during session, serialized to SQLite for session replay in Parent Log
- Recognized text: session SQLite row only
- Stroke sequence + recognized answer: never leave device, even in opt-in telemetry
- Telemetry collects only anonymized counts: "worksheet completed", "stylus answer marked correct/incorrect" — no strokes, no text, no character data

---

## 6. Parent dashboard boundary

### 6.1 Separation

| | Child UI | Parent Dashboard |
|---|---|---|
| Access | Always available | PIN-protected |
| Content | Homework camera, chat, worksheets | Session logs, progress summaries, flagging |
| Data source | Live LLM interactions | SQLite sessions table (read-only) |
| Network | None required | Sync queued locally; POST to Supabase when online |

### 6.2 PIN gate

- 4-digit PIN set by parent during onboarding
- Required to enter the Parent area
- PIN hash stored locally in SQLite (never leaves device)
- 5 failed attempts → 60-second cooldown

### 6.3 What parents see

- Daily/weekly view of every kid session
- Per session: subject, topic, time spent, questions attempted, struggle indicators, AI help summary
- All summaries generated on-device from session events
- Parent can flag a session ("this looks wrong") → feeds the question-bank improvement loop

### 6.4 Privacy boundary

**Hard rule:** Photos and OCR text never leave the device, even to our servers. Only anonymized usage telemetry leaves — and only after parent opts in via the Parent Dashboard settings toggle (default: OFF).

---

## 7. Security boundaries

### 7.1 Child data isolation

| Data | Storage | Leaves device? |
|---|---|---|
| Photos (homework) | In-memory only during session | Never |
| OCR text | In-memory + session SQLite row | Never |
| Kid free-text chat | SQLite sessions table | Never |
| Session summaries | SQLite | Only if parent opts in to sync |
| Anonymized usage counters | SQLite | Opt-in telemetry only |
| Kid profile (name, level) | SQLite | Never |
| Parent email / auth token | Secure store (Keychain / Keystore) | Supabase auth only |

### 7.2 Model integrity

- All model files hosted on Cloudflare R2 with SHA-256 manifests
- App verifies integrity hash before loading any model into the inference engine
- Failed verification → delete file, retry download once, then error

### 7.3 Purchase security

- All purchases require parent gate (birth-year challenge, age ≥ 18)
- Entitlement cross-checked against Supabase on every app foreground
- Device-side purchase alone is not trusted

### 7.4 Analytics constraint

**No third-party analytics SDKs in child-facing code paths.** Parent dashboard analytics are isolated to the web companion. This is a hard architectural boundary — any code in a child-facing React Native screen must not import or transitively depend on an analytics library.

### 7.5 Auth model

- Parent: email + magic link or Google/Apple sign-in (Supabase Auth)
- Kid profile: local only, no login, no auth token
- Kid identity is a row in the local `profiles` table keyed by parent account

---

## 8. Implementation order

| Phase | What | Parallel track |
|---|---|---|
| 1 | RAM tier detection + model downloader | — |
| 2 | Model routing + inference engine integration | — |
| 3 | OCR pipeline (platform Vision/MLKit → Gemma) | — |
| 4 | Freemium gating + entitlement system | Parallel with 1–3 |
| 5 | IAP integration (StoreKit 2 + Play Billing v6) | After 4 |
| 6 | OCR fallback UI (manual input) | After 3 |
| 7 | Parent dashboard sync | After 5 |
| 8 | End-to-end integration testing on device matrix | After all |

---

## 9. Cross-references

- **Product spec:** [wiki ADD](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md)
- **Locked decisions:** [wiki decisions-locked](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fdecisions-locked.md)
- **DeepTutor architecture lift:** [wiki article 04](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farticles%2F04-deeptutor-architecture-lift.md)
- **Full architecture memo:** [wiki architecture.md](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farchitecture.md) — deeper detail on each subsystem
- **Issue tracker:** Paperclip company `AaaS` (`a0b206eb-3265-4b08-8bd4-d21b9c52c827`)
