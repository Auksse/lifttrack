/**
 * localStorage helpers.
 *
 * All per-profile keys are namespaced `lifttrack_<userId>_<key>` so two
 * profiles on one device never read each other's data.
 */

export function userKey(userId, key) {
  return userId ? `lifttrack_${userId}_${key}` : `lifttrack_${key}`;
}

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    // Corrupt value — don't take the app down over it.
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    // Quota exceeded, or Safari private mode.
    console.error('[storage] write failed', key, err);
    return false;
  }
}

// ---- Profiles ---------------------------------------------------------

const USERS_KEY = 'lifttrack_users';
const CURRENT_KEY = 'lifttrack_current_user';

export function loadUsers() {
  const users = readJSON(USERS_KEY, []);
  return Array.isArray(users) ? users : [];
}

export function saveUsers(users) {
  writeJSON(USERS_KEY, users);
}

export function loadCurrentUserId() {
  return localStorage.getItem(CURRENT_KEY);
}

export function setCurrentUserId(id) {
  if (id) localStorage.setItem(CURRENT_KEY, id);
  else localStorage.removeItem(CURRENT_KEY);
}

// ---- Draft workout ----------------------------------------------------
// A workout in progress is persisted on every change so closing the app
// mid-session — or the OS reclaiming memory — never loses logged sets.

export function saveDraft(userId, workout) {
  if (!workout) localStorage.removeItem(userKey(userId, 'draft'));
  else writeJSON(userKey(userId, 'draft'), workout);
}

export function loadDraft(userId) {
  return readJSON(userKey(userId, 'draft'), null);
}

// ---- Settings ---------------------------------------------------------

export function loadSettings(userId) {
  return {
    haptics: true,
    sound: true,
    units: 'kg',
    ...readJSON(userKey(userId, 'settings'), {}),
  };
}

export function saveSettings(userId, settings) {
  writeJSON(userKey(userId, 'settings'), settings);
}
