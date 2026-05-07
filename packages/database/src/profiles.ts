import { v4 as uuid } from 'uuid';
import type { DatabaseExecutor } from './schema';
import type { ParentAccount, KidProfile, GradeLevel, Subject } from './types';

export function createParentAccount(
  db: DatabaseExecutor,
  params: {
    email: string;
    authProvider: ParentAccount['authProvider'];
    authProviderId: string;
  },
): ParentAccount {
  const now = new Date().toISOString();
  const id = uuid();
  db.run(
    `INSERT INTO parent_account (id, email, auth_provider, auth_provider_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, params.email, params.authProvider, params.authProviderId, now, now],
  );
  return getParentAccount(db, id)!;
}

export function getParentAccount(
  db: DatabaseExecutor,
  id: string,
): ParentAccount | null {
  const row = db.getFirst<{
    id: string;
    email: string;
    auth_provider: string;
    auth_provider_id: string;
    created_at: string;
    updated_at: string;
  }>('SELECT * FROM parent_account WHERE id = ?', [id]);

  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    authProvider: row.auth_provider as ParentAccount['authProvider'],
    authProviderId: row.auth_provider_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getParentAccountByEmail(
  db: DatabaseExecutor,
  email: string,
): ParentAccount | null {
  const row = db.getFirst<{
    id: string;
    email: string;
    auth_provider: string;
    auth_provider_id: string;
    created_at: string;
    updated_at: string;
  }>('SELECT * FROM parent_account WHERE email = ?', [email]);

  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    authProvider: row.auth_provider as ParentAccount['authProvider'],
    authProviderId: row.auth_provider_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createKidProfile(
  db: DatabaseExecutor,
  params: {
    parentAccountId: string;
    name: string;
    grade: GradeLevel;
    subjects: Subject[];
  },
): KidProfile {
  const now = new Date().toISOString();
  const id = uuid();
  const subjectsJson = JSON.stringify(params.subjects);
  db.run(
    `INSERT INTO kid_profile (id, parent_account_id, name, grade, subjects, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, params.parentAccountId, params.name, params.grade, subjectsJson, now, now],
  );
  return getKidProfile(db, id)!;
}

export function getKidProfile(
  db: DatabaseExecutor,
  id: string,
): KidProfile | null {
  const row = db.getFirst<{
    id: string;
    parent_account_id: string;
    name: string;
    grade: string;
    subjects: string;
    created_at: string;
    updated_at: string;
  }>('SELECT * FROM kid_profile WHERE id = ?', [id]);

  if (!row) return null;
  return {
    id: row.id,
    parentAccountId: row.parent_account_id,
    name: row.name,
    grade: row.grade as GradeLevel,
    subjects: JSON.parse(row.subjects) as Subject[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listKidProfiles(
  db: DatabaseExecutor,
  parentAccountId: string,
): KidProfile[] {
  const rows = db.getAll<{
    id: string;
    parent_account_id: string;
    name: string;
    grade: string;
    subjects: string;
    created_at: string;
    updated_at: string;
  }>('SELECT * FROM kid_profile WHERE parent_account_id = ? ORDER BY created_at', [
    parentAccountId,
  ]);

  return rows.map((row) => ({
    id: row.id,
    parentAccountId: row.parent_account_id,
    name: row.name,
    grade: row.grade as GradeLevel,
    subjects: JSON.parse(row.subjects) as Subject[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export function updateKidProfile(
  db: DatabaseExecutor,
  id: string,
  params: Partial<{ name: string; grade: GradeLevel; subjects: Subject[] }>,
): KidProfile | null {
  const existing = getKidProfile(db, id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const newName = params.name ?? existing.name;
  const newGrade = params.grade ?? existing.grade;
  const newSubjects = params.subjects ?? existing.subjects;

  db.run(
    `UPDATE kid_profile SET name = ?, grade = ?, subjects = ?, updated_at = ? WHERE id = ?`,
    [newName, newGrade, JSON.stringify(newSubjects), now, id],
  );
  return getKidProfile(db, id);
}
