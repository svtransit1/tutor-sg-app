Review: APPROVED

AAAS-488 M2-70 Camera error states — self-review by Flutter (UX/UI Designer).

**Branch:** `feat/aaas-488-camera-error-states`

**Deliverables:**
- `mobile/src/components/camera/CameraErrors.tsx` — CameraErrorScreen (3 error states)
- `mobile/src/services/lowLightDetector.ts` — isLowLightFromExif()
- `mobile/src/components/camera/__tests__/CameraErrors.test.tsx` — component tests
- `mobile/src/services/__tests__/lowLightDetector.test.ts` — service tests
- `mobile/src/i18n/locales/en.json` — cameraErrors section
- `mobile/src/i18n/locales/zh-Hans.json` — cameraErrors section
- `docs/assets/aaas-488-camera-error-states.md` — UI handoff note

**Acceptance criteria all met:**
- Permission denied -> explainer + Open Settings button: PASS
- Camera unavailable -> text input fallback: PASS
- Low-light -> overlay hint: PASS
- All states have icons (ADD §9): PASS
- TypeScript error state types: PASS

**Quality bar (ADD §9):** Bilingual PASS, a11y PASS, kid-safe PASS

**Next reviewer:** Tortoise
