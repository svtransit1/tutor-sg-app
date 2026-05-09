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

See §5 for the full model versioning and CDN delivery strategy. In brief: when the CDN `index.json` declares a newer version than what is on-device, the app downloads the update in the background, verifies integrity, and swaps atomically on next cold launch.

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

## 5. Model versioning + CDN delivery strategy

All model files are hosted on Cloudflare R2 and delivered to devices via signed URLs with integrity verification. This section defines the versioning scheme, manifest format, delivery flows, delta update strategy, atomic swap protocol, and error recovery.

### 5.1 CDN architecture

```
Cloudflare R2 (origin)
  → Cloudflare Cache (edge, global)
    → Signed URL (expires 24h, public-read)
      → Mobile app (download + verify)
```

| Property | Value |
|---|---|
| Provider | Cloudflare R2 |
| Bucket | `tutorsg-models-prod` |
| Region | APAC (Singapore origin) |
| Edge caching | Cloudflare CDN (global, automatic) |
| Access control | Signed URLs (HMAC-SHA256, 24h expiry) |
| URL scheme | `https://models.tutorsg.com/{model}/{version}/{platform}.mdl` |
| Fallback CDN | R2 direct (no signed URL cache, used when CDN edge miss) |

Models are public-read from the CDN — the signed URLs prevent hotlinking but do not require app-side authentication. No user credentials are sent to the CDN; the app fetches a one-time signed URL from a Supabase Edge Function or the CDN worker on each download session.

### 5.2 Model versioning scheme

**Semantic versioning for model packages: `MAJOR.MINOR.PATCH`**

| Component | Bump trigger | Upgrade behavior |
|---|---|---|
| **MAJOR** | Breaking format change (new tokenizer, new architecture, incompatible config) | Full download required; old model deleted after swap |
| **MINOR** | Quality improvement (fine-tuned weights, same format) | Delta preferred; full download fallback |
| **PATCH** | Minor fix (quantization tweak, metadata correction) | Delta only; small download |

**Version pinning in the app:**

The app declares a minimum supported model version range in its build-time config (`app.config.ts`). At runtime, before loading a model, the inference engine checks that the on-device model version satisfies `>= minRequiredVersion` for this app version. If the on-device model is too old and no newer version can be downloaded, the app shows "Update the app to continue" / "请更新应用以继续" and blocks inference.

```ts
// Build-time config (app.config.ts)
const MODEL_VERSION_CONTRACT: Record<ModelId, { min: string; max: string }> = {
  "gemma-e4b": { min: "1.0.0", max: "2.0.0" },
  "gemma-e2b": { min: "1.0.0", max: "2.0.0" },
  "qwen-4b":   { min: "1.0.0", max: "2.0.0" },
  "qwen-2b":   { min: "1.0.0", max: "2.0.0" },
};
```

Platform-specific model files follow the naming convention `{model}-v{version}-{platform}.mdl` (e.g., `gemma-e4b-v1.2.0-android.mdl`). Each platform variant may have a different file size and hash because of differing quantization formats (ExecuTorch vs. TFLite).

### 5.3 Manifest format (`index.json`)

The CDN root hosts `index.json` — the single source of truth for available model versions. The app fetches this manifest on first launch and on every cold launch (with `If-None-Match` for conditional caching).

```jsonc
{
  "manifestVersion": 2,
  "generatedAt": "2026-05-09T12:00:00Z",
  "models": {
    "gemma-e4b": {
      "description": "Gemma 4 E4B — English / Math / Science (high tier)",
      "latest": "1.2.0",
      "variants": {
        "1.2.0": {
          "released": "2026-05-01",
          "minAppVersion": "1.0.0",
          "platforms": {
            "ios": {
              "url": "https://models.tutorsg.com/gemma-e4b/1.2.0/ios.mdl",
              "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
              "format": "executorch-pte",
              "sizeBytes": 2684354560
            },
            "android": {
              "url": "https://models.tutorsg.com/gemma-e4b/1.2.0/android.mdl",
              "sha256": "6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090",
              "format": "litert-lm-tflite",
              "sizeBytes": 2684354560
            }
          },
          "deltaFrom": {
            "1.1.0": {
              "ios": {
                "url": "https://models.tutorsg.com/gemma-e4b/delta/1.1.0-1.2.0/ios.patch",
                "sha256": "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
                "algorithm": "xdelta3",
                "sizeBytes": 524288000
              }
            }
          }
        }
      }
    },
    "qwen-4b": {
      "description": "Qwen 3.5 4B — Chinese Mother Tongue (high tier)",
      "latest": "1.1.0",
      "variants": { /* same structure */ }
    }
    // gemma-e2b, qwen-2b follow same pattern
  }
}
```

The manifest is versioned (`manifestVersion`) so the app can detect breaking schema changes and fall back gracefully.

### 5.4 Delivery flow

#### 5.4.1 First-launch download

See §3.5 for the full first-launch flow. From the CDN perspective:

1. App fetches `index.json` (ETag-conditional, cached 1h locally)
2. Resolves required model set from device tier + `MODEL_VERSION_CONTRACT`
3. For each model: download with HTTP Range support → verify SHA-256 → move to permanent storage
4. Progress aggregated across all files, shown as a single progress bar
5. All models verified → load into inference engine → transition to main UI
6. Any irrecoverable failure → error screen with "Check your internet and try again" / "请检查网络连接并重试"

