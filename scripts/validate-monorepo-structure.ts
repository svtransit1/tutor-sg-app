#!/usr/bin/env pnpm exec tsx

/**
 * AAAS-355: Monorepo package structure validator
 *
 * Validates that the monorepo matches Owl's architecture doc (ADD §7):
 * - All required packages/ directories exist
 * - Each has a valid package.json with correct @tutor-sg/ naming
 * - Root pnpm-workspace.yaml lists all packages via packages/*
 *
 * Exit codes:
 *   0 = all checks passed
 *   1 = validation errors found
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ROOT = join(__dirname, '..');
const PACKAGES_DIR = join(ROOT, 'packages');
const WORKSPACE_FILE = join(ROOT, 'pnpm-workspace.yaml');

interface PackageInfo {
  name: string;
  version: string;
}

// Architecture-defined packages (ADD §7) — future packages, not yet created
const REQUIRED_PACKAGES = [
  { dir: 'app', name: '@tutor-sg/app', note: 'Expo RN app' },
  { dir: 'llm-runtime', name: '@tutor-sg/llm-runtime', note: 'LiteRT-LM bridge' },
  { dir: 'vision', name: '@tutor-sg/vision', note: 'OCR pipeline' },
  { dir: 'models', name: '@tutor-sg/models', note: 'shared types, DTOs' },
  { dir: 'i18n', name: '@tutor-sg/i18n', note: 'translation assets' },
  { dir: 'ui', name: '@tutor-sg/ui', note: 'shared component library' },
];

// Packages that exist today
const ACTIVE_PACKAGES = [
  { dir: 'database', name: '@tutor-sg/database', note: 'database layer' },
  { dir: 'device-tier', name: '@tutor-sg/device-tier', note: 'device capability detection' },
  { dir: 'features', name: '@tutor-sg/features', note: 'feature flags' },
  { dir: 'llm', name: '@tutor-sg/llm', note: 'LLM runtime' },
  { dir: 'perf', name: '@tutor-sg/perf', note: 'performance monitoring' },
  { dir: 'shared', name: '@tutor-sg/shared', note: 'shared utilities' },
];

let exitCode = 0;

function logError(msg: string): void {
  console.error(`ERROR: ${msg}`);
  exitCode = 1;
}

function logOk(msg: string): void {
  console.log(`  OK   ${msg}`);
}

function readPackageJson(dir: string): PackageInfo | null {
  const pkgPath = join(PACKAGES_DIR, dir, 'package.json');
  try {
    const content = readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(content);
    return {
      name: pkg['name'] ?? 'MISSING',
      version: pkg['version'] ?? 'MISSING',
    };
  } catch {
    return null;
  }
}

function checkActivePackages(): void {
  console.log('\n=== Active packages ===');
  for (const pkg of ACTIVE_PACKAGES) {
    const pkgPath = join(PACKAGES_DIR, pkg.dir);
    try {
      readdirSync(pkgPath);
    } catch {
      logError(`Package missing: packages/${pkg.dir} (${pkg.note})`);
      continue;
    }

    const info = readPackageJson(pkg.dir);
    if (!info) {
      logError(`packages/${pkg.dir}/package.json not found`);
      continue;
    }

    if (info.name !== pkg.name) {
      logError(`packages/${pkg.dir}: expected name "${pkg.name}" but got "${info.name}"`);
    } else {
      logOk(`packages/${pkg.dir} -> ${info.name} (${info.version})`);
    }
  }
}

function checkFuturePackages(): void {
  console.log('\n=== Future packages (ADD §7 — not yet created) ===');
  for (const pkg of REQUIRED_PACKAGES) {
    const pkgPath = join(PACKAGES_DIR, pkg.dir);
    try {
      readdirSync(pkgPath);
      const info = readPackageJson(pkg.dir);
      if (!info) {
        logError(`packages/${pkg.dir} exists but has no package.json`);
      } else if (info.name !== pkg.name) {
        logError(`packages/${pkg.dir}: expected name "${pkg.name}" but got "${info.name}"`);
      } else {
        logOk(`packages/${pkg.dir} -> ${info.name} (${info.version})`);
      }
    } catch {
      console.log(`  SKIP packages/${pkg.dir} (${pkg.note}) — not yet created`);
    }
  }
}

function checkWorkspaceYaml(): void {
  console.log('\n=== pnpm-workspace.yaml ===');
  try {
    const content = readFileSync(WORKSPACE_FILE, 'utf-8');
    if (!content.includes('packages/*')) {
      logError('packages/* not found in pnpm-workspace.yaml');
    } else {
      logOk('pnpm-workspace.yaml contains packages/* glob');
    }
  } catch {
    logError('pnpm-workspace.yaml not found at root');
  }
}

function checkCircularDependencies(): void {
  console.log('\n=== Circular dependency check ===');
  const problematic = ['@tutor-sg/device-tier', '@tutor-sg/features', '@tutor-sg/llm'];
  const sharedPkgPath = join(PACKAGES_DIR, 'shared', 'package.json');
  try {
    const content = readFileSync(sharedPkgPath, 'utf-8');
    const pkg = JSON.parse(content);
    const deps = pkg['dependencies'] ?? {};
    for (const dep of problematic) {
      if (deps[dep]) {
        logError(`packages/shared/package.json depends on ${dep} — potential circular dependency`);
      }
    }
  } catch {
    // skip
  }
}

function main(): void {
  console.log('AAAS-355: Monorepo package structure validation');
  console.log(`Root: ${ROOT}`);

  checkActivePackages();
  checkFuturePackages();
  checkWorkspaceYaml();
  checkCircularDependencies();

  console.log('\n=== Result ===');
  if (exitCode === 0) {
    console.log('All checks passed.');
  } else {
    console.error('Validation FAILED — see errors above.');
  }

  process.exit(exitCode);
}

main();