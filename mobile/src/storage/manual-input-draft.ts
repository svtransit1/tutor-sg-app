/**
 * Draft persistence for the manual input fallback screen.
 *
 * Saves the user's in-progress answers (typed text + drawn strokes)
 * to a local JSON file so they survive app kill/restart.
 *
 * Drafts are keyed by a session identifier (capturedPageUris hash).
 * After successful submission, the caller should clear the draft.
 *
 * @see ADD §4.1 — OCR fallback
 */

import * as FileSystem from 'expo-file-system'

const DRAFT_DIR = `${FileSystem.documentDirectory}manual-input-drafts/`

/**
 * Compute a stable key from captured page URIs so we can restore the
 * correct draft after restart.
 */
export function draftKey(capturedPageUris: string): string {
  // Simple hash of the URIs string — deterministic per session
  let hash = 0
  for (let i = 0; i < capturedPageUris.length; i++) {
    const char = capturedPageUris.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  return `draft_${Math.abs(hash).toString(16)}`
}

export interface DraftData {
  answers: {
    index: number
    textValue: string
    strokesJSON: string // JSON-stringified Stroke[]
  }[]
  subject: string
  inputMode: 'type' | 'draw'
  updatedAt: string // ISO 8601
}

/**
 * Save draft answers to local storage.
 */
export async function saveDraft(capturedPageUris: string, data: DraftData): Promise<void> {
  try {
    // Ensure directory exists
    await FileSystem.makeDirectoryAsync(DRAFT_DIR, { intermediates: true })
  } catch {
    // Directory may already exist — ignore
  }

  const key = draftKey(capturedPageUris)
  const filePath = `${DRAFT_DIR}${key}.json`

  try {
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data), {
      encoding: FileSystem.EncodingType.UTF8,
    })
  } catch (err) {
    console.warn('Failed to save manual-input draft:', err)
  }
}

/**
 * Load draft answers from local storage.
 * Returns null if no draft exists or it's too old (> 1 hour).
 */
export async function loadDraft(capturedPageUris: string): Promise<DraftData | null> {
  const key = draftKey(capturedPageUris)
  const filePath = `${DRAFT_DIR}${key}.json`

  try {
    const content = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.UTF8,
    })
    const data: DraftData = JSON.parse(content)

    // Expire drafts older than 1 hour
    const updated = new Date(data.updatedAt).getTime()
    const now = Date.now()
    if (now - updated > 60 * 60 * 1000) {
      await clearDraft(capturedPageUris)
      return null
    }

    return data
  } catch {
    // File doesn't exist or can't be read
    return null
  }
}

/**
 * Clear a specific draft.
 */
export async function clearDraft(capturedPageUris: string): Promise<void> {
  const key = draftKey(capturedPageUris)
  const filePath = `${DRAFT_DIR}${key}.json`

  try {
    await FileSystem.deleteAsync(filePath, { idempotent: true })
  } catch {
    // Ignore
  }
}
