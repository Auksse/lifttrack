/**
 * Backup nudging.
 *
 * All training data lives in IndexedDB on one device. iOS treats a
 * home-screen web app's storage as disposable: removing the icon deletes
 * the container, and the system can evict storage under pressure. There is
 * no server copy to fall back on.
 *
 * So the app has to actively push the user to get a copy off the device.
 * Exported JSON saved to Files lands in iCloud Drive, which survives all
 * of the above.
 *
 * This is a stopgap. The real fix is the cloud sync the repository
 * interface was built to accept.
 */

import { userKey, readJSON, writeJSON } from '../state/storage.js';

/** Nudge once this many sessions have been logged since the last export. */
const SESSIONS_BEFORE_NUDGE = 4;

/** …or this long, whichever comes first. */
const DAYS_BEFORE_NUDGE = 21;
const DAY_MS = 86_400_000;

function stateKey(userId) {
  return userKey(userId, 'backup_state');
}

export function loadBackupState(userId) {
  return readJSON(stateKey(userId), { lastExportAt: null, sessionsAtExport: 0 });
}

export function recordExport(userId, sessionCount) {
  writeJSON(stateKey(userId), {
    lastExportAt: Date.now(),
    sessionsAtExport: sessionCount,
  });
}

/**
 * Should we prompt for a backup?
 * @returns {{due: boolean, reason: 'never'|'sessions'|'age'|null, newSessions: number}}
 */
export function backupStatus(userId, sessionCount) {
  if (sessionCount === 0) return { due: false, reason: null, newSessions: 0 };

  const { lastExportAt, sessionsAtExport } = loadBackupState(userId);
  const newSessions = Math.max(0, sessionCount - (sessionsAtExport || 0));

  if (!lastExportAt) {
    return {
      due: sessionCount >= SESSIONS_BEFORE_NUDGE,
      reason: 'never',
      newSessions: sessionCount,
    };
  }
  if (newSessions >= SESSIONS_BEFORE_NUDGE) {
    return { due: true, reason: 'sessions', newSessions };
  }
  if (Date.now() - lastExportAt > DAYS_BEFORE_NUDGE * DAY_MS && newSessions > 0) {
    return { due: true, reason: 'age', newSessions };
  }
  return { due: false, reason: null, newSessions };
}

/**
 * Hand the export to the OS share sheet where available, so it can be saved
 * straight to Files/iCloud Drive. Falls back to a normal download.
 *
 * Returns true if the user completed the share/download, false if they
 * dismissed it — the caller should only record a successful export.
 */
export async function shareBackup(payload, filename) {
  const json = JSON.stringify(payload, null, 2);
  const file = new File([json], filename, { type: 'application/json' });

  // canShare({files}) is the only reliable feature test; Safari throws on
  // share() with files it will not accept.
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return true;
    } catch (err) {
      // AbortError means the user dismissed the sheet; anything else and we
      // fall through to the download path rather than losing the export.
      if (err?.name === 'AbortError') return false;
    }
  }

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}
