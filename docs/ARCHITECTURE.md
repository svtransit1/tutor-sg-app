# tutor-sg — Architecture v1.0

> **Status:** v1.0 — locked 2026-05-07. This is the definitive implementation reference.
>
> **Authoritative product spec:** [wiki ADD](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md) (Obsidian source of truth)
>
> **Locked decisions:** [wiki decisions-locked](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fdecisions-locked.md)
>
> **Originating memo:** [wiki architecture.md](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farchitecture.md)
>
> **Derived from:** Owl's architecture memo, ADD §3, ADD §7, and the DeepTutor architecture lift ([wiki article 04](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farticles%2F04-deeptutor-architecture-lift.md))

---

## 1. System topology

```
┌──────────────────────────────────────────────────────────────┐
│                         Mobile App                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ Camera / │  │  LLM     │  │ Parent   │  │  Practice   │  │
│  │ OCR      │  │  Runtime │  │ Dashboard│  │  Worksheets │  │
│  └────┬─────┘  └────┬─────┘  │(PIN-gated)│  │  + Stylus   │  │
│       │             │        └─────┬─────┘  └──────┬──────┘  │
│  ┌────┴─────────────┴──────────────┴───────────────┴──────┐  │
│  │                    SQLite + sqlite-vec                  │  │
│  │  (sessions, profiles, syllabus RAG, mistake bank,       │  │
│  │   usage counters, settings, model downloads,            │  │
│  │   i18n phrase cache, content corpus)                    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────┘
                           │  opt-in only, anonymized
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                      Cloud (thin)                             │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────────────┐  │
│  │ Supabase │  │  HitPay  │  │ Cloudflare R2             │  │
│  │ • auth   │  │ • billing│  │ • model files (signed URLs)│  │
│  │ • sync   │  │ • webhook│  │ • integrity manifests     │  │
│  │ • webhook│  │ • Apple  │  │ • syllabus PDFs (public)  │  │
│  │          │  │   Pay,   │  └───────────────────────────┘  │
│  │          │  │   Google │                                  │
│  │          │  │   Pay,   │                                  │
│  │          │  │   PayNow │                                  │
│  └──────────┘  └──────────┘                                  │
└──────────────────────────────────────────────────────────────┘
```

**Key principle:** All child data stays on-device. The cloud layer handles only auth, billing, and opt-in anonymized telemetry. No server-side LLM, no server-side OCR, no server-side child content.

---

## 2. Stack

| Layer | Choice | Rationale |
|---|---|---|
| App framework | React Native + Expo + TypeScript | Single codebase iOS + Android; Expo SDK 54; expo-router |
| Build service | Expo EAS | Managed build pipeline, code signing, OTA updates |
| On-device LLM (iOS) | ExecuTorch + Gemma 4 E2B/E4B | Via `react-native-executorch` (Software Mansion) |
| On-device LLM (Android) | LiteRT-LM + Gemma 4 E2B/E4B | Native module bridge; NNAPI delegate for GPU |
| Chinese MT LLM | Qwen 3.5 2B/4B | ExecuTorch (iOS) / LiteRT-LM (Android); Simplified Chinese only |
| Vision/OCR (iOS) | Apple Vision Framework | `VNRecognizeTextRequest` — EN + zh, handwriting (iOS 18+) |
| Vision/OCR (Android) | Google ML Kit Text Recognition v2 | Latin + Chinese, on-device only, cloud-off |
| On-device DB | SQLite + sqlite-vec | `expo-sqlite`; `sqlite-vec` for embedding search |
| KV store | react-native-mmkv | Settings, cached entitlements, non-sensitive config |
| Backend | Supabase | Auth (magic link, OAuth), billing webhooks, parent sync |
| Payments | HitPay | SG-native; Apple Pay, Google Pay, PayNow |
| IAP SDK | Apple StoreKit 2, Google Play Billing v6 | Bridged via native modules |
| CDN | Cloudflare R2 | Model files, integrity manifests, public syllabus PDFs |
| i18n | Flat phrase-keyed JSON | `keySeparator: false`, EN + zh-Hans-SG; ICU MessageFormat |
| Testing | Jest (unit), RNTL (component), Maestro (E2E) | Per-package vitest for pure-logic packages |
| CI | GitHub Actions | Build both platforms, test, lint, format, type-check |
| Package manager | pnpm | Workspaces monorepo |

---

## 3. Monorepo structure

```
tutor-sg-app/
├── mobile/                    # Expo React Native app
│   ├── app/                   # expo-router file-based routes
│   ├── src/
│   │   ├── components/        # Shared UI components
│   │   ├── screens/           # Screen-level components
│   │   ├── storage/           # SQLite + MMKV access layer
│   │   └── __tests__/
│   ├── .maestro/              # Maestro E2E flows
│   └── package.json
├── packages/
│   ├── shared/                # Types, schemas, model registry, feature gates
│   ├── device-tier/           # RAM + NPU detection, tier assignment
│   ├── llm/                   # Model routing, inference engine adapters
│   ├── features/              # Capability manifests (DeepTutor lift)
│   ├── i18n/                  # Phrase keys, language resolver
│   ├── theme/                 # Design tokens, colors, typography
│   └── perf/                  # Performance monitoring, budget enforcement
├── schema/                    # JSON schemas (question bank, taxonomy)
├── data/                      # Seed data (question bank, taxonomy tree)
├── scripts/                   # Model hashing, data generation, CI helpers
├── syllabus-pdfs/             # Public MOE syllabus source PDFs
├── docs/                      # Architecture, decisions, reviews, research
│   ├── ARCHITECTURE.md        # This file
│   ├── decisions/             # Durable architecture decisions
│   ├── reviews/               # Review records
│   ├── research/              # Investigations, comparisons
│   └── lessons/               # Postmortems, gotchas
├── .github/                   # CI workflows
├── tsconfig.base.json
├── pnpm-workspace.yaml
└── package.json
```

