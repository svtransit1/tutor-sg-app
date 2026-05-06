# Placeholder App Icon And Splash Assets

Issue: AAAS-153

These are temporary launch assets for the Expo app while the final brand is deferred.

## Files

- `mobile/assets/icon.png` — 1024 x 1024 PNG app icon.
- `mobile/assets/adaptive-icon.png` — 1024 x 1024 PNG Android adaptive foreground placeholder.
- `mobile/assets/splash.png` — 1290 x 2796 PNG light-mode splash.
- `mobile/assets/splash-dark.png` — 1290 x 2796 PNG dark-mode splash.
- `mobile/assets/favicon.png` — 32 x 32 PNG derived from the app icon.

## Design Notes

- Uses the placeholder `tutor-sg` wordmark only. No final brand name is introduced.
- The mark is a simplified workbook plus pencil/stylus, sized to remain recognizable when the icon is reduced to 40 pt.
- The splash assets intentionally avoid subtitle copy so no additional localized user-facing strings are introduced.
- Palette uses teal, ink, gold, and coral to avoid a single-hue placeholder look while staying professional and kid-appropriate.

## Expo Wiring

`mobile/app.json` references the light and dark splash variants, the app icon, the Android adaptive icon, and the favicon.
