# tutor-sg — Technical Architecture v1.0

> **Status:** v1.0 — locked 2026-05-07
> **Author:** Owl (CTO)
> **Authority:** This document is the single source of truth for all tutor-sg subsystem design.
> **Sources:** [[app-design-document]](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md), [[decisions-locked]](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fdecisions-locked.md), [[architecture-memo]](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farchitecture.md), [[article-04]](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farticles%2F04-deeptutor-architecture-lift.md)
> **Cross-referenced from:** ADD §14

---

## 1. System topology

```
┌─────────────────────────────────────────────────────────┐
│                      Mobile App                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Camera /  │  │  LLM Runtime │  │  Parent Dashboard │  │
│  │ OCR       │  │  (Gemma/Qwen)│  │  (PIN-gated)      │  │
│  └────┬─────┘  └──────┬───────┘  └─────────┬─────────┘  │
│       │               │                    │             │
│  ┌────┴───────────────┴────────────────────┴─────────┐  │
│  │              SQLite + sqlite-vec                   │  │
│  │  (sessions, profiles, syllabus RAG, mistake bank,  │  │
│  │   usage counters, i18n prefs, download state)      │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │  opt-in only, anonymized
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Cloud (thin)                          │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐    │
│  │ Supabase │  │  HitPay  │  │  Cloudflare R2     │    │
│  │ (auth,   │  │ (billing │  │  (model CDN,       │    │
│  │  sync,   │  │  webhook)│  │   integrity-hashed) │    │
│  │  webhook)│  │          │  │                     │    │
│  └──────────┘  └──────────┘  └────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Key principle:** All child data stays on-device. The cloud layer handles only auth, billing, and opt-in anonymized telemetry. No server-side LLM, no server-side OCR, no server-side child content.

---

## 2. Stack

| Layer                   | Choice                                                           | Rationale                                                                  |
| ----------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| App framework           | React Native 0.81 + Expo SDK 54 + TypeScript 5.8                 | Single codebase iOS+Android; `react-native-executorch` exists              |
| Build service           | Expo EAS                                                         | Managed build pipeline, OTA updates                                        |
| On-device LLM (iOS)     | ExecuTorch + Gemma 4 E2B/E4B via `react-native-executorch`       | Maintained by ExecuTorch integration team                                  |
| On-device LLM (Android) | LiteRT-LM + Gemma 4 E2B/E4B                                      | Google's mobile inference runtime for Gemma                                |
| Chinese MT LLM          | Qwen 3.5 2B/4B via ExecuTorch (iOS) / LiteRT-LM (Android)        | Purpose-built for Chinese language tasks                                   |
| Vision/OCR (iOS)        | Apple Vision Framework (`VNRecognizeTextRequest`)                | On-device, accurate mode, EN+zh language corpus, handwriting iOS 18+       |
| Vision/OCR (Android)    | Google ML Kit Text Recognition v2                                | On-device only (cloud-off), Latin+Chinese character set                    |
| On-device DB            | expo-sqlite (SQLite) + sqlite-vec                                | Sessions, profiles, syllabus RAG, mistake bank, usage counters             |
| KV store                | react-native-mmkv                                                | Fast key-value for non-relational state (entitlement cache, feature flags) |
| Backend                 | Supabase                                                         | Auth, billing webhooks, parent dashboard sync (thin)                       |
| Payments                | HitPay                                                           | Singapore-native; Apple Pay, Google Pay, PayNow                            |
| IAP SDK                 | Apple StoreKit 2 (Swift async) / Google Play Billing v6 (Kotlin) | Bridged via native modules                                                 |
| CDN                     | Cloudflare R2                                                    | Model files, signed URLs, integrity manifests                              |
| i18n                    | i18next + react-i18next                                          | Flat phrase-keyed JSON, `keySeparator: false`, EN + zh-Hans                |

---

## 3. On-device LLM subsystem

### 3.1 Model inventory

| Model ID    | Model             | Size (approx) | Primary use                 | Engine (iOS) | Engine (Android) |
| ----------- | ----------------- | ------------- | --------------------------- | ------------ | ---------------- |
| `gemma-e4b` | Gemma 4 E4B INT4  | ~2.5 GB       | EN/Math/Science — high tier | ExecuTorch   | LiteRT-LM        |
| `gemma-e2b` | Gemma 4 E2B INT4  | ~1.3 GB       | EN/Math/Science — mid tier  | ExecuTorch   | LiteRT-LM        |
| `qwen-4b`   | Qwen 3.5 4B NVFP4 | ~2.4 GB       | Chinese MT — high tier      | ExecuTorch   | LiteRT-LM        |
| `qwen-2b`   | Qwen 3.5 2B INT4  | ~1.2 GB       | Chinese MT — mid tier       | ExecuTorch   | LiteRT-LM        |

### 3.2 Model routing

```
Subject requested
├── Chinese Mother Tongue → Qwen 3.5 (4B → high-tier, 2B → mid-tier)
└── English / Math / Science → Gemma 4 (E4B → high-tier, E2B → mid-tier)
```

Routing is a static config map — never hardcode model IDs in conditionals:

```ts
// packages/shared/src/models/routing.ts
type ModelId = 'gemma-e4b' | 'gemma-e2b' | 'qwen-4b' | 'qwen-2b';

interface ModelRoutingTable {
  [subject: string]: {
    high: ModelId;
    mid: ModelId;
  };
}

const MODEL_ROUTING: ModelRoutingTable = {
  english: { high: 'gemma-e4b', mid: 'gemma-e2b' },
  math: { high: 'gemma-e4b', mid: 'gemma-e2b' },
  science: { high: 'gemma-e4b', mid: 'gemma-e2b' },
  chinese_mt: { high: 'qwen-4b', mid: 'qwen-2b' },
};