**Dependency graph (simplified):**
```
mobile ──→ @tutor-sg/shared ──→ @tutor-sg/device-tier
         │                    └─→ @tutor-sg/features
         ├─→ @tutor-sg/llm ─────→ @tutor-sg/device-tier
         ├─→ @tutor-sg/i18n
         ├─→ @tutor-sg/theme
         └─→ @tutor-sg/perf
```

All packages use `workspace:*` protocol. `mobile` is the only deployable artifact.

---

## 4. On-device LLM runtime

### 4.1 Model inventory

| Model ID | Size (on disk) | RAM needed | Use | Engine (iOS) | Engine (Android) |
|---|---|---|---|---|---|
| `gemma-e4b` | ~2.5 GB | ~3.5 GB | English/Math/Science — high tier | ExecuTorch `.pte` | LiteRT-LM `.lrt` |
| `gemma-e2b` | ~1.3 GB | ~2.0 GB | English/Math/Science — mid tier | ExecuTorch `.pte` | LiteRT-LM `.lrt` |
| `qwen-4b` | ~2.4 GB | ~3.5 GB | Chinese MT — high tier | ExecuTorch `.pte` | LiteRT-LM `.lrt` |
| `qwen-2b` | ~1.2 GB | ~2.0 GB | Chinese MT — mid tier | ExecuTorch `.pte` | LiteRT-LM `.lrt` |

All models use INT4 quantization.

### 4.2 Model routing

```
Subject requested
├── Chinese Mother Tongue → Qwen 3.5 (4B if high-tier, 2B if mid-tier)
└── English / Math / Science → Gemma 4 (E4B if high-tier, E2B if mid-tier)
```

Routing config — single source of truth, swappable entries:

```ts
// @tutor-sg/llm/src/router.ts
type ModelId = "gemma-e4b" | "gemma-e2b" | "qwen-4b" | "qwen-2b";

interface ModelRoutingTable {
  [subject: string]: { high: ModelId; mid: ModelId; };
}

const MODEL_ROUTING: ModelRoutingTable = {
  english:    { high: "gemma-e4b", mid: "gemma-e2b" },
  math:       { high: "gemma-e4b", mid: "gemma-e2b" },
  science:    { high: "gemma-e4b", mid: "gemma-e2b" },
  chinese_mt: { high: "qwen-4b",    mid: "qwen-2b" },
};

function resolveModel(subject: string, tier: DeviceTier): ModelId {
  const entry = MODEL_ROUTING[subject];
  if (!entry) return "gemma-e2b"; // safe default
  return tier === "high" ? entry.high : entry.mid;
}
```

### 4.3 Capability manifests (DeepTutor Pattern 1)

Each app feature is a `CapabilityManifest`:

```ts
// @tutor-sg/features/src/manifest.ts
type CapabilityManifest = {
  name: string;
  title: { en: string; zh: string };
  stages: string[];        // progress-dot labels
  tools: string[];         // function-call whitelist
  modelTier: "E2B" | "E4B";
  minimumEntitlement: "free" | "trial" | "paid";
};

const CAPABILITIES: CapabilityManifest[] = [
  {
    name: "photo_solve",
    title: { en: "Snap and Solve", zh: "拍照解题" },
    stages: ["Recognise", "Think", "Answer"],
    tools: ["read_question", "decompose_steps", "write_solution"],
    modelTier: "E4B",
    minimumEntitlement: "free",
  },
  {
    name: "quick_chat",
    title: { en: "Ask a Question", zh: "提问" },
    stages: ["Answer"],
    tools: ["quick_answer"],
    modelTier: "E2B",
    minimumEntitlement: "free",
  },
  {
    name: "chinese_stroke_check",
    title: { en: "Stroke Check", zh: "笔画检查" },
    stages: ["Recognise", "Compare", "Correct"],
    tools: ["ocr_chinese", "stroke_compare", "stroke_feedback"],
    modelTier: "E4B",
    minimumEntitlement: "trial",
  },
  {
    name: "practice_worksheet",
    title: { en: "Practice Worksheet", zh: "练习题" },
    stages: ["Generate", "Attempt", "Mark"],
    tools: ["generate_worksheet", "evaluate_answer", "explain_mistake"],
    modelTier: "E2B",
    minimumEntitlement: "free",
  },
  {
    name: "study_programme",
    title: { en: "PSLE Study Programme", zh: "PSLE 学习计划" },
    stages: ["Assess", "Plan", "Practice", "Review"],
    tools: ["diagnose_level", "generate_plan", "generate_practice", "review_progress"],
    modelTier: "E4B",
    minimumEntitlement: "paid",
  },
];
```

If the device is mid-tier but the capability demands E4B, the router downgrades to E2B and the capability adapts (shorter response, fewer reasoning steps). The user is not shown the downgrade.

### 4.4 Device tier detection

Run once at first launch, persisted in `settings` table.

| Tier | RAM | NPU | Models |
|---|---|---|---|
| `high` | ≥ 6 GB | Modern NPU (A14+ / SD8Gen1+ / Dimensity 9000+) | E4B / Qwen 4B |
| `mid` | 3–5 GB | Any | E2B / Qwen 2B |
| `unsupported` | < 3 GB | — | None (blocked) |

**iOS:** `NSProcessInfo.processInfo.physicalMemory` via native module.
**Android:** `/proc/meminfo` + `ActivityManager.MemoryInfo` via native module.

```ts
// @tutor-sg/device-tier/src/types.ts
type DeviceTier = "high" | "mid" | "unsupported";

interface NativeDeviceInfo {
  totalRAM: number;
  chipset: string;
  npuAvailable: boolean;
}

const TIER_THRESHOLDS = {
  HIGH_RAM_GB: 6,
  MID_RAM_GB: 4,
  FLOOR_RAM_GB: 3,
} as const;

const HIGH_TIER_CHIPSETS = [
  "A14", "A15", "A16", "A17", "A18",
  "SDM8 Gen1", "SDM8 Gen2", "SDM8 Gen3",
  "Tensor G2", "Tensor G3", "Tensor G4",
] as const;

function assignTier(info: NativeDeviceInfo): { tier: DeviceTier; belowFloor: boolean } {
  if (info.totalRAM < TIER_THRESHOLDS.FLOOR_RAM_GB) {
    return { tier: "unsupported", belowFloor: true };
  }
  const isHighTier = info.totalRAM >= TIER_THRESHOLDS.HIGH_RAM_GB
    && info.npuAvailable
    && HIGH_TIER_CHIPSETS.some(c => info.chipset.includes(c));
  return isHighTier
    ? { tier: "high", belowFloor: false }
    : { tier: "mid", belowFloor: false };
}
```

