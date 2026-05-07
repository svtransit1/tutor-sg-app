#!/usr/bin/env python3
"""i18n coverage check — zero hardcoded English strings in UI.

Checks:
  1. All t('key') calls reference keys in both EN + zh-Hans locale files
  2. No obvious hardcoded English strings outside t() in tsx files

Usage: scripts/i18n-coverage-check.py [--fix]
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Dict, Set, List, Tuple

REPO_ROOT = Path(os.getcwd())
EN_FILE = REPO_ROOT / "mobile" / "src" / "i18n" / "locales" / "en.json"
ZH_FILE = REPO_ROOT / "mobile" / "src" / "i18n" / "locales" / "zh-Hans.json"
EXIT_CODE = 0


def find_tsx_files() -> List[Path]:
    """Find all tsx/ts files in mobile/src and mobile/app, excluding tests and node_modules."""
    files = []
    for base in ["mobile/src", "mobile/app"]:
        for root, dirs, filenames in os.walk(REPO_ROOT / base):
            # Skip __tests__, node_modules
            dirs[:] = [d for d in dirs if d not in ("__tests__", "node_modules", "__mocks__")]
            for fn in filenames:
                if fn.endswith((".tsx", ".ts")) and not fn.endswith(".d.ts"):
                    files.append(Path(root) / fn)
    return sorted(files)


def flatten_json_keys(data: dict, prefix: str = "") -> Set[str]:
    """Recursively flatten nested JSON keys into dot-separated paths."""
    keys = set()
    for k, v in data.items():
        full = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys |= flatten_json_keys(v, full)
        else:
            keys.add(full)
    return keys


def extract_t_calls(filepath: Path) -> List[str]:
    """Extract all t('key') usage from a file."""
    content = filepath.read_text(encoding="utf-8")
    # Match t('...'), t("..."), t(`...`)
    return re.findall(r"t\(['\"`]([^'\"`]+)['\"`]", content)


def check_hardcoded_strings(filepath: Path) -> List[Tuple[int, str]]:
    """Heuristic check for hardcoded English strings."""
    issues = []
    lines = filepath.read_text(encoding="utf-8").split("\n")

    # Patterns to skip
    skip_patterns = [
        r"testID=", r"style=", r"className=", r"^import ", r"^export ",
        r"require\(", r"\.ts", r"\.js", r"\/\/", r"t\(", r"accessibility",
        r"^\s*$", r"^\s*[}\]>,]", r"//", r"\*", r"key=",
    ]
    # Look for English-looking strings in JSX text content or string props
    english_pattern = re.compile(r"""["'`][A-Z][a-z]+[a-zA-Z\s,.'!?]+["'`]""")

    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if any(re.search(p, stripped) for p in skip_patterns):
            continue
        if english_pattern.search(stripped):
            # Double-check: only flag if it looks like UI text (not paths/colors)
            if re.search(r"(#|:\s|\(|\)|=>|\|\||&&)", stripped):
                continue
            issues.append((i, stripped))
    return issues


def load_locale(path: Path) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def main():
    global EXIT_CODE
    print("=== i18n Coverage Check ===")
    print()

    # ── Step 1: Extract all t('key') usages ────────────────────────
    print("--- Scanning t('key') calls in TypeScript files ---")
    files = find_tsx_files()
    used_keys: Dict[str, int] = {}
    total_calls = 0

    for f in files:
        keys = extract_t_calls(f)
        for key in keys:
            used_keys[key] = used_keys.get(key, 0) + 1
            total_calls += 1

    print(f"Found {total_calls} t('key') calls across {len(files)} files")
    print(f"Unique keys used: {len(used_keys)}")
    print()

    # ── Step 2: Check key coverage in locale files ─────────────────
    print("--- Checking key coverage in locale files ---")

    en_data = load_locale(EN_FILE)
    zh_data = load_locale(ZH_FILE)

    en_keys = flatten_json_keys(en_data)
    zh_keys = flatten_json_keys(zh_data)

    missing_en: List[str] = []
    missing_zh: List[str] = []

    for key in sorted(used_keys.keys()):
        if key not in en_keys:
            missing_en.append(key)
        if key not in zh_keys:
            missing_zh.append(key)

    for key in missing_en:
        print(f"  ❌ Key '{key}' used in code but MISSING from en.json")
        EXIT_CODE = 1
    for key in missing_zh:
        print(f"  ❌ Key '{key}' used in code but MISSING from zh-Hans.json")
        EXIT_CODE = 1

    if not missing_en and not missing_zh:
        print("  ✅ All keys present in both locale files")

    # Check for unused keys in locale files
    print()
    print("--- Checking for unused locale keys ---")
    unused_en = 0
    for key in sorted(en_keys):
        if key not in used_keys:
            # Only flag leaf keys (string values, not nested dicts)
            parts = key.split(".")
            obj = en_data
            for p in parts:
                obj = obj.get(p, {}) if isinstance(obj, dict) else {}
            if isinstance(obj, str):
                print(f"  ⚠️  Key '{key}' in en.json appears UNUSED in code")
                unused_en += 1

    print(f"  Unused en.json keys: {unused_en}")

    # ── Step 3: Check for hardcoded English strings ─────────────────
    print()
    print("--- Checking for hardcoded English strings ---")
    total_hardcoded = 0
    for f in files:
        issues = check_hardcoded_strings(f)
        for line_num, line in issues:
            rel = f.relative_to(REPO_ROOT)
            print(f"  ⚠️  {rel}:{line_num}  {line.strip()[:80]}")
            total_hardcoded += 1
            EXIT_CODE = 1

    if total_hardcoded == 0:
        print("  ✅ No obvious hardcoded strings detected")
    else:
        print(f"  ❌ Found {total_hardcoded} possible hardcoded strings")

    # ── Summary ────────────────────────────────────────────────────
    print()
    print("--- Summary ---")
    print(f"  Files scanned:      {len(files)}")
    print(f"  t('key') calls:     {total_calls}")
    print(f"  Unique keys used:   {len(used_keys)}")
    print(f"  Missing from en:    {len(missing_en)}")
    print(f"  Missing from zh:    {len(missing_zh)}")
    print(f"  Unused en keys:     {unused_en}")
    print(f"  Hardcoded strings:  {total_hardcoded}")

    print()
    if EXIT_CODE == 0:
        print("  ✅ i18n coverage check PASSED")
    else:
        print("  ❌ i18n coverage check FAILED — fix issues above")

    sys.exit(EXIT_CODE)


if __name__ == "__main__":
    main()
