import { getDb } from './database';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60_000;

export interface PinStatus {
  isSet: boolean;
  failedAttempts: number;
  isLocked: boolean;
  lockedUntil: string | null;
}

interface PinRow {
  id: number;
  pin_hash: string;
  failed_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
}

export async function getPinStatus(): Promise<PinStatus> {
  const db = await getDb();
  const row = await db.getFirstAsync<PinRow>(
    'SELECT * FROM parent_pin WHERE id = 1',
  );

  if (!row) {
    return { isSet: false, failedAttempts: 0, isLocked: false, lockedUntil: null };
  }

  const isLocked = checkIfLocked(row.locked_until);
  return {
    isSet: true,
    failedAttempts: row.failed_attempts,
    isLocked,
    lockedUntil: isLocked ? row.locked_until : null,
  };
}

export async function setPin(pinHash: string): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const existing = await db.getFirstAsync<PinRow>(
    'SELECT id FROM parent_pin WHERE id = 1',
  );

  if (existing) {
    await db.runAsync(
      `UPDATE parent_pin
       SET pin_hash = ?, failed_attempts = 0, locked_until = NULL, updated_at = ?
       WHERE id = 1`,
      pinHash,
      now,
    );
  } else {
    await db.runAsync(
      `INSERT INTO parent_pin (id, pin_hash, failed_attempts, locked_until, created_at, updated_at)
       VALUES (1, ?, 0, NULL, ?, ?)`,
      pinHash,
      now,
      now,
    );
  }
}

export async function verifyPin(pinHash: string): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync<PinRow>(
    'SELECT * FROM parent_pin WHERE id = 1',
  );

  if (!row) return false;
  if (checkIfLocked(row.locked_until)) return false;

  if (row.pin_hash !== pinHash) {
    const attempts = row.failed_attempts + 1;
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      const lockedUntil = new Date(
        Date.now() + LOCKOUT_DURATION_MS,
      ).toISOString();
      await db.runAsync(
        `UPDATE parent_pin
         SET failed_attempts = ?, locked_until = ?, updated_at = ?
         WHERE id = 1`,
        attempts,
        lockedUntil,
        new Date().toISOString(),
      );
    } else {
      await db.runAsync(
        `UPDATE parent_pin
         SET failed_attempts = ?, updated_at = ?
         WHERE id = 1`,
        attempts,
        new Date().toISOString(),
      );
    }
    return false;
  }

  await db.runAsync(
    `UPDATE parent_pin
     SET failed_attempts = 0, locked_until = NULL, updated_at = ?
     WHERE id = 1`,
    new Date().toISOString(),
  );
  return true;
}

export async function resetFailedAttempts(): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE parent_pin
     SET failed_attempts = 0, locked_until = NULL, updated_at = ?
     WHERE id = 1`,
    new Date().toISOString(),
  );
}

function checkIfLocked(lockedUntil: string | null): boolean {
  if (!lockedUntil) return false;
  return new Date(lockedUntil).getTime() > Date.now();
}