**Unsupported device:** "This device doesn't have enough memory to run the tutor. tutor-sg needs at least 3 GB of RAM." / "此设备内存不足，tutor-sg 至少需要 3 GB 内存。"

### 4.5 First-launch model downloader

#### CDN layout
```
https://models.tutor-sg.com/
├── gemma/
│   ├── e4b/
│   │   ├── gemma-e4b-ios.pte
│   │   ├── gemma-e4b-android.lrt
│   │   └── manifest.json
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
└── index.json
```

#### Download flow
```
App launch (first time)
  → Loading screen: "Setting up your tutor..." / "正在设置你的导师..."
  → Device tier detection
  → Fetch index.json from CDN
  → Filter to platform + tier
  → For each file:
      → Check local manifest cache
      → If missing/version mismatch: download with Range-header resume
      → Verify sha256 against manifest.json
      → On pass: move to permanent storage ({App Support}/models/)
      → On fail: delete, retry once; if fail again → error screen
  → All files verified → load into inference engine
  → Transition to main UI
```

#### Resume support
HTTP Range requests. Progress tracked in SQLite `model_downloads` table. On restart, resumes from `downloaded_bytes`.

#### On-device storage
| Platform | Path |
|---|---|
| iOS | `{Application Support}/models/` (excluded from iCloud backup) |
| Android | `{Internal Storage}/Android/data/{package}/files/models/` |

Footprint: ~4.9 GB (high tier), ~2.5 GB (mid tier).

#### Error states
| Error | EN | zh-Hans |
|---|---|---|
| No network | "You need an internet connection to set up the tutor. Connect to Wi-Fi and try again." | "需要网络连接来设置导师，请连接 Wi-Fi 后重试。" |
| Insufficient storage | "Not enough storage space. Free up at least {required} and try again." | "存储空间不足，请释放至少 {required} 空间后重试。" |
| Integrity failed | "Download was interrupted. We'll try again." | "下载中断，正在重试。" |
| CDN unreachable | "Can't reach the download server. Check your connection and try again." | "无法连接到下载服务器，请检查网络后重试。" |
| All retries exhausted | "Something went wrong during setup. Please restart the app or contact support." | "设置过程中出现问题，请重启应用或联系支持。" |

### 4.6 Model version upgrades
1. New models download in background (non-blocking)
2. After verification, old model swapped atomically on next cold launch
3. Old files deleted after successful swap
4. Rollback on corruption: keep previous version until new passes inference smoke test

### 4.7 Inference engine interface

```ts
// @tutor-sg/llm/src/engine.ts
interface InferenceEngine {
  loadModel(modelId: ModelId): Promise<void>;
  unloadModel(modelId: ModelId): Promise<void>;
  generate(prompt: string, options?: GenerateOptions): Promise<GenerateResult>;
  isLoaded(modelId: ModelId): boolean;
}

interface GenerateOptions {
  maxTokens?: number;       // default: 512
  temperature?: number;     // default: 0.7
  topP?: number;
  jsonMode?: boolean;
}

interface GenerateResult {
  text: string;
  tokensUsed: number;
  durationMs: number;
  modelId: ModelId;
}
```

---

## 5. Vision / OCR pipeline (DeepTutor Pattern 4 — adapted)

### 5.1 Pipeline stages

| Stage | Implementation | Input | Output |
|---|---|---|---|
| 1. Capture | `expo-camera` + image picker | Camera frame / photo library | Image (max 12 MP) |
| 2. Preprocess | Core Image (iOS) / Bitmap (Android) | Raw image | Deskewed, contrast-enhanced, binarized |
| 3. OCR | Apple Vision / ML Kit | Preprocessed image | `RecognizedText[]` with bboxes + confidence |
| 4. Semantic | Gemma E4B/E2B (on-device) | OCR text + subject + level | `{ plan, steps, final }` JSON |
| 5. Response | Chat UI | Structured answer | Rendered markdown, bilingual toggle |

### 5.2 Stage 2 — Preprocessing

1. **Orientation correction:** EXIF rotation + detect dominant text orientation
2. **Perspective de-skew:** detect page edges → warp to rectangle
3. **Contrast enhancement:** adaptive histogram equalization
4. **Binarization:** Otsu threshold for clean text extraction

All preprocessing runs on platform-native image pipeline.

### 5.3 Stage 3 — OCR confidence scoring

```
For each detected text block:
  confidence ≥ 0.6 → ACCEPT
  0.3 ≤ confidence < 0.6 → LOW_CONFIDENCE (prompt manual input)
  confidence < 0.3 → UNREADABLE (discard, retake prompt)
```

If all blocks < 0.3: retake prompt. If some low confidence: partial fallback with manual input fields.

### 5.4 Stage 4 — Structured prompt

```ts
interface OcrResult {
  blocks: {
    text: string;
    confidence: number;
    source: "ocr" | "manual";
    bbox: { x: number; y: number; w: number; h: number };
  }[];
  subject: string;
  level: string; // "P1"–"P6"
}

// Gemma output (single-pass structured JSON):
interface SolveOutput {
  plan: string;
  steps: string[];
  final: string;
  topic: string; // MOE topic code
}
```

DeepTutor Planner verbal rule: *"Each step must be a verifiable sub-goal — describe WHAT, not HOW."*

### 5.5 OCR accuracy risk

OCR quality — not LLM quality — is the accuracy bottleneck. If Apple Vision / ML Kit misreads handwritten fractions or Chinese characters, downstream Gemma reasoning will be technically correct but visibly wrong.

