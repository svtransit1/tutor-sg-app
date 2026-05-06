# AAAS-239: Flutter — UX Review for Onboarding Screens

**Date:** 2026-05-07  
**Reviewer:** 🦋 Flutter (UX/UI Designer)  
**Scope:** All 7 onboarding screens + related UI components (AAAS-222, AAAS-223, AAAS-169, AAAS-224, AAAS-42, AAAS-193, AAAS-192, AAAS-208)  
**Workspace:** `/Users/muatan/tutor-sg-app/`

---

## Review Summary

| Category | Count | 
|---|---|
| 🔴 Blocker (must fix before submit review) | 4 |
| 🟡 Major (should fix in M2) | 8 |
| 🟢 Minor (nice-to-have, note for M3+) | 8 |
| ✅ Compliant items (verified against ADD) | 12 |

Total 20 findings across 8 screens/components.

---

## 🔴 Blocker Items

### B1. `DoneScreen` — template literal in `t()` call (will not localise)

**File:** `feat/aaas-42-consent-privacy-current:mobile/src/onboarding/screens/DoneScreen.tsx`  
**Line:** `{t('onboarding.done.greeting', \`Hi ${state.kidName}! Let's learn!\`)}`

**Problem:** The default value is a JavaScript template literal so `state.kidName` is baked in at compile time. This breaks i18next lookup — the greeting text is not translatable and `onboarding.done.greeting` key is absent from both `en.json` and `zh-Hans.json` locale files.

**Fix:** Use i18next interpolation params:
```tsx
t('onboarding.done.greeting', { name: state.kidName })
```
And add to both locale files:
```json
"done": { "title": "All set!", "subtitle": "Your AI tutor is ready.", "greeting": "Hi {{name}}! Let's learn!", "cta": "Start learning" }
```

### B2. `DeviceTierScreen` — Missing "Download now" / "Download later" CTAs (contradicts AAAS-223 ACs)

**File:** `feat/aaas-42-consent-privacy-current:mobile/src/onboarding/screens/DeviceTierScreen.tsx`

**Problem:** AAAS-223 ACs specify:
- "Download now" primary button + "Download later (Wi-Fi only)" secondary
- Shows estimated download size (~2 GB high / ~700 MB standard)
- Warning if on cellular
- Consent text: "Models run entirely on this device. Nothing leaves your phone."

The current screen just has generic "Back" / "Next" buttons with `onboarding.deviceTier.title` text "Device Ready!" — none of the above. This is not compliant with the acceptance criteria.

**Fix:** Redesign the device-tier step to show:
1. Detected tier label ("High Performance" / "Standard") with explanation
2. Estimated download size and model names
3. Privacy consent text inline
4. "Download now" primary + "Download later (Wi-Fi only)" secondary
5. Cellular data warning with proceed/cancel options

### B3. `ModelDownloadScreen` — No pause/cancel/retry, no cellular warning (contradicts AAAS-40 ACs)

**File:** `feat/aaas-42-consent-privacy-current:mobile/src/onboarding/screens/ModelDownloadScreen.tsx`

**Problem:** Per AAAS-40 (M2-3) the model download screen must have:
- Pause/cancel controls
- Retry on network error
- Live progress bar (% + MB/total MB)
- Cellular data warning if on cellular
- Resume on app restart

Current screen has a simulated progress bar with no controls, no file info, no error handling. This is not shippable.

**Fix:** Integrate with `ModelDownloadService` from AAAS-207. Wire pause/resume/cancel buttons. Show file name, MB progress, network type indicator. Handle retry states.

### B4. `LanguageSelectScreen` — `setTimeout` race condition for navigation

**File:** `mobile/src/screens/onboarding/LanguageSelectScreen.tsx` (AAAS-222)  
**Lines 67–80 (handleSelect)**

**Problem:** On language tile tap, the component sets `committing=true`, persists locale, then uses `setTimeout(400)` to navigate. If the user navigates away (e.g., system back gesture on Android) during the 400ms delay, the timeout callback fires on an unmounted component and `router.replace(...)` may cause unexpected navigation to the wrong screen or a crash.

**Fix:** Use `useRef` to track mounted state, or navigate immediately after i18n switch with a CSS/RN `Animated` delay for visual feedback instead of a timeout-based navigation delay.

---

## 🟡 Major Items

### M1. All screens — Missing onboarding progress indicator

**Affects:** Every onboarding screen (7 steps)

**Problem:** No screen shows "Step 2/7" or visual progress indicator. The user has no sense of how far through onboarding they are. This hurts funnel completion (per Article 12: "First-90-seconds onboarding flow"). Users may drop off assuming the process is endless.

**Fix:** Add a progress bar or step indicator (dots or numbered) at the top of every onboarding screen. Display "Step X of 7" text. Highlight current step.

### M2. `ParentSignInScreen` — "G" text instead of proper Google icon (brand non-compliant)

