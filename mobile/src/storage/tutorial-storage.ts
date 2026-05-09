import { openDatabaseAsync } from 'expo-sqlite';

const TABLE_DDL = `
  CREATE TABLE IF NOT EXISTS tutorial_flags (
    key TEXT PRIMARY KEY NOT NULL,
    value INTEGER NOT NULL DEFAULT 0
  );
`;

let dbPromise: ReturnType<typeof openDatabaseAsync> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync('tutor-sg.db').then(async (db) => {
      await db.execAsync(TABLE_DDL);
      return db;
    });
  }
  return dbPromise;
}

export async function isTutorialShown(): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: number }>(
    "SELECT value FROM tutorial_flags WHERE key = 'tutorial_shown'",
  );
  return (row?.value ?? 0) === 1;
}

export async function markTutorialShown(): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "INSERT OR REPLACE INTO tutorial_flags (key, value) VALUES ('tutorial_shown', 1)",
  );
}