**Mitigation:**
- Confidence scoring with partial fallback
- Manual input for low-confidence regions
- Display OCR output alongside AI solution for parent diagnosis
- Benchmark against real P1–P6 homework samples during M1 spike

---

## 6. IAP integration

### 6.1 Product catalog

| Product ID | Type | Price (SGD) | Platform |
|---|---|---|---|
| `family_monthly` | Auto-renewable subscription | S$79/month | Both |
| `family_annual` | Auto-renewable subscription | S$699/year | Both |
| `psle_sprint` | Non-renewing 6-month access | S$299 | Both |
| `psle_sprint_annual_upgrade` | Upgrade purchase | S$400 (prorated) | Both |

Pricing locked at S$79/month (family monthly). S$58/month is annual equivalent. All prices subject to Boss final pricing.

### 6.2 StoreKit 2 (iOS)

```
React Native (TS) → NativeModules.IAPManager → StoreKit 2 (Swift async)
```

- `Product.products(for:)` — fetch metadata
- `Product.purchase()` — initiate purchase
- `Transaction.currentEntitlements` — verify subscriptions
- `Transaction.updates` — listen for renewals/cancellations/refunds

### 6.3 Google Play Billing v6 (Android)

```
React Native (TS) → NativeModules.IAPManager → BillingClient (Kotlin)
```

- `BillingClient.queryProductDetails()`
- `BillingClient.launchBillingFlow()`
- `BillingClient.queryPurchasesAsync()`
- `PurchasesUpdatedListener`

### 6.4 Backend verification (HitPay → Supabase)

HitPay webhook → Supabase Edge Function:
1. Receive `subscription.created` / `renewed` / `cancelled` / `expired`
2. Validate webhook signature
3. Update entitlement in Supabase `profiles` table
4. App polls entitlement on launch/foreground

Device-side purchase alone is not trusted.

### 6.5 Entitlement state machine

```
NONE → trial_start() → TRIAL → trial_expire() → NONE
TRIAL → purchase() → ACTIVE → cancel() → GRACE_PERIOD → grace_expire() → EXPIRED
GRACE_PERIOD → payment_recovered() → ACTIVE
```

### 6.6 Parental gate for purchase

1. Before purchase UI: "Ask a parent to enter their birth year." / "请家长输入出生年份。"
2. Validate age ≥ 18
3. On failure: "A parent or guardian needs to complete this purchase." / "需要家长或监护人完成购买。"
4. Gate cached 5 minutes per session
5. Child never sees a price — only lock icon + "Ask a parent to unlock" / "请家长解锁"

---

## 7. Freemium gating

### 7.1 Tier definitions

| Feature | Free | Trial (7 days) | Paid |
|---|---|---|---|
| Photo solve | 3/day | Unlimited | Unlimited |
| Quick chat | 5/day | Unlimited | Unlimited |
| Practice worksheets | 3/day | Unlimited | Unlimited |
| Mistake bank | Last 5 | Full | Full |
| Parent report | ❌ | ✅ (weekly) | ✅ (daily + weekly) |
| Chinese stroke-order | ❌ | ✅ | ✅ |
| P5/P6 study programme | ❌ | ✅ | ✅ |
| Multi-child | 1 child | Up to 4 | Up to 4 |
| Sibling bridge | ❌ | ✅ | ✅ |
| Offline | ✅ | ✅ | ✅ |
| Ads | None | None | None |

### 7.2 Free tier rationale

- 3 photo-solves/day — experience core value, not enough to replace a tutor
- 5 quick chats/day — casual questions capped; homework help is the upsell
- Last 5 mistake-bank items — show the feature without making it useful for revision
- No parent report — parent cannot perceive value until trial/subscribe
- No Chinese stroke-order — highest-differentiation feature is gated
- No ads, no data collection — free tier is kid-safe; monetization = IAP conversion

### 7.3 Trial mechanics

- 7 calendar days, starts on first photo-solve (not app install)
- No credit card required
- Trial CTA after first photo-solve: "See how your child is doing — start your free week." / "查看你孩子的学习进度 — 开始免费试用。"
- Day-5 CTA: "Your free trial ends in 2 days. Keep unlimited access from S$58/month." / "免费试用还剩 2 天，每月 S$58 起继续无限使用。"
- Trial expiry: revert to free limits; "Resubscribe" button on every gated screen

### 7.4 Entitlement check

```
App foreground
  → Check cached entitlement (MMKV, 5 min TTL)
  → If expired → fetch from Supabase
  → If offline → use cached (last known state)
  → Match against feature gate table
  → Render UI with appropriate gates
```

```ts
// @tutor-sg/shared/src/schema/feature-gates.ts
const FEATURE_GATES: FeatureGate[] = [
  { feature: "photo_solve",           minimumTier: "free" },
  { feature: "photo_solve_unlimited", minimumTier: "trial" },
  { feature: "quick_chat",            minimumTier: "free" },
  { feature: "quick_chat_unlimited",  minimumTier: "trial" },
  { feature: "practice_worksheet",    minimumTier: "free" },
  { feature: "worksheet_unlimited",   minimumTier: "trial" },
  { feature: "mistake_bank_full",     minimumTier: "trial" },
  { feature: "parent_report",         minimumTier: "trial" },
  { feature: "chinese_stroke_check",  minimumTier: "trial" },
  { feature: "study_programme",       minimumTier: "paid" },
  { feature: "multi_child",           minimumTier: "trial" },
  { feature: "sibling_bridge",        minimumTier: "trial" },
];

function canAccess(feature: string, entitlement: Entitlement): boolean {
  const tierRank = { free: 0, trial: 1, paid: 2 };
  const gate = FEATURE_GATES.find(g => g.feature === feature);
  return gate ? tierRank[entitlement.tier] >= tierRank[gate.minimumTier] : false;
}
```

### 7.5 Usage counter (free tier)

```sql
CREATE TABLE usage_counters (
  feature TEXT NOT NULL,
  date TEXT NOT NULL,   -- 'YYYY-MM-DD' local time
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (feature, date)
);
```

Reset at midnight local time. On limit: "You've used your {count} free photo-solves today. Ask a parent to start a free trial." / "今天的 {count} 次免费解题已用完，请家长开启免费试用。"

