# tutor-sg — Testing Strategy

Per ADD §9 (Quality bars) and ADD §11 (Development conventions). All PRs must pass all test layers before merge. Tortoise enforces.

## Testing Pyramid

```
        ┌──────┐
        │ E2E  │  ← Full-flow scenarios (Detox / Maestro)
        ├──────┤
        │ Int  │  ← Integration tests (Component + API)
        ├──────┤
        │ Unit │  ← Unit tests (Vitest / Jest)
        └──────┘
```

## Layer Definitions

| Layer | What | Tool | Scope |
|-------|------|------|-------|
| **Unit** | Pure functions, hooks, utilities, state machines | Vitest (packages), Jest (mobile) | Fast, no RN runtime needed |
| **Component** | UI components, screens, providers | React Native Testing Library + Vitest/Jest | Render components, fire events, assert output |
| **Integration** | Multi-package workflows, data flow, navigation | Detox (iOS) / Maestro (cross-platform) | Real RN runtime, state persistence, router |
| **E2E** | Full user journeys (onboarding, homework flow) | Detox / Maestro | Simulator/emulator, full app lifecycle |

## Tool Stack

### Unit + Component: Vitest (packages) + Jest (mobile)

- **packages/\***: `vitest` — fast, native ESM, Vite-compatible
- **mobile/**: `jest` + `react-native-testing-library` — Expo-compatible, works with RN jest preset
- Config: `vitest.config.mjs` per package, `jest.config.js` in mobile/
- Coverage target: ≥80% lines on new code (enforced by Tortoise review)

### Integration + E2E: Detox (iOS) + Maestro

- **Detox**: iOS simulator integration and E2E. Real app launch, element queries, gestures.
- **Maestro**: Cross-platform smoke tests. YAML-based flows. Fast iteration.
- Config: `.detoxrc.json` (iOS), `.maestro/` flows directory

## What We Test (per feature type)

| Feature | Unit | Component | Integration | E2E |
|---------|------|-----------|-------------|-----|
| Onboarding state machine | `machine.ts` transitions | `OnboardingProvider` context | Resume after kill | Full 7-step flow |
| Device tier detection | `detect.ts` thresholds | `DeviceTierProvider` | Tier → model routing | Fresh install detection |
| Camera + OCR pipeline | Image processing utils | Camera screen | Photo → OCR → segmentation | Snap homework → feedback |
| LLM response display | Prompt builders | Chat bubble + scaffold UI | Streaming tokens → rendering | Full homework flow |
| Parent PIN gate | Pin hash validation | PIN setup + entry | Failed attempt cooldown | Parent area access |
| Session persistence | CRUD operations | Session list UI | Auto-save on completion | Multi-session flow |
| IAP entitlement | Feature gate logic | Purchase screen | Receipt → entitlement | Store sandbox purchase |

## Running Tests

```bash
# All packages (unit)
pnpm test

# Specific package
cd packages/llm && pnpm vitest run

# Mobile (unit + component)
cd mobile && pnpm jest

# E2E smoke (Maestro)
cd mobile && pnpm e2e:smoke

# Full E2E (Detox)
cd mobile && pnpm e2e
```

## CI Integration

Per `.github/workflows/ci.yml`:
- Unit + Component tests run on every PR (`pnpm test`)
- All layers must pass before merge
- E2E tests run on `main` merge (post-merge gate)

## Quality Bar (ADD §9, enforced by Tortoise)

Every PR must demonstrate:
1. **Unit tests** for new functions/hooks
2. **Component tests** for new screens/components
3. At least **one integration scenario** for new features touching multiple packages
4. Tests pass locally (`pnpm test` exit 0)
5. No skipped tests without documented reason

## Non-Testable Items

- Performance benchmarks (manual profiling on device matrix)
- Accessibility audits (manual VoiceOver/TalkBack review)
- Visual regression (manual review against style guide)
- Stylus input fidelity (manual Apple Pencil / S Pen testing)

These are QA-gated, not CI-gated. Document issues in Paperclip with `qa-manual` tag.
