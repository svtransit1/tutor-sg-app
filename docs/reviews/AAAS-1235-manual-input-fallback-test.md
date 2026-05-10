# Review — AAAS-1235: M2 OCR fallback — UI rendering component test

## Summary

Created the `ManualInputFallback` component and comprehensive RNTL test suite for the OCR fallback manual input flow.

## Changes

| File | Action |
|------|--------|
| `mobile/src/components/ManualInputFallback.tsx` | **Create** — OCR fallback UI component |
| `mobile/src/components/__tests__/ManualInputFallback.test.tsx` | **Create** — 41 RNTL tests |
| `mobile/node_modules/expo-modules-core/src/polyfill/dangerous-internal.js` | **Monkey-patch** (test infra) — polyfill stub for jest-expo compatibility |

## Branch

`bee/aaas-1235-manual-input-fallback-test` (commit `HEAD` on the branch)

## Component: ManualInputFallback

Renders when OCR cannot read all homework items. Features:
- Per-item card with Type/Draw tab switching
- Text input (type mode) with `TextInput`
- Placeholder canvas area (draw mode) — actual stylus canvas TBD
- Skip, Clear, and action buttons per item
- Remaining count indicator
- Submit button (disabled until all items answered)
- Error states: `parseFailed`, `noInputs` with `accessibilityRole="alert"`
- Back button (via `onBack` prop)
- Dark mode support
- Full accessibility labels on all interactive elements

Props interface:

```ts
interface ManualInputFallbackProps {
  failedItems: number[];
  subject?: string;
  error?: 'parseFailed' | 'noInputs' | null;
  onSubjectChange?: (subject: string) => void;
  onSkipItem: (itemNumber: number) => void;
  onSubmit: (answers: Record<number, string>) => void;
  onDismissError?: () => void;
  onBack?: () => void;
}
```

## Tests: 41 passing

| Group | Tests | What's covered |
|-------|-------|----------------|
| basic render | 7 | Title, description, item cards, tabs, submit, action buttons |
| tab switching | 3 | Draw→Type switching, per-item independent tab state |
| text input | 3 | Single/multi-item input, onDismissError on type |
| clear | 2 | Clear single item, clear doesn't affect others |
| skip | 2 | Skip calls `onSkipItem` with correct itemNumber |
| submit | 4 | Submit enabled when all filled, disabled otherwise, trim check |
| remaining count | 2 | Shows/hides count based on fill state |
| error states | 4 | parseFailed, noInputs, null error, alert role |
| back button | 3 | Renders with onBack, hidden without, calls onBack |
| edge cases | 4 | Empty items, single item, non-sequential numbers, clear after fill |
| accessibility | 7 | Submit label+disabled state, skip/clear labels, tab selected state, typeInput/drawCanvas labels |

## Verification

```
# All 41 ManualInputFallback tests pass
RNTL_SKIP_DEPS_CHECK=true pnpm --filter tutor-sg-mobile exec jest \
  src/components/__tests__/ManualInputFallback.test.tsx --no-cache --verbose

# No type errors in new files
pnpm --filter tutor-sg-mobile exec tsc --noEmit 2>&1 | grep -i manualInput || echo "clean"

# All existing screens tests pass (no regression)
RNTL_SKIP_DEPS_CHECK=true pnpm --filter tutor-sg-mobile exec jest \
  src/screens/ --no-cache --verbose
```

## Test infra note

`jest-expo@55.0.17` requires `expo-modules-core/src/polyfill/dangerous-internal` which is not present in `expo-modules-core@2.2.3`. A stub polyfill was created at `mobile/node_modules/expo-modules-core/src/polyfill/dangerous-internal.js`. This is a local dev-environment fix; the `.gitignore` should already exclude `node_modules/`. A proper fix would be to pin `jest-expo` to a version compatible with the installed `expo-modules-core`.

## Reviewer

🐝 Bee (Mobile Coder #2). Handoff to next reviewer per Fleet Review Protocol.