function resolveModel(subject: string, tier: DeviceTier): ModelId {
  const entry = MODEL_ROUTING[subject];
  if (!entry) return 'gemma-e2b'; // safe default
  return tier === 'high' ? entry.high : entry.mid;
}
```

### 3.3 Capability manifest system (lifted from DeepTutor's two-layer plugin model)

Every feature declares a `CapabilityManifest` — its slug, tools, stages, and inference budget:

```ts
// packages/shared/src/capabilities/types.ts
type CapabilityManifest = {
  name: string; // "photo_solve"
  title: { en: string; zhHans: string }; // bilingual
  stages: string[]; // ["读题", "想步骤", "写答案"] — drives progress dots
  tools: ToolName[]; // function-call whitelist for this capability
  modelTier: 'E2B' | 'E4B'; // inference budget
};
```

**Capability catalog (v1):**

| Capability             | `modelTier` | Tools                                                      | Rationale                                            |
| ---------------------- | ----------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| `photo_solve`          | E4B         | `ocr_read`, `plan_steps`, `write_solution`, `check_answer` | Multi-step reasoning across vision + math/science/EN |
| `quick_chat`           | E2B         | `chat`                                                     | Casual follow-up, low latency                        |
| `worksheet_generate`   | E4B         | `fetch_topic`, `generate_questions`, `render_worksheet`    | Needs syllabus knowledge + creative generation       |
| `worksheet_mark`       | E4B         | `ocr_read`, `compare_answer`, `explain_error`              | Answer comparison + pedagogical explanation          |
| `chinese_stroke_check` | E4B         | `ocr_read`, `compare_stroke_order`, `animate_stroke`       | Stroke-order precision needs larger model            |
| `chinese_dictation`    | E2B         | `tts_speak`, `ocr_read`, `compare_text`                    | Dictation is mainly TTS + OCR compare                |
| `session_summarize`    | E2B         | `summarize`                                                | Runs after session; summary generation               |

**Downgrade rule:** If device tier is `mid` but capability demands `E4B`, router downgrades to `E2B`. The capability adapts (shorter response, fewer reasoning steps). The user is not shown the downgrade.

### 3.4 Performance targets

| Metric                             | High tier (≥6 GB + NPU) | Mid tier (3–5 GB) | Hard ceiling                                          |
| ---------------------------------- | ----------------------- | ----------------- | ----------------------------------------------------- |
| Photo-to-first-token (P95)         | < 8 sec                 | < 15 sec          | 15 sec — if exceeded, show "this might take a moment" |
| Chat response (P95)                | < 3 sec                 | < 6 sec           | —                                                     |
| Model load on cold start           | < 5 sec                 | < 10 sec          | —                                                     |
| Camera preview fps                 | ≥ 30 fps                | ≥ 30 fps          | —                                                     |
| App cold start (before model load) | < 3 sec                 | < 3 sec           | —                                                     |

---

## 4. Device tier detection subsystem

### 4.1 Detection timing

Run once at first launch, before any model download. Result persisted in SQLite → subsequent launches skip detection.

### 4.2 Detection method

**iOS:** `NSProcessInfo.processInfo.physicalMemory` via native module. Apple devices have deterministic RAM by model — the native module also uses a device-model lookup table as fallback.

**Android:** Read `/proc/meminfo` → `MemTotal` via native module. Also query `ActivityManager.MemoryInfo`.

### 4.3 Tier thresholds

| Tier          | RAM    | NPU requirement                                | Models assigned | On-device footprint |
| ------------- | ------ | ---------------------------------------------- | --------------- | ------------------- |
| `high`        | ≥ 6 GB | Modern NPU (A14+ / SD8Gen1+ / Dimensity 9000+) | E4B + Qwen 4B   | ~4.9 GB             |
| `mid`         | 3–5 GB | Any                                            | E2B + Qwen 2B   | ~2.5 GB             |
| `unsupported` | < 3 GB | —                                              | None (blocked)  | —                   |

**NPU detection:**

- **iOS:** Check ANE availability via Core ML. All A14+ chips have ANE; RAM check is sufficient.
- **Android:** Check NNAPI delegate availability via LiteRT-LM runtime.

### 4.4 Detection module interface

```ts
// packages/shared/src/device/types.ts
interface DeviceTierResult {
  tier: 'high' | 'mid' | 'unsupported';
  ramGb: number;
  hasNpu: boolean;
  modelId: string; // e.g. "iPhone15,2" or "SM-A536B"
  osVersion: string;
}

// Called once at first launch via native module
async function detectDeviceTier(): Promise<DeviceTierResult>;
```

### 4.5 Unsupported device handling

When `tier === "unsupported"`:

- EN: "This device doesn't have enough memory to run the tutor. tutor-sg needs at least 3 GB of RAM."
- zh-Hans: "此设备内存不足，tutor-sg 至少需要 3 GB 内存。"
- No model download attempted. App remains on this screen (blocked).

### 4.6 User quality override

Settings → "Quality" slider lets power users force a tier. Override stored in MMKV. Does not allow forcing `unsupported` devices to `mid`.

---

## 5. LLM model downloader subsystem

### 5.1 Design goals

- App package < 50 MB (model files NOT bundled)
- Download once at first launch, before main UI renders
- Supports HTTP Range resume (E4B ≈ 2.5 GB)
- SHA-256 integrity verified before loading into inference engine
- Kid-safe: no remote-LLM calls triggered during or after download

### 5.2 CDN layout (Cloudflare R2)

```
https://models.tutor-sg.com/
├── gemma/
│   ├── e4b/
│   │   ├── gemma-e4b-ios.pte          # ExecuTorch .pte for iOS
│   │   ├── gemma-e4b-android.lrt      # LiteRT-LM for Android
│   │   └── manifest.json               # sha256, version, size
│   └── e2b/
│       ├── gemma-e2b-ios.pte
│       ├── gemma-e2b-android.lrt
│       └── manifest.json
├── qwen/
│   ├── 4b/
│   │   ├── qwen-4b-ios.pte
│   │   ├── qwen-4b-android.lrt
│   │   └── manifest.json
│   └── 2b/
│       ├── qwen-2b-ios.pte
│       ├── qwen-2b-android.lrt
│       └── manifest.json
└── index.json                          # maps tiers → required files
```

**`index.json`:**

```json
{
  "version": 1,
  "tiers": {
    "high": {
      "files": [
        { "path": "gemma/e4b/gemma-e4b-ios.pte", "platform": "ios" },
        { "path": "gemma/e4b/gemma-e4b-android.lrt", "platform": "android" },
        { "path": "qwen/4b/qwen-4b-ios.pte", "platform": "ios" },
        { "path": "qwen/4b/qwen-4b-android.lrt", "platform": "android" }
      ]
    },
    "mid": {
      "files": [
        { "path": "gemma/e2b/gemma-e2b-ios.pte", "platform": "ios" },
        { "path": "gemma/e2b/gemma-e2b-android.lrt", "platform": "android" },
        { "path": "qwen/2b/qwen-2b-ios.pte", "platform": "ios" },
        { "path": "qwen/2b/qwen-2b-android.lrt", "platform": "android" }
      ]
    }
  }
}
```

### 5.3 Download flow

```
App launch (first time)
  → Show loading screen: "Setting up your tutor..." / "正在设置你的导师..."
  → Device tier detection (§4)
  → Fetch index.json from CDN
  → Filter to platform + tier
  → For each file:
      → Check if already downloaded (local manifest cache in SQLite)
      → If missing or version mismatch:
          → Download with Range-header resume support
          → Write to temp file
          → Verify sha256 against manifest.json
          → On pass: move to permanent storage
          → On fail: delete, retry once; if fail again → show error
  → All files verified → load models into inference engine
  → Transition to main UI
