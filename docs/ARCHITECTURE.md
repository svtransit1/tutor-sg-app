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
| `mid` | 4–5 GB | Any | E2B / Qwen 2B |
| `unsupported` | < 4 GB | — | None (blocked) |

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
- Entitlement check fallback (uses cached entitlement when offline)

---

## 5. Parent dashboard boundary

### 5.1 Separation

| | Child UI | Parent Dashboard |
|---|---|---|
| Access | Always available | PIN-protected |
| Content | Homework camera, chat, worksheets | Session logs, progress summaries, flagging |
| Data source | Live LLM interactions | SQLite sessions table (read-only) |
| Network | None required | Local-only (no sync in v1) |

### 5.2 PIN gate

- 4-digit PIN set by parent during onboarding
- Required to enter the Parent area
- PIN hash stored locally in SQLite (never leaves device)
- 5 failed attempts → 60-second cooldown

### 5.3 What parents see

- Daily/weekly view of every kid session
- Per session: subject, topic, time spent, questions attempted, struggle indicators, AI help summary
- All summaries generated on-device from session events
- Parent can flag a session ("this looks wrong") → feeds the question-bank improvement loop

### 5.4 Privacy boundary

**Hard rule:** Photos and OCR text never leave the device, even to our servers. Only anonymized usage telemetry leaves — and only after parent opts in via the Parent Dashboard settings toggle (default: OFF).

---

## 6. Security boundaries

### 6.1 Child data isolation

| Data | Storage | Leaves device? |
|---|---|---|
| Photos (homework) | In-memory only during session | Never |
| OCR text | In-memory + session SQLite row | Never |
| Kid free-text chat | SQLite sessions table | Never |
| Session summaries | SQLite | Only if parent opts in to sync |
| Anonymized usage counters | SQLite | Opt-in telemetry only |
| Kid profile (name, level) | SQLite | Never |
| Parent email / auth token | Secure store (Keychain / Keystore) | Supabase auth only |

### 6.2 Model integrity

- All model files hosted on Cloudflare R2 with SHA-256 manifests
- App verifies integrity hash before loading any model into the inference engine
- Failed verification → delete file, retry download once, then error

### 6.3 Purchase security

- All purchases require parent gate (birth-year challenge, age ≥ 18)
- Entitlement cross-checked against Supabase on every app foreground
- Device-side purchase alone is not trusted

### 6.4 Analytics constraint

**No third-party analytics SDKs in child-facing code paths.** Parent dashboard analytics are isolated to the web companion. This is a hard architectural boundary — any code in a child-facing React Native screen must not import or transitively depend on an analytics library.

### 6.5 Auth model

- Parent: email + magic link or Google/Apple sign-in (Supabase Auth)
- Kid profile: local only, no login, no auth token
- Kid identity is a row in the local `profiles` table keyed by parent account

---

## 7. Implementation order

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

## 8. Cross-references

- **Product spec:** [wiki ADD](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md)
- **Locked decisions:** [wiki decisions-locked](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fdecisions-locked.md)
- **DeepTutor architecture lift:** [wiki article 04](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farticles%2F04-deeptutor-architecture-lift.md)
- **Full architecture memo:** [wiki architecture.md](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farchitecture.md) — deeper detail on each subsystem
- **Issue tracker:** Paperclip company `AaaS` (`a0b206eb-3265-4b08-8bd4-d21b9c52c827`)