---

## 8. Database schema (full SQLite DDL)

```sql
-- Parent account (local mirror of Supabase auth)
CREATE TABLE parent_account (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  auth_provider TEXT NOT NULL,  -- 'email' | 'google' | 'apple'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Child profiles (local only, no cloud auth)
CREATE TABLE child_profiles (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL REFERENCES parent_account(id),
  display_name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 6),
  avatar_seed TEXT,
  language_pref TEXT NOT NULL DEFAULT 'en' CHECK(language_pref IN ('en','zh')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_active INTEGER NOT NULL DEFAULT 1
);

-- Tutoring sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES child_profiles(id),
  subject TEXT NOT NULL CHECK(subject IN ('math','english','science','chinese_mt')),
  level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 6),
  capability TEXT NOT NULL,
  model_id TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at TEXT,
  duration_seconds INTEGER,
  num_exchanges INTEGER DEFAULT 0,
  num_ocr_blocks INTEGER DEFAULT 0,
  num_manual_inputs INTEGER DEFAULT 0,
  struggle_indicators TEXT,    -- JSON array
  parent_flagged INTEGER DEFAULT 0,
  ai_summary_en TEXT,
  ai_summary_zh TEXT
);

-- Individual exchanges within a session
CREATE TABLE session_exchanges (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  seq INTEGER NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user','assistant','system')),
  content_text TEXT,
  content_json TEXT,           -- structured AI response
  tokens_used INTEGER,
  latency_ms INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- OCR results (ephemeral, session-scoped)
CREATE TABLE ocr_results (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  block_index INTEGER NOT NULL,
  text TEXT,
  confidence REAL NOT NULL CHECK(confidence BETWEEN 0.0 AND 1.0),
  source TEXT NOT NULL CHECK(source IN ('ocr','manual')),
  bbox_x REAL, bbox_y REAL, bbox_w REAL, bbox_h REAL
);

-- Mistake bank
CREATE TABLE mistake_bank (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL REFERENCES child_profiles(id),
  session_id TEXT NOT NULL REFERENCES sessions(id),
  subject TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  question_text_en TEXT,
  question_text_zh TEXT,
  wrong_answer TEXT,
  correct_answer TEXT,
  mistake_type TEXT,           -- 'calculation' | 'concept' | 'careless' | 'language'
  reviewed INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Model downloads (resume support)
CREATE TABLE model_downloads (
  file_path TEXT PRIMARY KEY,
  version INTEGER NOT NULL,
  total_bytes INTEGER NOT NULL,
  downloaded_bytes INTEGER NOT NULL DEFAULT 0,
  sha256 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'downloading'
    CHECK(status IN ('downloading','verifying','complete','failed')),
  storage_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Settings KV store
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,         -- JSON-encoded
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Content corpus: topic taxonomy
CREATE TABLE content_topics (
  topic_id TEXT PRIMARY KEY,   -- e.g. 'MAT-P3-001'
  subject TEXT NOT NULL,
  level INTEGER NOT NULL,
  name_en TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  description_en TEXT,
  description_zh TEXT,
  learning_outcomes TEXT,      -- JSON array
  parent_topic_id TEXT REFERENCES content_topics(topic_id),
  moe_code TEXT                -- MOE syllabus code
);

-- Content corpus: embedded questions
CREATE TABLE content_questions (
  question_id TEXT PRIMARY KEY,   -- e.g. 'Q-MAT-P3-0001'
  topic_id TEXT NOT NULL REFERENCES content_topics(topic_id),
  question_type TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK(difficulty IN ('easy','medium','hard')),
  stem_en TEXT NOT NULL,
  stem_zh TEXT NOT NULL,
  options TEXT,                -- JSON for multiple_choice
  answer_en TEXT,
  answer_zh TEXT,
  explanation_en TEXT,
  explanation_zh TEXT,
  hints TEXT,                  -- JSON array of progressive hints
  tags TEXT                    -- JSON array
);

-- Content version tracking
CREATE TABLE content_version (
  corpus_version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now')),
  question_count INTEGER NOT NULL,
  topic_count INTEGER NOT NULL
);
```

### Storage tiers

| Store | Use | Examples |
|---|---|---|
| SQLite | Source of truth — sessions, profiles, content, usage | All tables above |
| MMKV | Fast cache — settings, entitlements, onboarding flags | `device_tier`, `language_pref`, `entitlement_cache` |
| Secure Store (Keychain/Keystore) | Secrets — auth tokens, PIN hash, IAP receipts | `supabase_token`, `parent_pin_hash` |
| Temp filesystem | Ephemeral — camera frames (deleted after session) | `/tmp/camera_capture.jpg` |

---

## 9. Data flow

### 9.1 Homework photo pipeline (end-to-end)

```
1. Kid taps Camera tile
2. expo-camera renders live preview (≥30 fps)
3. Kid captures photo → temp directory
4. Preprocessing: orientation, de-skew, contrast, binarize
5. Platform OCR:
   ├── iOS: VNRecognizeTextRequest (EN+zh, handwriting iOS 18+)
   └── Android: ML Kit Text Recognition v2 (Latin+Chinese, cloud-off)
6. Confidence scoring per block → accept / low-confidence / discard
7. If low-confidence blocks:
   ├── Show partial results + tappable input fields
   └── User types missing text → merged into OcrResult
8. Gemma semantic analysis (E4B or E2B):
   └── Output: { plan, steps, final } JSON
9. Response rendered in chat UI (plan → steps → answer)
10. Session auto-saved to SQLite
11. Photo deleted from temp storage (never persisted)
```

### 9.2 Parent log generation

```
Session end
  → Summarizer prompt to Gemma E2B
    → Input: last N session_exchanges
    → Output: { summary_en, summary_zh, struggle_indicators }
  → Written to sessions table
  → Parent Dashboard reads from sessions (read-only)
  → If sync enabled: POST anonymized summary to Supabase
```

### 9.3 Offline resilience

