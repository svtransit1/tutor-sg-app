# Review: AAAS-165 — Parent Profile & Kid Management Screen

**Reviewer**: Flutter
**Status**: Ready for review
**Branch**: `feat/aaas-165-parent-kid-management`
**Commit**: 78f692f
**Date**: 2026-05-07

## Changes

7 files added on top of `main`:

| File | Description |
|------|-------------|
| `mobile/app/(onboarding)/_layout.tsx` | Registers `parent-kid-management` route in onboarding stack |
| `mobile/app/(onboarding)/parent-kid-management.tsx` | Expo Router route file |
| `mobile/src/screens/onboarding/ParentKidManagementScreen.tsx` | Main screen (960 lines) |
| `mobile/src/screens/onboarding/__tests__/ParentKidManagementScreen.test.tsx` | 18 unit tests |
| `mobile/src/storage/parent-profile.ts` | MMKV-backed parent profile + child profiles |
| `mobile/src/i18n/locales/en.json` | EN i18n keys under `onboarding.parentKidManagement.*` |
| `mobile/src/i18n/locales/zh-Hans.json` | zh-Hans i18n keys under `onboarding.parentKidManagement.*` |

## Screen Layout

Two sections in a `ScrollView`:
1. **Parent Profile**: display name `TextInput`, app language toggle (EN / 中文)
2. **Children**: list of child cards, "Add child" button → inline form

Each **child card** shows: name, grade badge (P1-P6), language indicator (EN/中文), Edit/Remove buttons.

**Inline form** (shown when adding/editing): name `TextInput`, grade `Pressable` chips (P1-P6 row), language toggle (EN/中文), Save/Cancel buttons.

**Continue button** at bottom with validation:
- Requires parent name
- Requires ≥1 child
- Shows inline error messages
- Saves to MMKV and calls `onComplete()`

## Acceptance Criteria Covered

- ✅ Add 1–4 child profiles with name + grade + language
- ✅ Edit child (pre-fills form, updates on save)
- ✅ Remove child (confirmation alert via `Alert.alert`)
- ✅ Validation: at least 1 child required before Continue enables
- ✅ EN + zh-Hans strings for all labels, buttons, validation messages
- ✅ VoiceOver/TalkBack labels on all interactive elements

## Test Results

**18 tests passing:**

- Renders parent profile section with name input and language toggle
- Renders children section and Add child button
- Renders Continue button via accessibility label
- Shows inline add-child form when Add child is tapped
- Adds a child with valid name, grade, and language
- Shows validation errors when adding child with empty name
- Cancels the add form
- Persists children via storage when adding
- Opens edit form pre-filled with existing child data
- Updates child data on edit save
- Shows confirmation alert when remove is tapped
- Shows validation error when Continue tapped without children
- Shows validation error when Continue tapped without parent name
- Calls onComplete when Continue tapped with valid data
- Disables add button when 4 children exist
- Has accessibility labels on language toggle buttons
- Has accessibility labels on child card
- Has accessibility labels on Continue button

**Coverage**: 88.09% statements, 80.18% branches, 80.95% functions, 90.67% lines

## Next Reviewer

Owl for architecture review, then Foxy for PM sign-off.
