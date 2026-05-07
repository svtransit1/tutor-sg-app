# SQLite Schema — tutor-sg

> **Package:** `@tutor-sg/database` (v0.1.0)  
> **Current schema version:** 1  
> **Migration strategy:** Versioned DDL blocks, run on first `getDatabase()` call.

## Tables (8)

### `parent_account`
| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK, UUID v4 |
| `email` | TEXT | NOT NULL, UNIQUE |
| `auth_provider` | TEXT | CHECK (`email`/`google`/`apple`) |
| `auth_provider_id` | TEXT | NOT NULL |
| `created_at` / `updated_at` | TEXT | ISO 8601 |

### `kid_profile`
| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK, UUID v4 |
| `parent_account_id` | TEXT | FK → `parent_account(id)` CASCADE |
| `name` | TEXT | NOT NULL |
| `grade` | TEXT | CHECK (`P1`–`P6`) |
| `subjects` | TEXT | JSON array of Subject enums |
| `created_at` / `updated_at` | TEXT | ISO 8601 |

### `session_log`
| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK, UUID v4 |
| `kid_profile_id` | TEXT | FK → `kid_profile(id)` CASCADE |
| `subject` | TEXT | NULLABLE, CHECK |
| `topic` | TEXT | NULLABLE |
| `device_tier` | TEXT | CHECK (`high`/`low`/`below_floor`) |
| `started_at` / `ended_at` | TEXT | ISO 8601 |

### `session_event`
| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK, UUID v4 |
| `session_log_id` | TEXT | FK → `session_log(id)` CASCADE |
| `event_type` | TEXT | CHECK (8 types incl. `photo_captured`, `hint_shown`, etc.) |
| `timestamp` | TEXT | ISO 8601 |
| `payload` | TEXT | JSON blob |

### `question_attempt`
| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK, UUID v4 |
| `session_log_id` | TEXT | FK → `session_log(id)` CASCADE |
| `question_text` | TEXT | NOT NULL |
| `subject`, `topic` | TEXT | Subject CHECK + free-text topic |
| `answer` | TEXT | NULLABLE |
| `correct` | INTEGER | 0/1 or NULL |
| `hints_used` | INTEGER | DEFAULT 0 |
| `created_at` | TEXT | ISO 8601 |

### `syllabus_topic_tree`
| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK, UUID v4 |
| `subject`, `level` | TEXT | CHECK + CHECK (P1–P6) |
| `topic_id` | TEXT | Logical topic identifier |
| `parent_topic_id` | TEXT | NULLABLE self-ref FK |
| `name_en` / `name_zh` | TEXT | Bilingual names |
| `sequence` | INTEGER | Ordering within level |

### `model_metadata`
| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK, UUID v4 |
| `model_name`, `version`, `quant` | TEXT | Model identity |
| `file_path`, `hash` | TEXT | Local file ref + integrity |
| `downloaded_at` | TEXT | ISO 8601 |
| `size_bytes` | INTEGER | File size |

### `usage_counter`
| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK, UUID v4 |
| `kid_profile_id` | TEXT | FK → `kid_profile(id)` CASCADE |
| `date` | TEXT | YYYY-MM-DD |
| `photo_count` / `question_count` | INTEGER | DEFAULT 0 |

### Meta: `_schema_version`
| Column | Type |
|---|---|
| `version` | INTEGER |

## Indexes (7)

| Name | Columns |
|---|---|
| `idx_session_log_kid` | `kid_profile_id` |
| `idx_session_log_started` | `started_at` |
| `idx_session_event_log` | `session_log_id` |
| `idx_question_attempt_log` | `session_log_id` |
| `idx_syllabus_subject_level` | `(subject, level)` |
| `idx_syllabus_parent` | `parent_topic_id` |
| `idx_usage_kid_date` | `(kid_profile_id, date)` |

## Usage

```ts
import { getDatabase, SessionRepository } from '@tutor-sg/database'

const db = await getDatabase()
const sessions = new SessionRepository(db)
const log = await sessions.create(kidId, 'high', 'math')
await sessions.addEvent(log.id, 'photo_captured', { uri: 'file://photo.jpg' })
```

## Verification

- **41 tests** across 8 test files, all passing
- Covers: schema creation, constraint enforcement, CRUD for all 7 repositories
- Uses `sql.js` (pure JS SQLite) for in-memory test execution with real SQL constraint verification