| Feature | Online required? | Fallback |
|---|---|---|
| Photo solve | No | Full offline |
| Quick chat | No | Full offline |
| Practice worksheets | No | Use cached content |
| Model download | Yes (first launch) | Block until online |
| IAP purchase | Yes | "Connect to internet" message |
| Parent report sync | No (deferred) | Queue locally, retry when online |
| Entitlement check | No (cached) | Cached 5 min; stale >24h → free tier |

---

## 10. Parent dashboard boundary

### 10.1 Separation

| | Child UI | Parent Dashboard |
|---|---|---|
| Access | Always available | PIN-protected (4-digit) |
| Content | Camera, chat, worksheets, mistake review | Session logs, progress, usage stats, flagging |
| Data source | Live LLM | SQLite sessions table (read-only) |
| Network | None | Sync queued locally → Supabase |
| Analytics | None | Opt-in anonymized telemetry only |

### 10.2 PIN gate

- 4-digit PIN set during onboarding
- Hash stored in Secure Store (Keychain/Keystore)
- 5 failed → 60s cooldown; 10 failed → "Too many attempts. Restart the app and try again." / "尝试次数过多，请重启应用后重试。"
- PIN never leaves device

### 10.3 Parent view

- **Daily digest:** sessions, total time, subjects, struggle count
- **Weekly report:** by subject, topic strengths/weaknesses, trends
- **Session detail:** AI summary, timestamps, struggle indicators
- **Flag flow:** "This looks wrong" → `parent_flagged=1` → feeds content improvement loop

### 10.4 Privacy boundary — hard rule

**Photos and OCR text never leave the device.** Telemetry is opt-in, default OFF, and scrubbed of all free-text, photo data, and device identifiers beyond anonymized model/chipset/tier.

---

## 11. Navigation architecture

### 11.1 Screen tree (expo-router)

```
Root
├── (onboarding)
│   ├── welcome              # Language select, "Get Started"
│   ├── parent-signup        # Supabase email/OAuth
│   ├── parent-verify        # Magic link callback
│   ├── kid-setup            # First child profile
│   ├── pin-setup            # 4-digit PIN
│   └── device-check         # Tier detection + model download
│
├── (kid)                     # Tab navigator
│   ├── home                  # Dashboard tiles
│   ├── camera                # Camera UI + capture
│   ├── solve                 # OCR → AI response chat
│   ├── chat                  # Text/voice quick-chat
│   ├── worksheets            # Practice sheets + stylus
│   └── subjects              # Topic browser
│
├── (parent)                  # PIN-gated stack
│   ├── pin-entry
│   ├── dashboard
│   ├── session-detail
│   ├── kid-management
│   ├── subscription
│   └── settings
│
├── (modals)
│   ├── paywall
│   ├── parent-gate           # Birth-year challenge
│   ├── manual-input          # OCR fallback
│   └── error-boundary
│
└── (unsupported)
    └── device-too-old
```

### 11.2 Navigation rules

- **(kid)** tabs: no PIN, freely navigable, camera is default
- **(parent)** stack: always behind PIN gate; validated once per 5-min session
- Parent → Kid transition: timeout or "Back to Kid mode" button
- Kid → Parent: requires PIN (no backdoor)
- Deep links: `tutor-sg://parent/dashboard` → app opens, prompts PIN

---

## 12. State management

### 12.1 Layers

| Layer | Mechanism | Scope | Persistence |
|---|---|---|---|
| UI ephemeral | `useState` / `useReducer` | Screen-local | None |
| Session | React Context + SQLite | Feature-scoped | SQLite `sessions` + `session_exchanges` |
| App global | Zustand store | App-wide | MMKV (cache) + SQLite (truth) |
| Entitlement | MMKV + Supabase | App-wide | MMKV (5-min TTL) |
| Content | SQLite `content_*` tables | App-wide | SQLite (embedded at build) |

### 12.2 Zustand store shape

```ts
interface AppStore {
  activeChildId: string | null;
  activeCapability: string | null;
  activeSessionId: string | null;
  language: "en" | "zh";
  isParentMode: boolean;
  pinValidatedAt: number | null;
  entitlement: Entitlement | null;
  deviceTier: DeviceTier | null;
  modelsLoaded: ModelId[];

  setActiveChild: (id: string) => void;
  startSession: (capability: string) => string;
  endSession: () => void;
  switchLanguage: (lang: "en" | "zh") => void;
  enterParentMode: () => void;
  exitParentMode: () => void;
  refreshEntitlement: () => Promise<void>;
}
```

---

## 13. i18n architecture (DeepTutor Pattern 3)

### 13.1 Design

Flat phrase-keyed JSON, `keySeparator: false`, EN + zh-Hans-SG only:

```json
{
  "photo_solve_title": {
    "en": "Snap and Solve",
    "zh": "拍照解题"
  },
  "free_limit_reached": {
    "en": "You've used your {count} free photo-solves today. Ask a parent to start a free trial.",
    "zh": "今天的 {count} 次免费解题已用完，请家长开启免费试用。"
  }
}
```

### 13.2 Key conventions

- Flat keys: `feature_action_state` (e.g., `photo_solve_button_submit`)
- ICU MessageFormat for interpolation
- zh-Hans-SG: Simplified Chinese with SG-localized terms (HDB → 组屋, MRT → 地铁)
- No RTL needed (EN + zh-Hans are LTR)

### 13.3 Translation workflow

1. All keys in `packages/i18n/src/phrases/en.json` (source of truth)
2. zh in `packages/i18n/src/phrases/zh.json`
3. CI validates every EN key has zh counterpart (`pnpm i18n:validate`)
4. Missing translations fail CI

### 13.4 Language resolution

1. Onboarding selection → stored in `settings`
2. Per-session: Chinese MT subject → Chinese UI automatically
3. Toggle in Kid and Parent UIs
4. Fallback: device locale (`expo-localization`) → EN

---

## 14. Content management / syllabus RAG

### 14.1 Content sourcing rules

