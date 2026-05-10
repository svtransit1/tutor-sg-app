# UI Handoff: Child Profile Switcher — Parent Dashboard

**Issue:** AAAS-1493 (M3-21)
**Date:** 2026-05-11
**Status:** in_review

## Component

`mobile/src/components/ProfileSwitcher.tsx`

### States

| State | Behavior |
|-------|----------|
| **Loading** | Shows "Loading profiles..." centered text in a bordered card. |
| **Empty** | Renders nothing (returns null). Parent dashboard with no profiles shows no switcher. |
| **Error** | Shows error message + "Retry" button that re-fetches profiles. |
| **Ready** | Shows the active child's avatar circle (first letter of name) + name + level. Chevron ▼ indicates expandable. |
| **Expanded** | Animated list of all profiles below the trigger. Each row: avatar + name + level. Active profile has a blue dot indicator. |
| **Expanded (single profile)** | If there's only one profile, component still shows trigger but dropdown is a single-item list with an active dot. |

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onProfileChange` | `(profile: KidProfile) => void` | No | Called when parent switches to a different child profile. |

### Dependencies

- `@/storage/kidProfiles` — `KidProfileRepository` for DB CRUD
- `react-i18next` — `useTranslation()` for bilingual strings
- `react-native` — `View`, `Text`, `Pressable`, `StyleSheet`, `ScrollView`, `useColorScheme`, `LayoutAnimation`

### i18n Keys

All under `parent.profileSwitcher.*`:
- `label` — "Child profile" / "切换孩子"
- `switchTo` — "Switch to {{name}}" / "切换到 {{name}}"
- `current` — "{{name}} - {{level}} - Active" / "{{name}} - {{level}} - 当前"
- `loading` — "Loading profiles..." / "正在加载孩子信息..."
- `empty` — "No child profiles found" / "还没有添加孩子"
- `error` — "Failed to load profiles" / "加载失败"

### Accessibility

- Trigger has `accessibilityRole="button"`, `accessibilityLabel` with current profile info, and `accessibilityHint` for expand action.
- Each dropdown item has `accessibilityRole="button"`, `accessibilityLabel`, and `accessibilityHint` for switch action.
- Avatar initials rendered as `Text` with no accessible label (decorative — name is already in adjacent text).
- Active dot (blue circle) is a `View` with no accessibility annotation (decorative).

### Visual Style

- Card container: 12px padding, 12px border radius, 1px border, 16px bottom margin.
- Label: 12px uppercase, 0.5 letter-spacing, muted color.
- Trigger: horizontal flex row, avatar 36px on left, name+level info, chevron on right.
- Dropdown items: 10px vertical padding, 8px horizontal padding, 8px radius. Active item gets subtle blue background tint.
- Avatar: colored circle (6 colors cycled by index), white initial letter.
- Dark mode: `useColorScheme()` for all colors. Active state uses `#2A2A2A` background in dark mode.

## Integration: Parent Dashboard

`mobile/app/(parent)/index.tsx` now renders `ProfileSwitcher` at the top of the content area. When a profile is selected, the dashboard card shows the child's name and level.

## Verification

- 8 tests covering all states (loading, empty, error, ready, expand, switch, setActive, onChange callback).
- All 215 tests in the suite pass.
- No new type errors.
- Branch: `feat/m3-profile-switcher`