**File:** `mobile/src/screens/onboarding/ParentSignInScreen.tsx`  
**Line:** `<Text style={styles.oauthButtonText}>G</Text>`

**Problem:** Using a plain letter "G" for Google sign-in is not brand-compliant. Google requires proper branding assets. Similarly, the Apple icon uses Unicode `` which renders inconsistently across platforms.

**Fix:** Use proper SVG icons or Expo vector icons (Ionicons `logo-google`, `logo-apple`). For Apple, use Apple's SF Symbol or a proper rendered icon.

### M3. `ParentSignInScreen` — "Skip for now" too subtle

**File:** `mobile/src/screens/onboarding/ParentSignInScreen.tsx`  
**Line 251:** `<Text style={styles.skipButtonText}>` — 9CA3AF (light gray) + underline

**Problem:** The skip action is rendered in light gray underlined text at the very bottom. For a critical decision point (deferring auth), this is too subtle. Parents may not realise they can skip. Combined with no progress indicator, this can cause confusion ("Am I stuck?").

**Fix:** Move skip to be more visible — either as a text button with more prominent styling (e.g., same weight as primary, but outlined) or add a brief explanatory note: "You can sign up later from the Parent area."

### M4. `ConsentScreen` — Privacy policy URL is a placeholder

**File:** `feat/aaas-42-consent-privacy-current:mobile/src/onboarding/screens/ConsentScreen.tsx`  
**Reference:** `PRIVACY_POLICY_URL` (likely a placeholder)

**Problem:** The privacy policy URL is still a placeholder. Per ADD §8, Boss owns the legal docs — this needs to be flagged as a `boss-needed` blocker for the onboarding flow to ship. Without a real privacy policy URL, the consent screen cannot be legally compliant.

**Fix:** File a `boss-needed` issue for Boss to provide the privacy policy URL. Mark the UI placeholder prominently with a TODO/in-app note.

### M5. `WelcomeScreen` — No brand presence, no visual interest for kids

**File:** `feat/aaas-42-consent-privacy-current:mobile/src/onboarding/screens/WelcomeScreen.tsx`  
And `mobile/app/(onboarding)/welcome.tsx` (main branch)

**Problem:** The welcome screen is a plain white card with text. No mascot, no illustration, no playful animation. For a kid-facing app with an on-device "AI tutor" brand promise, the first impression should be warm, inviting, and fun. A P1 student looking at a gray "Next" button on a white screen may not be motivated to continue.

**Fix:** Add a friendly mascot illustration (see visual-bible-method skill if generated), a playful tagline, and an animated "Let's start!" CTA. The screen should feel warm and exciting, not like a form.

### M6. `KidProfileScreen` — Dense form layout, no kid-friendly visual elements

**File:** `feat/aaas-42-consent-privacy-current:mobile/src/onboarding/screens/KidProfileScreen.tsx`

**Problem:** The screen is a dense vertical list of form elements (name input, level chips, language chips, action buttons, kids list). No visual separation, no icons, no card hierarchy. For a parent setting up their child's profile, this should feel guided and warm, not like a web form.

**Fix:** 
- Group form sections with card backgrounds
- Add icons for each field (child icon, grade icon, language icon)
- Increase spacing between sections
- Show a preview card of what the kid's dashboard will look like

### M7. Cross-cutting — Inconsistent `SafeAreaView` usage

**Affects:** WelcomeScreen (no SafeAreaView), ConsentScreen (ScrollView without SafeAreaView), DeviceTierScreen (View, no SafeAreaView), KidProfileScreen (ScrollView only), ModelDownloadScreen (View only), DoneScreen (View only)

**Problem:** On notched devices (iPhone 14/15/16, Pixel 8/9) screens without SafeAreaView will render content behind the notch or system gesture bar. Only LanguageSelectScreen and ParentSignInScreen use SafeAreaView correctly.

**Fix:** All onboarding screens should wrap content in `SafeAreaView` or use `SafeAreaInsets` for consistent layout on all devices.

### M8. Cross-cutting — Feature branch locale path mismatch

**Branch:** `feat/aaas-42-consent-privacy-current` uses `mobile/src/i18n/en.json`  
**Main:** uses `mobile/src/i18n/locales/en.json`

**Problem:** When the onboarding feature branch merges into main, the i18n file path conflict will cause a merge collision. The onboarding screens import from `../../i18n` but the main branch has the locales in a subdirectory. This will break all translations on merge.

**Fix:** Align to main's path: `mobile/src/i18n/locales/en.json`. Update all screen imports. Or vice-versa — but pick one before merge.

---

## 🟢 Minor Items

### m1. All screens — No onboarding completion animation

**File:** `DoneScreen.tsx`

No celebration animation (confetti, checkmark animation, etc.) when the user completes onboarding. For kids, this is a moment of delight that reinforces the "ready to learn!" feeling.

### m2. `LanguageSelectScreen` — "English" tile shows "英文" subtitle for both languages

