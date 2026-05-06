# Changelog

All notable changes to tutor-sg will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- EAS Submit configuration for iOS App Store and Google Play (AAAS-133)
- Production and beta submit profiles in `eas.json`
- Credential template in `.env.example`

### Changed

- Production build profile updated with `distribution: "store"` and `autoIncrement: true`
- `app.json` updated with `extra.eas.projectId` environment variable reference

### Fixed

- _(none)_

---

When submitting a release, date-stamp the version block:

```markdown
## [0.2.0] — 2026-05-07
```

Then pass the relevant changelog text via `--message` on `eas submit`.