| Source | Allowed? | Rule |
|---|---|---|
| MOE syllabus PDFs | ✅ Use freely | Crown Copyright; cite source |
| Past-year papers (TYS) | ⚠️ Structure only | Licensed; never verbatim |
| Marshall Cavendish textbooks | ❌ Forbidden | No paste, no close paraphrase |
| 欢乐伙伴 (Chinese) | ❌ Forbidden | No paste, no close paraphrase |
| sgtestpaper.com | ❌ Grey area | Do not republish |
| AI-generated | ✅ Preferred | Fresh questions aligned to syllabus |

### 14.2 Content corpus

Pre-embedded SQLite database:
- **Topic taxonomy:** P1–P6, all 4 subjects, ~500 topics, MOE-aligned
- **Seed question bank:** ~2,000 originally-authored questions (bilingual), with hint chains
- **Chinese stroke-order data:** P1–P4 character sequences (public datasets)

Generated offline (Mac Studio, Ollama + Gemma), reviewed ex-MOE teachers (v2), packed into `data/question-bank.json`, loaded into SQLite at build.

### 14.3 Topic taxonomy

```
Subject → Level → Strand → Topic → Sub-topic
Example: Math → P3 → Numbers & Algebra → Whole Numbers → Numbers up to 10,000
  topic_id: "MAT-P3-001"   moe_code: "M-P3-N-01"
```

### 14.4 On-device RAG

- **Keyword:** topic_id, subject, level, difficulty
- **Semantic:** `sqlite-vec` embeddings for similar question retrieval
- **Personalization:** prioritize topics from mistake bank
- All on-device; no cloud vector DB

---

## 15. Security boundaries

### 15.1 Child data isolation

| Data | Storage | Leaves device? |
|---|---|---|
| Photos (homework) | In-memory temp only | Never (deleted after session) |
| OCR text | SQLite `ocr_results` | Never |
| Kid chat text | SQLite `session_exchanges` | Never |
| AI responses | SQLite `session_exchanges` | Never |
| Session summaries | SQLite `sessions` | Opt-in sync (aggregate only) |
| Kid profile (name, level) | SQLite `child_profiles` | Never |
| Mistake bank | SQLite `mistake_bank` | Never |
| Parent email / auth | Secure Store | Supabase auth only |
| PIN hash | Secure Store | Never |

### 15.2 Model integrity

- Cloudflare R2 with SHA-256 manifests
- `packages/shared/src/models/integrity.json` — expected hashes
- Verify before loading; fail → retry once → error
- Dev/staging: all-zero placeholder hashes bypass verification

### 15.3 Purchase security

- Parent gate (birth-year ≥ 18) for all purchases
- Entitlement cross-checked against Supabase every foreground
- Device-side purchase not trusted alone

### 15.4 Analytics constraint — hard boundary

**No third-party analytics SDKs in child-facing code paths.** Enforced by:
- Package boundary: analytics only in `packages/perf/src/telemetry.ts`
- Build-time lint rule for kid-facing screens
- PR review checklist

### 15.5 Auth model

- **Parent:** Supabase Auth (email magic link, Google, Apple)
- **Kid:** local only, no login, row in `child_profiles` keyed by `parent_id`
- Multi-kid: independent sessions, mistake bank, preferences per profile

---

## 16. Error handling & resilience

### 16.1 Error boundary hierarchy

```
App
├── Root Error Boundary (full-screen fallback)
├── Feature Error Boundaries (per-capability)
│   ├── Photo Solve: OCR failure → fallback UI
│   ├── Chat: timeout → "Taking longer than usual..."
│   └── Worksheets: generation failure → retry simpler prompt
└── Component Error Boundaries (isolate non-critical UI)
```

### 16.2 Graceful degradation

| Failure | Behavior |
|---|---|
| LLM timeout (>15s) | "This might take a moment..." — no cloud fallback |
| Model not loaded | "Tutor is waking up..." — block capability |
| OCR fully failed | "Type the question instead" / "直接输入题目" |
| Offline + entitlement expired | Treat as free tier |
| Storage full | Cleanup prompt before blocking |

### 16.3 Retry policy

| Operation | Max retries | Backoff | On exhaustion |
|---|---|---|---|
| Model download | 3 | 1s, 5s, 30s | Error screen |
| OCR | 1 (retake) | — | Manual input |
| LLM inference | 1 | — | "Try rephrasing" |
| Supabase fetch | 3 | 1s, 5s, 15s | Use cached |
| IAP purchase | 0 | — | Platform error |

---

## 17. Testing architecture

### 17.1 Test pyramid

```
         ┌──────────────┐
         │   E2E (2–5)  │  ← Maestro: onboarding → photo-solve → parent log
         ├──────────────┤
         │ Integration  │  ← RNTL + mock SQLite: full feature flows
         │   (20–40)    │
         ├──────────────┤
         │  Unit (200+) │  ← Jest/vitest: pure-logic packages, components
         └──────────────┘
```

### 17.2 Test layers

| Layer | Tool | Scope |
|---|---|---|
| Package unit | vitest | `@tutor-sg/*` pure logic, types, routing |
| Component | RNTL | UI components, screen renders |
| Integration | RNTL + mock SQLite | Full feature flows |
| E2E smoke | Maestro | App launch, navigation, key flows |
| E2E full | Maestro | Onboarding → solve → parent log |
| Content QA | Custom validator | Schema + bilingual + MOE alignment |
| Model smoke | Custom runner | Known-input → expected-output |

### 17.3 Quality bar (every PR)

1. `pnpm typecheck` — zero errors
2. `pnpm lint` — zero warnings
3. `pnpm test` — all pass
4. At least one Maestro flow for UI changes
5. Bilingual completeness (new strings: EN + zh)
6. Privacy import check (no analytics in kid code paths)

### 17.4 Device matrix (M7)

| Device | Platform | Tier | Scope |
|---|---|---|---|
| iPhone 15 Pro | iOS 17+ | high | Full E2E + perf |
| iPhone 12 | iOS 16+ | mid | Full E2E |
| iPad (9th gen) | iOS 16+ | mid | Camera + stylus |
| Samsung Galaxy S23 | Android 14+ | high | Full E2E + perf |
| Pixel 6a | Android 14+ | mid | Full E2E |
| Redmi Note 12 | Android 13+ | mid | Smoke + download |