When the current UI locale is already English, the native label "英文" is shown smaller below. This is correct per spec. But when zh-Hans is selected, the English tile could also show a localised hint.

### m3. `LanguageSelectScreen` — `accessibilityRole="radiogroup"` without container role support

The `accessibilityRole="radiogroup"` on the tiles container is correct, but React Native's accessibility doesn't consistently support radiogroup navigation across platforms. Consider using a custom accessibility pattern for robustness.

### m4. `ParentSignInScreen` — Email input lacks trim on submit

If the user enters " user@example.com " (leading/trailing spaces), the magic link will be sent to the trimmed version but the email display will show the original. Add `.trim()` consistently.

### m5. `ConsentScreen` — Telemetry switch text alignment on small screens

On screens < 375px width, the telemetry row (text left, switch right) may cause text truncation. The text label has `flex: 1` but should also have `flexShrink: 1`.

### m6. `DeviceTierScreen` — Detection animation is a plain spinner

The "Checking your device..." state shows a plain `ActivityIndicator` with text. Could be more engaging with a scanning animation or device illustration.

### m7. `KidProfileScreen` — Level chips do not wrap correctly on small screens

The level grid uses `flexDirection: 'row', flexWrap: 'wrap'` but has no `justifyContent` setting, causing uneven spacing when wrapped to 2 rows (P1-P3, P4-P6).

### m8. `WelcomeScreen` — Placeholder still present in main branch

**File:** `mobile/app/(onboarding)/welcome.tsx` (main branch)

The main branch's welcome route still shows "Placeholder — M2 implementation pending". This won't be visible once the feature branch screens replace it, but should be cleaned up.

---

## ✅ Compliant Items (verified against ADD + locked decisions)

| # | Item | Status | Ref |
|---|------|--------|-----|
| 1 | Bilingual: all reviewed screens use `t()` for strings | ✅ | ADD §4.5 |
| 2 | Language select: two tiles, tap = commit, no "Next" button | ✅ | Article 12 §3.2 |
| 3 | Language select: persisted to MMKV immediately | ✅ | ADD §7 |
| 4 | Consent: telemetry opt-in default OFF | ✅ | ADD §11 |
| 5 | Consent: privacy promise card clearly displayed | ✅ | ADD §4.2, Article 04 |
| 6 | Parent sign-in: three methods (email, Google, Apple) | ✅ | ADD §7 |
| 7 | Parent sign-in: "Skip for now" option present | ✅ | ADD §6.5 |
| 8 | Parent sign-in: error states handled (invalid email, network, OAuth cancelled) | ✅ | AAAS-224 ACs |
| 9 | Kid profile: P1–P6 level picker | ✅ | ADD §1 |
| 10 | Kid profile: name validation (1-30 chars) | ✅ | — |
| 11 | Kid profile: max 4 children enforced | ✅ | ADD §6 (family plan) |
| 12 | Accessibility: testIDs present on key interactive elements | ✅ | Review checklist §3 |

---

## Priority Recommendations for Action

### Fix first (blockers — 🔴):
1. **B1** — Fix DoneScreen `t()` interpolation → file i18n key + update code
2. **B2** — Redesign DeviceTierScreen per AAAS-223 ACs (download CTAs, size, model names)
3. **B3** — Wire ModelDownloadScreen to real ModelDownloadService with pause/retry/cancel
4. **B4** — Fix LanguageSelectScreen setTimeout navigation race condition

### Fix before merge (majors — 🟡):
1. Add progress indicator to all 7 screens
2. Fix ParentSignInScreen Google icon (use proper SVG)
3. Improve "Skip for now" visibility in ParentSignInScreen
4. Resolve privacy policy URL placeholder (file `boss-needed`)
5. Add visual interest to WelcomeScreen
6. Improve KidProfileScreen form layout
7. Fix SafeAreaView consistency
8. Resolve i18n path conflict between branches

### Note for M3+ (minors — 🟢):
- Onboarding completion animation
- Small-screen layout refinements
- Wrap improvements for level chips
- Accessibility polish for radiogroup

---

## Next Actions

1. **File a `boss-needed` issue** for the privacy policy URL placeholder (blocks ConsentScreen from shipping)
2. **Route this review** as a comment on AAAS-239
3. **Route individual findings** to:
   - 🐺 Wolf: B1, B2, B3, M4, M5 (WelcomeScreen/ConsentScreen/DoneScreen screens on `feat/aaas-42-consent-privacy-current`)
   - 🐝 Bee: M2, M3 (ParentSignInScreen on `feat/aaas-224-parent-sign-in`), M8
   - 🐦 Flutter (self): B4, M1, M6, M7, M8, m1-m8 (LanguageSelectScreen, progress indicator, SafeAreaView, i18n paths)
4. **Re-open AAAS-222, AAAS-223, AAAS-169** with specific UX fixes attached
