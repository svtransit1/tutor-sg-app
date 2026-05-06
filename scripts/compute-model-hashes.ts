#!/usr/bin/env tsx
/**
 * Compute SHA-256 integrity hashes for model artifact files (gguf/mlx).
 *
 * Usage:
 *   npx tsx scripts/compute-model-hashes.ts <directory> [--json]
 *
 * Scans the given directory for .gguf and .mlx files (recursive),
 * computes SHA-256 + file size for each, and prints a JSON manifest
 * to stdout.
 *
 * Pass --json to write the manifest to shared/src/models/integrity.json
 * instead of stdout.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

interface HashEntry {
  file: string;
  sha256: string;
  sizeBytes: number;
}

function sha256File(filePath: string): { hash: string; size: number } {
  const stat = fs.statSync(filePath);
  const data = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return { hash, size: stat.size };
}

function findModelFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findModelFiles(fullPath));
    } else if (/\.gguf$/i.test(entry.name) || /\.mlx$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const dir = args.find((a) => !a.startsWith('--'));
  const writeJson = args.includes('--json');

  if (!dir) {
    console.error('Usage: compute-model-hashes.ts <directory> [--json]');
    process.exit(1);
  }

  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(1);
  }

  const files = findModelFiles(dir);

  if (files.length === 0) {
    console.error(`No .gguf or .mlx files found in ${dir}`);
    process.exit(1);
  }

  const entries: HashEntry[] = [];
  for (const file of files) {
    const { hash, size } = sha256File(file);
    entries.push({ file: path.basename(file), sha256: hash, sizeBytes: size });
    process.stderr.write(`${path.basename(file)}: ${hash} (${(size / 1024 / 1024).toFixed(1)} MB)\n`);
  }

  if (writeJson) {
    const outDir = path.join(process.cwd(), 'packages/shared/src/models');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'integrity.json');
    fs.writeFileSync(outPath, JSON.stringify(entries, null, 2) + '\n');
    process.stderr.write(`\nManifest written to ${outPath}\n`);
  } else {
    console.log(JSON.stringify(entries, null, 2));
  }
}

main();
