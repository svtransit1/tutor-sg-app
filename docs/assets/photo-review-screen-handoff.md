---
title: PhotoReviewScreen — UI Handoff
created: 2026-05-08
author: Flutter (UX)
status: merged
works-with: camera.tsx, manual-input.tsx
---

# PhotoReviewScreen — Post-Capture Review UI

## File locations

| Artifact | Path |
|---|---|
| PhotoReviewScreen component | `mobile/src/screens/PhotoReviewScreen.tsx` |
| Camera flow orchestrator | `mobile/app/(kid)/camera.tsx` |
| i18n EN keys | `mobile/src/i18n/locales/en.json` (`cameraScreen.*`) |
| i18n ZH keys | `mobile/src/i18n/locales/zh-Hans.json` (`cameraScreen.*`) |

## Screen flow

```
kidHome → camera.tsx (capture) → PhotoReviewScreen → processing → manual-input.tsx
                                   ↕ (add page)
```

## Component API

```typescript
interface PhotoReviewScreenProps {
  pages: PhotoReviewPage[];          // captured image URIs
  selectedPageIndex: number;         // currently previewed page
  onSelectPage: (index: number) => void;
  onRetake: () => void;              // back to camera capture
  onConfirm: (pages: PhotoReviewPage[]) => void; // proceed to OCR
  onAddPage: () => void;             // capture another page
  onRemovePage: (index: number) => void;
  maxPages?: number;                 // default 5
}
```

## Visual layout

1. **Full-screen photo preview** — `Image` with `resizeMode="contain"` on a dark background
2. **Overlay layer** (non-interactive):
   - Top bar: page badge ("Page 2 of 5") + remove button (✕) — only when multi-page
   - Hint text: "You can add multiple pages"
3. **Bottom sheet** (`borderTopLeftRadius: 16`):
   - Horizontal thumbnail strip (64×64, scrollable) with selected highlight border
   - "+ Add page" dashed button at end of strip (when <5 pages)
   - Action row: `[Retake (flex: 1)] [Use N photos (flex: 2)]`
   - Confirm button: `#4A90D9` primary, 52pt min height

## States

| State | Trigger | UI |
|---|---|---|
| Single page | 1 photo captured | Full preview + [Retake] [Use this photo] |
| Multi-page | 2+ photos captured | Thumbnail strip + page counter + remove button |
| Add page | <5 pages | "+" dashed thumbnail at end of strip |
| Max pages | 5 pages reached | "+" button hidden |
| Remove last page | Delete only page | Falls back to camera capture |
| Processing | Confirm tapped | Spinner + "Reading your homework..." |

## Integration notes for Wolf/Bee

- `handleConfirm` in `camera.tsx` currently stubs OCR with an 800ms delay → `manual-input.tsx`
- Replace the stub with real OCR pipeline: run OCR on `_confirmedPages`, check `needsManualInput`, route to `manual-input.tsx` or feedback
- Photo URIs come from `expo-camera` `takePictureAsync` — resizing/compression can be added if camera TS perf needs it

## Accessibility

- `accessibilityRole="button"` on all interactive elements
- `accessibilityLabel` for retake, confirm (plural/singular), page thumbnails, add page, remove page
- `accessibilityState={{ selected }}` on active thumbnail
- `hitSlop` on all small touch targets
- `minHeight: 52` on action buttons (well above 44pt minimum)