---

## 18. Build, CI/CD & release

### 18.1 CI pipeline (GitHub Actions)

```
PR opened
  → pnpm install --frozen-lockfile
  → pnpm typecheck
  → pnpm lint
  → pnpm format:check
  → pnpm test
  → pnpm i18n:validate
  → Check: no analytics in kid code paths
  → Check: no restricted dependencies
  → pnpm build:mobile (Expo EAS — both platforms)
  → Maestro smoke test
  → ✅ → mergeable
```

### 18.2 Build service (Expo EAS)

- `eas build --platform ios` → TestFlight IPA
- `eas build --platform android` → Play Console AAB
- `eas update` → OTA JS bundle updates (non-native changes)
- Native module changes → full build

### 18.3 Release channels

| Channel | Audience | Trigger |
|---|---|---|
| `development` | Dev team (expo dev client) | Push to feat/* |
| `staging` | Internal testers (TestFlight Internal, Play Internal) | Push to main (manual) |
| `production` | Public (App Store, Play Store) | Tagged release (Foxy) |

### 18.4 Code signing

- **iOS:** App Store Connect API key in GitHub Secrets; EAS auto-signing
- **Android:** Upload keystore in GitHub Secrets; EAS managed

---

## 19. Performance budget & monitoring

### 19.1 Targets

| Metric | Target | Measurement |
|---|---|---|
| App package size | < 50 MB | `eas build` output |
| Cold start (mid-tier) | < 3 sec | `expo-splash-screen` hide timing |
| Camera preview | ≥ 30 fps | `react-native-worklets` frame callback |
| Photo-to-first-token (high) | P95 < 8 sec | Capture → first token timestamp |
| Photo-to-first-token (mid) | P95 < 15 sec | Same metric |
| LLM inference (E2B, 512 tok) | < 5 sec | Prompt → complete |
| LLM inference (E4B, 512 tok) | < 10 sec | Same metric |
| OCR processing | < 2 sec | Preprocessing → OCR result |
| UI thread blocked | 0 ms | LLM on separate thread |
| Model download (E4B, 10 Mbps) | ~35 min | Download progress |

### 19.2 Monitoring

- `@tutor-sg/perf` package: instrumentation hooks
- `performance.mark()` / `performance.measure()` timing
- Anonymized metrics → SQLite `perf_events` table
- Opt-in telemetry only

### 19.3 Non-blocking LLM guarantee

- **iOS:** ExecuTorch on background dispatch queue
- **Android:** LiteRT-LM on `WorkManager` thread
- Results posted back via bridge events
- UI shows spinner/skeleton, never freezes

---

## 20. Implementation order

| Phase | What | Owner | Parallel |
|---|---|---|---|
| M1 | RAM tier detection + model downloader | Wolf | — |
| M1 | Camera + OCR pipeline spike | Bee | Parallel with Wolf |
| M2 | Model routing + inference engine integration | Wolf | After M1 downloader |
| M2 | Onboarding flow + parent registration | Flutter + Bee | After M1 |
| M2 | First homework camera flow E2E | Wolf + Bee | After M1 OCR |
| M3 | Parent log v1 | Bee | After M2 sessions |
| M3 | Freemium gating + entitlement system | Wolf | Parallel with M2–M3 |
| M4 | Chinese MT subject support (Qwen) | Wolf + Sage | After M2 routing |
| M4 | IAP integration (StoreKit 2 + Play Billing) | Bee | After M3 entitlement |
| M5 | Practice worksheets + stylus input | Wolf + Flutter | After M2 routing |
| M6 | HitPay webhook + backend verification | Bee | After M4 IAP |
| M7 | TestFlight beta + Play Internal | All | After all phases |
| M7 | Device matrix testing + perf benchmarks | Parrot | After M7 build |
| M8 | App Store + Play Store submission | Foxy | After M7 sign-off |

---

## 21. Open risks

| Risk | Severity | Mitigation | Owner |
|---|---|---|---|
| Gemma E4B latency > 15s mid-tier Android | High | E2B fallback; measure M1 spike | Wolf |
| Chinese OCR accuracy for stroke-level | High | Benchmark; caveat as beta | Bee |
| Apple rejection (AI + minors) | Medium | Education category; submit early | Foxy |
| Model download on slow connections | Medium | Resume support; Wi-Fi recommendation | Wolf |
| IAP refund rate (kids' app) | Low | Parent gate; StoreKit 2 validation | Bee |
| react-native-executorch maturity | Medium | Spike early; raw bridge fallback | Owl |
| LiteRT-LM NNAPI fragmentation | Medium | Test Samsung/Pixel/Xiaomi M1; CPU fallback | Wolf |
| Content corpus generation cost | Low | Local Mac Studio (Ollama); ex-MOE review | Sage |

---

## 22. Cross-references

- **Product spec (ADD):** [wiki](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fapp-design-document.md)
- **Locked decisions:** [wiki](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fdecisions-locked.md)
- **Project context:** [wiki](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Fcontext.md)
- **Originating architecture memo:** [wiki](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farchitecture.md)
- **DeepTutor architecture lift:** [wiki article 04](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farticles%2F04-deeptutor-architecture-lift.md)
- **Content sourcing strategy:** [wiki article 03](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farticles%2F03-content-sourcing-strategy.md)
- **Pricing & GTM:** [wiki article 07](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farticles%2F07-pricing-and-gtm.md)
- **Build readiness:** [wiki article 10](obsidian://open?vault=Mua's%20Vault&file=wiki%2Fprojects%2Ftutor-sg%2Farticles%2F10-build-readiness-checklist.md)
- **Issue tracker:** Paperclip company `AaaS` (`a0b206eb-3265-4b08-8bd4-d21b9c52c827`)
- **GitHub repo:** `aaas-pte-ltd/tutor-sg-app` (private until launch)

---

**This document is v1.0 — locked 2026-05-07. Architecture-touching PRs must be gated by Owl. Amendments require a `boss-needed` issue tagged `add-amendment`.**