#### 5.4.2 Background update

On cold launch, the app fetches `index.json` (ETag-conditional). If any on-device model version is behind the CDN `latest`:

1. Download new model to temp storage (non-blocking, app is already usable with current model)
2. Store as "pending" with a `pending_version` flag in SQLite
3. On next cold launch: verify pending model integrity → atomic swap → delete old
4. If the device is offline when the swap is due, defer to next cold launch
5. User sees a subtle badge: "Update ready — restart to get latest improvements" / "更新就绪 — 重启应用以获取最新改进"

#### 5.4.3 Download resilience

- **HTTP Range support:** Every CDN URL supports `Range` headers. Lost connections resume from the last byte received, avoiding re-downloading gigabytes on flaky Wi-Fi.
- **Concurrent downloads:** Up to 2 models download in parallel (configurable by device tier — mid-tier devices limit to 1).
- **Wi-Fi gating:** Downloads over 100 MB require Wi-Fi by default. The user can override in Settings: "Allow model downloads over mobile data" / "允许使用移动数据下载模型" (default: OFF).
- **Background fetch:** On iOS, `BGTaskScheduler` requests a ~5-minute window for model updates. On Android, `WorkManager` with `NetworkType.CONNECTED` constraint handles this.

### 5.5 Delta update strategy

When `index.json` includes a `deltaFrom` entry from the installed version to the target version, the app can download a binary patch instead of the full model file.

| Aspect | Decision |
|---|---|
| Algorithm | **xdelta3** (first choice) — fast, open-source, proven for large binaries. Fallback: **bsdiff** if xdelta3 patch generation fails. |
| When to use delta | MINOR and PATCH upgrades (full download for MAJOR). Delta only available when `installedVersion` appears in target variant's `deltaFrom` map. |
| When to skip delta | If delta is >70% of full model size, download full instead (no point applying a near-full-size patch). |
| Patch application | Apply delta to a **copy** of the active model file in temp storage. Verify SHA-256 of the result. On success, the patched file becomes the pending model. On failure, fall back to full download. |
| Delta generation | Run offline during the CI/CD model release pipeline. Input: old `.mdl` + new `.mdl` → Output: `.patch` file. Patch file uploaded to CDN alongside full variants. |

### 5.6 Atomic model swap

The model swap sequence is designed for crash-safety — a power loss or app kill mid-swap leaves the device in a recoverable state.

```
State: Active model at /models/gemma-e4b-v1.1.0-android.mdl
Target: Upgrade to 1.2.0

1. Download 1.2.0 → /models/.pending/gemma-e4b-v1.2.0-android.mdl
2. Verify SHA-256 of pending file
3. Write intent: SQLite row { model: "gemma-e4b", pending: "1.2.0" }
4. On next cold launch, before inference engine init:
   a. Read pending intent from SQLite
   b. Verify pending file SHA-256 again
   c. Atomic rename: /models/.pending/X → /models/X
      (On APFS/ext4, rename is atomic; app cannot see partial state)
   d. Delete old /models/gemma-e4b-v1.1.0-android.mdl
   e. Clear pending intent from SQLite
5. If step 4 fails at any point:
   a. Delete pending file
   b. Clear pending intent
   c. Continue with old model (no-op, retry on next update cycle)
```

### 5.7 Integrity verification and recovery

Every model file and delta patch is verified against its SHA-256 hash from `index.json` before being loaded into the inference engine.

| Scenario | Action |
|---|---|
| Hash matches | Proceed to load |
| Hash mismatch on download | Delete temp file, retry download once (different CDN edge if possible). Second failure → error screen. |
| Hash mismatch on pending file at cold launch | Delete pending file, clear intent, retry download. |
| `index.json` fetch fails | Use cached manifest (stored in SQLite, valid up to 7 days). If no cache → error: "Cannot check for updates" / "无法检查更新". |
| CDN returns 4xx/5xx | Exponential backoff: 1s, 5s, 15s, then error. |

### 5.8 Storage management

Total on-device model footprint:

| Tier | Models | Approx size |
|---|---|---|
| High (≥6 GB RAM) | Gemma E4B + Qwen 4B | ~4.9 GB |
| Mid (3–5 GB RAM) | Gemma E2B + Qwen 2B | ~2.5 GB |

**Pre-download checks:**
1. `NSFileManager.availableFreeSpace` (iOS) / `StatFs.getAvailableBlocks` (Android) before starting any download
2. Required: free space ≥ model size × 1.5 (headroom for temp files, app data, OS)
3. If insufficient: "Not enough space — free up {N} MB and try again" / "存储空间不足 — 请释放 {N} MB 后重试"

**Cleanup rules:**
- Old model versions deleted immediately after successful atomic swap
- Temp and `.pending` files cleaned on cold launch (stale downloads from killed app sessions)
- User-visible storage breakdown in Settings: "Models: X.X GB" with per-model listing

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

See §5 for the full CDN delivery and integrity strategy. In brief:
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