```

### 5.4 Resume support

Downloads use HTTP Range requests. Progress tracked per file in SQLite:

```sql
CREATE TABLE model_downloads (
  file_path TEXT PRIMARY KEY,
  version INTEGER NOT NULL,
  total_bytes INTEGER NOT NULL,
  downloaded_bytes INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  status TEXT NOT NULL,  -- 'downloading' | 'verifying' | 'complete' | 'failed'
  storage_path TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

On app restart, resume any `downloading` entry from `downloaded_bytes` using `Range: bytes={downloaded_bytes}-`.

### 5.5 On-device storage

| Platform | Path                                                      | Notes                       |
| -------- | --------------------------------------------------------- | --------------------------- |
| iOS      | `{Application Support}/models/`                           | Excluded from iCloud backup |
| Android  | `{Internal Storage}/Android/data/{package}/files/models/` | App-private storage         |

### 5.6 Error states

| Error                  | EN                                                                                     | zh-Hans                                            |
| ---------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------- |
| No network             | "You need an internet connection to set up the tutor. Connect to Wi-Fi and try again." | "需要网络连接来设置导师，请连接 Wi-Fi 后重试。"    |
| Insufficient storage   | "Not enough storage space. Free up at least {required} and try again."                 | "存储空间不足，请释放至少 {required} 空间后重试。" |
| Integrity check failed | "Download was interrupted. We'll try again."                                           | "下载中断，正在重试。"                             |
| CDN unreachable        | "Can't reach the download server. Check your connection and try again."                | "无法连接到下载服务器，请检查网络后重试。"         |
| All retries exhausted  | "Something went wrong during setup. Please restart the app or contact support."        | "设置过程中出现问题，请重启应用或联系支持。"       |

### 5.7 Model version upgrades

When `index.json` version increments (checked on app launch after first install):

1. New model files download in background (non-blocking)
2. Once downloaded + verified, old model swapped atomically on next cold launch
3. Old files deleted after successful swap

---

## 6. Vision / OCR subsystem

### 6.1 Pipeline stages

```
Camera capture
  → Stage 1: Platform OCR (Apple Vision / ML Kit)
    → Confidence scoring per text block
      → Blocks ≥ 0.6 confidence: keep
      → Blocks < 0.6 but ≥ 0.3: mark "low_confidence", offer manual input
      → All blocks < 0.3: show retake prompt
  → Stage 2: Gemma semantic analysis
    → Input: OcrResult { blocks[], subject, level }
    → Output: { plan, steps, final } — single-pass structured JSON
  → Stage 3: Response rendering in chat UI
  → Auto-save session to Parent Log (local SQLite)
```

### 6.2 Stage 1 — Platform OCR

**iOS:** `VNRecognizeTextRequest` from Apple Vision Framework. Configured for:

- Accurate recognition (not fast)
- English + Chinese language corpus
- Handwriting recognition enabled where available (iOS 18+)

**Android:** Google ML Kit Text Recognition v2. Configured for:

- Latin + Chinese character set
- Cloud-off (on-device only)

Both produce: raw text, per-block bounding boxes, per-block confidence scores.

### 6.3 Confidence scoring and fallback

```ts
interface OcrBlock {
  text: string;
  confidence: number; // 0.0–1.0
  boundingBox: { x: number; y: number; width: number; height: number };
  source: 'ocr' | 'manual';
}

interface OcrResult {
  blocks: OcrBlock[];
  subject: string;
  level: string; // "P1"–"P6"
}
```

Fallback rules:

- `confidence ≥ 0.6`: keep block, display as read-only text
- `0.3 ≤ confidence < 0.6`: mark "low_confidence", show tappable input field
- `confidence < 0.3` on all blocks: show retake prompt, offer "Type the question instead"

### 6.4 Manual input fallback UI

When one or more blocks fall below 0.6:

1. Recognized portions displayed as read-only text
2. Low-confidence blocks replaced with input fields labeled "Tap to type what you see here" / "点击输入题目"
3. Each field accepts free-text input (keyboard appropriate to subject language)
4. "Submit" button sends complete text (recognized + manually entered) to Stage 2

Prompt: "Cannot recognise some parts of the question. Please type them." / "部分题目识别不清，请输入。"

### 6.5 Unrecoverable fallback

If OCR produces zero blocks above 0.3 (blank page, completely blurred):

- EN: "We couldn't read this photo. Try taking another photo with better lighting."
- zh-Hans: "无法识别此照片，请在光线更好的环境下重试。"
- Offer "Type the question instead" button → direct manual entry form, skips OCR

### 6.6 Stage 2 — Gemma semantic analysis

The complete text (OCR + manual corrections) is fed to Gemma with a structured prompt. The model receives the `OcrResult` and returns `{ plan, steps, final }` JSON — a single-pass structured output adapted from DeepTutor's Plan→ReAct→Write pattern but simplified for mobile latency budgets.

---

## 7. Auth & profile subsystem

### 7.1 Auth model

| User   | Auth method                                              | Storage                       | Notes                                 |
| ------ | -------------------------------------------------------- | ----------------------------- | ------------------------------------- |
| Parent | Email magic link OR Google/Apple Sign-In (Supabase Auth) | Supabase + local secure store | One parent account                    |
| Kid    | Local-only, no login, no auth token                      | Local SQLite `profiles` table | Up to 4 kid profiles under one parent |

### 7.2 Parent auth flow

```
First launch
  → Onboarding: privacy promise screen
  → PIN setup (4-digit, parent sets, stored locally as hash)
  → Device tier detection + model download
  → First homework session (kid can use immediately, no email required)
  → After first session: "See how your child is doing" → email sign-up prompt
  → Supabase Auth: magic link OR Google/Apple OAuth
  → Auth token stored in Keychain (iOS) / EncryptedSharedPreferences (Android)
```

### 7.3 Kid profile model

```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,               -- UUID
  parent_auth_id TEXT NOT NULL,      -- Supabase user ID (NULL for pre-auth)
  name TEXT NOT NULL,                -- Display name
  level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 6),  -- P1–P6
  avatar_index INTEGER DEFAULT 0,    -- Index into avatar picker
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 7.4 PIN gate (Parent Dashboard access)

- 4-digit PIN set by parent during onboarding
- PIN hash (bcrypt or scrypt) stored in SQLite, never leaves device
- Required to enter Parent area
- 5 failed attempts → 60-second cooldown
- Kid cannot access PIN gate settings

### 7.5 Parental gate for purchases

All purchase flows require a parent gate (in addition to platform IAP):

1. Before purchase UI renders: "Ask a parent to enter their birth year." / "请家长输入出生年份。"
2. Validate year corresponds to age ≥ 18
3. On failure: "A parent or guardian needs to complete this purchase." / "需要家长或监护人完成购买。"
4. Gate cached for 5 minutes per session

This satisfies App Store Guideline 3.1.1 for Education category.

---

## 8. Database subsystem

### 8.1 Database technology

- **Primary:** expo-sqlite (SQLite via Expo module)
- **Vector search:** sqlite-vec extension (syllabus RAG, mistake bank similarity)
- **KV store:** react-native-mmkv (entitlement cache, feature flags, device tier, i18n preference, PIN hash)

### 8.2 Full schema

```sql
-- 8.2.1 Profiles
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  parent_auth_id TEXT,
  name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 6),
  avatar_index INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 8.2.2 Sessions (homework sessions, practice sessions)
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id),
  subject TEXT NOT NULL,             -- 'math' | 'english' | 'science' | 'chinese_mt'
  level INTEGER NOT NULL,
  topic_id TEXT,                     -- references taxonomy topic
  capability TEXT NOT NULL,          -- 'photo_solve' | 'quick_chat' | etc.
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_seconds INTEGER,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  struggle_indicators TEXT,          -- JSON array of struggle signals
  ai_summary_en TEXT,                -- Generated summary (EN)
  ai_summary_zh TEXT,                -- Generated summary (zh-Hans)
  parent_flagged INTEGER DEFAULT 0,  -- 0=no, 1=yes
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 8.2.3 Session events (detailed interaction log)
CREATE TABLE session_events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  event_type TEXT NOT NULL,          -- 'photo_captured' | 'ocr_result' | 'llm_prompt' | 'llm_response' | 'user_followup' | 'manual_input' | 'answer_submitted' | 'hint_shown' | 'solution_shown'
  event_data TEXT NOT NULL,          -- JSON blob with type-specific data
  timestamp TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 8.2.4 Mistake bank
CREATE TABLE mistake_bank (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id),
  session_id TEXT NOT NULL REFERENCES sessions(id),
  question_id TEXT,                  -- references question-bank if from worksheet
  question_text TEXT NOT NULL,       -- The question as shown to kid
  kid_answer TEXT,                   -- What the kid wrote
  correct_answer TEXT,               -- Expected answer
  subject TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  level INTEGER NOT NULL,
  error_type TEXT,                   -- 'concept' | 'careless' | 'method' | 'language'
  review_count INTEGER DEFAULT 0,
  mastered INTEGER DEFAULT 0,        -- 0=still struggling, 1=mastered
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_reviewed_at TEXT
);

-- 8.2.5 Usage counters (free tier)
CREATE TABLE usage_counters (
  feature TEXT NOT NULL,             -- 'photo_solve' | 'quick_chat' | etc.
  date TEXT NOT NULL,                -- 'YYYY-MM-DD'
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (feature, date)
);

-- 8.2.6 Downloaded syllabus content
CREATE TABLE content_corpus (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,        -- 'topic' | 'question' | 'worksheet'
  subject TEXT NOT NULL,
  level INTEGER NOT NULL,
  topic_id TEXT NOT NULL,
  payload TEXT NOT NULL,             -- JSON content
  version INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 8.2.7 Model downloads (tracking + resume)
CREATE TABLE model_downloads (
  file_path TEXT PRIMARY KEY,
  version INTEGER NOT NULL,
  total_bytes INTEGER NOT NULL,
  downloaded_bytes INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  status TEXT NOT NULL,              -- 'downloading' | 'verifying' | 'complete' | 'failed'
  storage_path TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 8.2.8 App preferences (device-level, not profile-level)
CREATE TABLE app_preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Stores: device_tier, i18n_language, onboarding_complete, pin_hash, model_version
```

### 8.3 Data lifecycle

| Data              | Retention               | Eviction                                 |
| ----------------- | ----------------------- | ---------------------------------------- |
| Sessions          | Indefinite (local only) | Parent can delete individual sessions    |
| Session events    | 90 days                 | Auto-purge rows older than 90 days       |
| Mistake bank      | Until mastered          | Auto-remove after `mastered=1` + 30 days |
| Usage counters    | Rolling 30 days         | Auto-purge rows older than 30 days       |
| Photos (homework) | In-memory only          | Never persisted to disk                  |
| OCR text          | Session lifetime        | Cleared when session ends                |
| Model downloads   | Until version upgrade   | Old files deleted after verified swap    |

---

## 9. IAP subsystem

### 9.1 Product catalog

| Product ID            | Type                          | Platform | Price (SGD)           | Notes                                           |
| --------------------- | ----------------------------- | -------- | --------------------- | ----------------------------------------------- |
| `family_monthly`      | Auto-renewable subscription   | Both     | $79/month             | Up to 4 child profiles, all subjects, unlimited |
| `family_annual`       | Auto-renewable subscription   | Both     | $699/year ($58.25/mo) | Annual discount                                 |
| `psle_sprint`         | Non-renewing 6-month access   | Both     | $299                  | P6 June–November; no monthly option             |
| `psle_sprint_upgrade` | Upgrade from Sprint to Annual | Both     | $400 (prorated)       | Available during Sprint period                  |

### 9.2 StoreKit 2 (iOS)

Bridged to React Native via a thin native module:

```
React Native (TS) → NativeModules.IAPManager → StoreKit 2 (Swift async)
```

Key StoreKit 2 endpoints:

- `Product.products(for:)` — fetch product metadata
- `Product.purchase()` — initiate purchase
- `Transaction.currentEntitlements` — verify active subscription
- `Transaction.updates` (async sequence) — listen for renewals, cancellations, refunds
- `AppTransaction.shared` — verify app receipt at launch

StoreKit 2 handles receipt validation locally via JWS signed transactions. No server-side receipt validation needed for v1.

### 9.3 Google Play Billing v6 (Android)

```
React Native (TS) → NativeModules.IAPManager → BillingClient (Kotlin)
```

Key Billing v6 flows:

- `BillingClient.queryProductDetails()` — fetch products
- `BillingClient.launchBillingFlow()` — start purchase
- `BillingClient.queryPurchasesAsync()` — check entitlements
- `PurchasesUpdatedListener` — handle renewals, cancellations, grace period

### 9.4 Backend verification (HitPay webhook)

HitPay receives subscription events and POSTs webhooks to Supabase:

1. Supabase receives `subscription.created` / `subscription.renewed` / `subscription.cancelled` / `subscription.expired`
2. Updates entitlement in Supabase `profiles` table
3. App polls entitlement on launch + foreground

### 9.5 Entitlement state machine

```
              ┌─────────┐
              │  NONE   │
              └────┬────┘
                   │ trial_start()
                   ▼
              ┌─────────┐
              │  TRIAL  │──trial_expire()──→ NONE
              └────┬────┘
                   │ purchase()
                   ▼
         ┌──────────────────┐
         │  ACTIVE          │
         │  (monthly/annual) │
         └────────┬─────────┘
                  │ cancel() / expire()
                  ▼
         ┌──────────────────┐
         │  GRACE_PERIOD    │──payment_recovered()──→ ACTIVE
         └────────┬─────────┘
                  │ grace_expire()
                  ▼
              ┌─────────┐
              │ EXPIRED │
              └─────────┘
```

---

## 10. Freemium gating subsystem

### 10.1 Tier definitions

| Feature                              | Free (no IAP) | Trial (7 days)    | Paid (Family/PSLE) |
| ------------------------------------ | ------------- | ----------------- | ------------------ |
| Photo solve                          | 3 per day     | Unlimited         | Unlimited          |
| Quick chat                           | Unlimited     | Unlimited         | Unlimited          |
| Worksheet practice                   | 1 per day     | Unlimited         | Unlimited          |
| Mistake bank                         | Last 5 items  | Full              | Full               |
| Weekly parent report                 | ❌            | ✅                | ✅                 |
| Chinese stroke-order check           | ❌            | ✅                | ✅                 |
| P5/P6 Study Programme                | ❌            | ✅ (all subjects) | ✅ (all subjects)  |
| Multi-child profiles                 | 1 child only  | Up to 4 children  | Up to 4 children   |
| Sibling bridge (cross-level content) | ❌            | ✅                | ✅                 |
| Offline mode                         | ✅            | ✅                | ✅                 |
| Ad-free                              | ✅            | ✅                | ✅                 |

### 10.2 Free tier design

Free tier is a **try-before-buy** experience, not a permanent free product:

- **3 photo-solves/day** — enough to experience the core value prop but not replace a tutor
- **Last 5 mistake-bank items** — shows the feature exists without making it useful for real revision
- **No parent report** — the parent's primary touchpoint is gated; parent cannot see value until trial/subscribe
- **No Chinese stroke-order** — highest-differentiation feature gated
- **No ads, no data collection** — still kid-safe and privacy-preserving

### 10.3 Trial mechanics

- 7 calendar days, starts on first photo-solve (not app install)
- No credit card required to start
- CTA after first successful photo-solve: "See how your child is doing — start your free week." / "查看你孩子的学习进度 — 开始免费试用。"
- Second CTA at day 5: "Your free trial ends in 2 days. Keep unlimited access from S$79/month." / "免费试用还剩 2 天，每月 S$79 起继续无限使用。"
- Trial expiry: app reverts to free tier. Mistake bank truncates. Parent report unavailable. "Resubscribe" button on every gated screen.

### 10.4 Entitlement check flow

```
App foreground
  → Check cached entitlement in MMKV (valid 5 min)
  → If expired → fetch from Supabase /api/entitlement
  → Match against feature gate table
  → Render UI with appropriate gates
```

Feature gates are a static table, not scattered conditionals:

```ts
// packages/shared/src/entitlements/gates.ts
interface FeatureGate {
  feature: string;
  minimumTier: 'free' | 'trial' | 'paid';
}

const FEATURE_GATES: FeatureGate[] = [
  { feature: 'photo_solve', minimumTier: 'free' },
  { feature: 'photo_solve_unlimited', minimumTier: 'trial' },
  { feature: 'mistake_bank_full', minimumTier: 'trial' },
  { feature: 'parent_report', minimumTier: 'trial' },
  { feature: 'chinese_stroke_check', minimumTier: 'trial' },
  { feature: 'study_programme', minimumTier: 'paid' },
  { feature: 'multi_child', minimumTier: 'trial' },
  { feature: 'worksheet_unlimited', minimumTier: 'trial' },
  { feature: 'sibling_bridge', minimumTier: 'trial' },
];

const TIER_RANK: Record<string, number> = { free: 0, trial: 1, paid: 2 };

function canAccess(feature: string, entitlement: Entitlement): boolean {
  const gate = FEATURE_GATES.find((g) => g.feature === feature);
  if (!gate) return false;
  return TIER_RANK[entitlement.tier] >= TIER_RANK[gate.minimumTier];
}
```

### 10.5 Usage counter (free tier)

- Photo-solve usage tracked in `usage_counters` table (feature + date + count)
- Reset at midnight local time
- On hitting daily limit (3): "You've used your 3 free photo-solves today. Ask a parent to start a free trial for unlimited access." / "今天的 3 次免费解题已用完，请家长开启免费试用获取无限次数。"

### 10.6 Child-facing payment UX

- Child never sees a price
- Gated features show lock icon + "Ask a parent to unlock" / "请家长解锁"
- Tapping lock triggers parent gate (birth-year challenge)
- Price screen only shown after parent gate passes

---

## 11. i18n subsystem

### 11.1 Architecture

- **Library:** i18next + react-i18next
- **Structure:** Flat phrase-keyed JSON, `keySeparator: false` (no nested keys)
- **Languages:** `en` (English, default) + `zh-Hans` (Simplified Chinese)
- **Fallback:** Always `en` (the source language for all keys)
- **Plurals + interpolation:** ICU MessageFormat via `i18next-icu`

### 11.2 Phrase key format

```json
{
  "photo_solve_title": {
    "en": "Snap and Solve",
    "zh-Hans": "拍照解题"
  },
  "free_limit_reached": {
    "en": "You've used your {count, plural, one {# free photo-solve} other {# free photo-solves}} today.",
    "zh-Hans": "今天的 {count} 次免费解题已用完。"
  },
  "ocr_unrecognized_blocks": {
    "en": "Cannot recognise some parts of the question. Please type them.",
    "zh-Hans": "部分题目识别不清，请输入。"
  }
}
```

### 11.3 Language switching

- Default language set via `expo-localization` (detects device locale)
- Kid can switch per session (EN homework → English UI; Chinese MT homework → Chinese UI)
- Language preference stored in `app_preferences` table → `i18n_language` key
- Language switch triggers re-render of all active screens (no app restart needed)

### 11.4 Hong Kong / Traditional Chinese

Hard rule: **No Traditional Chinese (zh-Hant) in v1.** Singapore MOE Chinese is Simplified. Do not add zh-Hant variant strings.

### 11.5 Singapore-localized phrasing

Use `zh-Hans-SG` locale for Singapore-specific terms (HDB, MRT, hawker, SGD) rather than generic `zh-CN`. The `zh-Hans` key set should use Singapore-localized phrasing throughout.

---

## 12. Content management subsystem

### 12.1 Content model

```
MOE Syllabus PDFs (public Crown Copyright)
  → Topic taxonomy extracted (data/taxonomy.json)
    → AI-generated questions (Gemma 4 on Mac Studio via Ollama)
      → Human review (ex-MOE teachers)
        → Packaged corpus (data/question-bank.json)
          → Shipped as static SQLite database embedded in app
```

### 12.2 Corpus structure

The content corpus is a static SQLite database embedded in the app bundle. It contains:

- **Topic tree** — structured hierarchy of subjects → levels → topics, with learning outcomes
- **Questions** — 200+ original questions per subject per level (target), MECE across the topic tree
- **Hints** — progressive hint chains (1–3 hints per question, hint-first pedagogy)
- **Explanations** — full solution walkthroughs in both languages

### 12.3 Corpus versioning

- Corpus version is embedded as a single integer in `app_preferences` → `content_version`
- Updated via app store updates (not hot-loaded)
- Version bump triggers re-index of sqlite-vec embeddings

### 12.4 Question-bank entry format

```ts
interface Question {
  question_id: string; // "Q-MAT-P3-0001"
  topic_id: string; // "MAT-P3-004"
  level: number; // 1–6
  subject: 'math' | 'english' | 'science' | 'chinese';
  question_type: 'multiple_choice' | 'fill_in_blank' | 'short_answer' | 'structured' | 'open_ended';
  difficulty: 'easy' | 'medium' | 'hard';
  stem_en: string; // Question stem (EN)
  stem_zh: string; // Question stem (zh-Hans)
  options?: { label: string; text_en: string; text_zh: string }[];
  answer_en: string;
  answer_zh: string;
  explanation_en: string;
  explanation_zh: string;
  hints: { step: number; text_en: string; text_zh: string }[];
  tags: string[]; // e.g. ['psle-format', 'heuristic']
}
```

### 12.5 Content sourcing rules

| Source                                    | Status                     | Action                                              |
| ----------------------------------------- | -------------------------- | --------------------------------------------------- |
| MOE Syllabus PDFs                         | ✅ Public, Crown Copyright | Paraphrase topic structure, cite source             |
| PSLE TYS (SEAB)                           | ❌ Copyright               | Do not reproduce verbatim; can use structure/topics |
| Marshall Cavendish textbooks              | ❌ Copyright               | Forbidden — do not paste, do not closely paraphrase |
| 欢乐伙伴 textbooks                        | ❌ Copyright               | Forbidden — do not paste, do not closely paraphrase |
| School test papers (sgtestpaper.com etc.) | ⚠️ Grey area               | Do not reproduce in paid app                        |
| AI-generated content                      | ✅ Owned by AaaS           | Primary path; reviewed by ex-MOE teachers           |

---

## 13. Navigation / routing architecture

### 13.1 Router

expo-router (file-based routing, typed routes enabled).

### 13.2 Screen tree

```
(auth)/                    # Unauthenticated (pre-email)
  onboarding.tsx           # Privacy promise → PIN setup
  device-check.tsx         # Tier detection + model download
  trial-home.tsx           # Pre-auth kid home (free tier)

(app)/                     # Authenticated / post-setup
  (kid)/                   # Kid-facing screens (no PIN)
    index.tsx              # Home screen (camera tile, chat, worksheets)
    camera.tsx             # Camera UI + capture flow
    solve.tsx              # Photo solve result + chat follow-up
    chat.tsx               # Quick chat (standalone, no photo)
    worksheets/
      index.tsx            # Worksheet browser
      [topicId].tsx        # Worksheet viewer + stylus input
      result.tsx           # Marked worksheet review
    subjects/
      [subject].tsx        # Subject-specific home
    settings.tsx           # Kid settings (language, avatar)

  (parent)/                # Parent-facing (PIN-gated)
    _layout.tsx            # PIN gate wrapper
    index.tsx              # Parent dashboard
    sessions/
      [sessionId].tsx      # Session detail view
    reports/
      weekly.tsx           # Weekly report
    children/
      index.tsx            # Manage child profiles
      add.tsx              # Add child profile
    settings.tsx           # Parent settings (telemetry opt-in, subscription)
    subscription.tsx       # Subscription management
```

### 13.3 Navigation state machine

```
App launch
  ├── First launch → Onboarding → Device check → Model download → Kid home (trial)
  │     └── After first session: prompt email auth → Kid home
  └── Returning user → Kid home (free/paid per entitlement)
        └── Tap lock/parent tab → PIN gate → Parent dashboard
```

---

## 14. Parent dashboard subsystem

### 14.1 Boundary

|             | Child UI                 | Parent Dashboard                                  |
| ----------- | ------------------------ | ------------------------------------------------- |
| Access      | Always available         | PIN-protected (4-digit)                           |
| Content     | Camera, chat, worksheets | Session logs, progress summaries, flagging        |
| Data source | Live LLM interactions    | SQLite sessions table (read-only)                 |
| Network     | None required            | Sync queued locally; POST to Supabase when online |

### 14.2 Session log

Every kid session produces:

1. A `sessions` row with aggregate stats (subject, topic, duration, questions attempted, struggle indicators)
2. Multiple `session_events` rows with detailed interaction log
3. An AI-generated summary (on-device LLM) — stored in both EN and zh-Hans

### 14.3 What parents see

- Daily / weekly view of every kid session
- Per session: subject, topic, time spent, questions attempted, where kid struggled, how AI helped
- All summaries generated on-device from session events
- Parent can flag a session ("this looks wrong, kid was confused") → feeds question-bank improvement loop
- Flag sets `parent_flagged=1` on the session row

### 14.4 Privacy promise (hard rule)

**Photos and OCR text never leave the device, even to our servers.** Only anonymized usage telemetry leaves — and only after parent opts in via the Parent Dashboard settings toggle (default: OFF).

---

## 15. Security boundaries

### 15.1 Child data isolation

| Data                      | Storage                                               | Leaves device?                 | Notes                     |
| ------------------------- | ----------------------------------------------------- | ------------------------------ | ------------------------- |
| Photos (homework)         | In-memory only                                        | Never                          | Cleared after session     |
| OCR text                  | In-memory + session_events                            | Never                          | Cleared when session ends |
| Kid free-text chat        | SQLite session_events                                 | Never                          | —                         |
| Session summaries         | SQLite sessions.ai*summary*\*                         | Only if parent opts in to sync | —                         |
| Anonymized usage counters | SQLite usage_counters                                 | Opt-in telemetry only          | Aggregated, no raw text   |
| Kid profile (name, level) | SQLite profiles                                       | Never                          | —                         |
| Parent email / auth token | Keychain (iOS) / EncryptedSharedPreferences (Android) | Supabase auth only             | —                         |
| Mistake bank              | SQLite mistake_bank                                   | Only if parent opts in         | —                         |

### 15.2 Model integrity

- All model files hosted on Cloudflare R2 with SHA-256 manifests
- App verifies integrity hash before loading any model into inference engine
- Hash verification uses `expo-crypto` → SHA-256
- Failed verification → delete file, retry download once, then error

### 15.3 Purchase security

- All purchases require parent gate (birth-year challenge, age ≥ 18)
- Entitlement cross-checked against Supabase on every app foreground
- Device-side purchase alone is not trusted for entitlement decisions

### 15.4 Analytics constraint

**No third-party analytics SDKs in child-facing code paths.** This is a hard architectural boundary:

- Any code in a `(kid)/` screen must not import or transitively depend on an analytics library
- Parent dashboard analytics (if any) are isolated to web companion
- On-device anonymized usage counters feed the parent report but never leave the device without explicit parent opt-in

### 15.5 Kid-safe development rules

- No behavioral-ad SDKs (AdMob, Facebook Audience Network, etc.)
- No fingerprinting libraries
- No third-party crash reporters that capture screen content (use Expo's built-in error boundary)
- No remote config that could inject un-reviewed code paths

---

## 16. Cross-cutting concerns

### 16.1 Offline resilience

| Feature               | Works offline? | Notes                                      |
| --------------------- | -------------- | ------------------------------------------ |
| Photo solve           | ✅             | Full pipeline on-device                    |
| Chat follow-up        | ✅             | Local inference only                       |
| Worksheet practice    | ✅             | Generated + marked on-device               |
| Mistake bank review   | ✅             | Local SQLite                               |
| Parent report viewing | ✅             | Generated + stored locally                 |
| Model download        | ❌             | First launch only                          |
| IAP purchase          | ❌             | Requires Apple/Google servers              |
| Parent report sync    | ⚠️ Queued      | Syncs when online                          |
| Entitlement check     | ⚠️ Cache       | Uses 5-min cached entitlement when offline |
| Auth (first email)    | ❌             | Requires Supabase                          |

### 16.2 Performance budget

| Constraint                            | Target       | Enforcement                          |
| ------------------------------------- | ------------ | ------------------------------------ |
| App package size                      | < 50 MB      | CI check on eas build                |
| Cold start (to UI render)             | < 3 sec      | Manual benchmark on mid-tier Android |
| Camera preview fps                    | ≥ 30 fps     | Manual test                          |
| LLM inference (on JSI/worklet thread) | Non-blocking | Code review — never on JS thread     |
| Database writes during inference      | Batched      | Single transaction per session end   |

### 16.3 Error handling strategy

```
Error boundaries
├── Screen-level: React Error Boundary per screen → fallback UI + "Something went wrong" / "出了点问题"
├── LLM inference failure: Retry once → if fail again, "The tutor needs a moment. Try again?" / "导师需要休息一下，再试一次？"
├── OCR failure: Graceful degradation (§6.3–6.5) — never a hard block
├── Network failure: Offline-resilient design (§16.1) — only model download + IAP + auth need network
├── Database failure: SQLite is ACID; on corruption, vacuum + reindex; if unrecoverable, prompt reinstall
└── Fatal error: "Please restart the app" / "请重启应用" — only for unrecoverable native crashes
```

### 16.4 Accessibility

- Min body font size: 16pt (kid-friendly)
- High contrast (WCAG AA for text, at minimum 4.5:1 contrast ratio)
- All icons paired with labels (no icon-only interactive elements)
- VoiceOver (iOS) / TalkBack (Android) labels on all interactive elements
- Touch targets: min 44×44pt

### 16.5 Testing architecture

| Level         | Tool                         | Scope                                                          |
| ------------- | ---------------------------- | -------------------------------------------------------------- |
| Unit          | Jest + ts-jest               | Shared types, routing logic, feature gates, i18n key coverage  |
| Component     | React Native Testing Library | Screen components, hooks, i18n rendering                       |
| Integration   | Manual + Jest integration    | Full flows: OCR pipeline mock → LLM response → session save    |
| E2E smoke     | Maestro                      | Onboarding → model download (mock) → photo solve → session log |
| Native module | Platform-specific tests      | Device tier detection, OCR confidence, model load              |
| Performance   | Manual + device matrix       | Cold start, inference latency, camera fps                      |

---

## 17. Content pipeline (offline, Mac Studio)

This is the corpus generation pipeline, run offline on a Mac Studio — NOT part of the mobile app:

```
1. Gemma 4 E4B on Ollama (Mac Studio)
   ├── Input: topic node from taxonomy.json
   ├── Output: 10–20 candidate questions per topic node
   └── Prompt: "Generate a {question_type} question for P{level} {subject} on {topic_name_en}. Include hint chain (3 hints), correct answer, and full explanation. Output in bilingual (EN + zh-Hans)."

2. Structure validation (automated)
   ├── Zod schema validation against question-bank-schema.json
   ├── Duplicate detection via sqlite-vec cosine similarity
   └── Flag low-diversity batches (same question type repeated)

3. Human review (ex-MOE teachers)
   ├── Pedagogical accuracy
   ├── Difficulty calibration
   ├── Cultural localization (Singapore examples, not American)
   └── Correctness of answer + explanation

4. Pack → corpus SQLite file → shipped in app bundle
```

---

## 18. Implementation order

| Phase | Subsystem                                      | Parallel track    | Owner          |
| ----- | ---------------------------------------------- | ----------------- | -------------- |
| 1     | Device tier detection + model downloader       | —                 | Wolf           |
| 2     | Model routing + inference engine integration   | —                 | Bee            |
| 3     | OCR pipeline (Vision/MLKit → Gemma)            | —                 | Bee            |
| 4     | Freemium gating + entitlement system           | Parallel with 1–3 | Wolf           |
| 5     | Database schema + data layer                   | Parallel with 1–3 | Wolf           |
| 6     | i18n layer + phrase keys                       | Parallel with 1–3 | Sage           |
| 7     | Navigation skeleton + screen stubs             | After 1           | Flutter        |
| 8     | Auth + parent onboarding flow                  | After 1           | Bee            |
| 9     | Camera UI + photo solve flow end-to-end        | After 2, 3        | Wolf + Bee     |
| 10    | IAP integration (StoreKit 2 + Play Billing v6) | After 4           | Bee            |
| 11    | OCR fallback UI (manual input)                 | After 3           | Flutter        |
| 12    | Parent dashboard                               | After 5, 9        | Flutter + Bee  |
| 13    | Content corpus generation (offline)            | Parallel with 1–9 | Sage           |
| 14    | Worksheet generation + stylus                  | After 2, 9        | Wolf + Flutter |
| 15    | E2E integration testing on device matrix       | After 9–14        | Parrot         |

---

## 19. Open risks

| Risk                                                                                          | Severity | Mitigation                                                                                          | Owner  |
| --------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- | ------ |
| Gemma E4B latency > 15s on mid-tier Android                                                   | High     | Fallback to E2B with simplified response; benchmark on real devices before finalizing               | Wolf   |
| Chinese OCR accuracy insufficient for P1–P4 stroke-level precision                            | High     | Benchmark before marketing Chinese as core; caveat as beta if needed                                | Bee    |
| `react-native-executorch` is canary-stage — breaking changes or missing Gemma version support | Medium   | Fallback: raw native modules via JSI if library proves unstable                                     | Wolf   |
| Apple App Store rejection (Guideline 1.3 — AI + minors)                                       | Medium   | Education category + parent-managed accounts; submit early, iterate                                 | Foxy   |
| Model download failure on slow/unreliable connections                                         | Medium   | Resume support, Wi-Fi recommendation, retry logic                                                   | Wolf   |
| IAP refund rate elevated (kids' app risk)                                                     | Low      | Parent gate for purchase; StoreKit 2 server-side validation defer to v2                             | Bee    |
| Content corpus generation throughput insufficient (200+ questions/subject/level)              | Medium   | Start corpus generation early (parallel with phases 1–3); plan for ex-MOE teacher review bottleneck | Sage   |
| No device matrix data before shipping                                                         | Medium   | Crowdsource via TestFlight + Play Console internal testing; no device-buying spree                  | Parrot |

---

## 20. Cross-references

- **Product spec:** [wiki ADD](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md)
- **Locked decisions:** [wiki decisions-locked](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fdecisions-locked.md)
- **DeepTutor architecture lift:** [wiki article 04](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farticles%2F04-deeptutor-architecture-lift.md)
- **Framework decision:** [wiki article 12](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farticles%2F12-framework-decision.md)
- **Chinese MT dev spec:** [wiki article 11](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farticles%2F11-chinese-mt-dev-spec.md)
- **Onboarding dev spec:** [wiki article 12-first-90s](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farticles%2F12-first-90s-onboarding-dev-spec.md)
- **Store submission playbook:** [wiki article 13](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farticles%2F13-store-submission-playbook-dev-spec.md)
- **Content sourcing strategy:** [wiki article 03](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farticles%2F03-content-sourcing-strategy.md)
- **Source architecture memo:** [wiki architecture.md](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farchitecture.md)
- **Paperclip company:** AaaS (`a0b206eb-3265-4b08-8bd4-d21b9c52c827`)
