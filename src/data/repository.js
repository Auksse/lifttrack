/**
 * Data access boundary.
 *
 * Everything above this file talks to `SessionRepository` and never touches
 * IndexedDB directly. That is the whole point: today the only implementation
 * is local, but adding cloud sync later means writing a second implementation
 * and swapping it at `getRepository()` — no screen code changes.
 *
 * Contract every implementation must honour:
 *   list()              → Promise<Session[]>  sorted by date ascending
 *   add(session)        → Promise<Session>    assigns id if absent
 *   update(id, patch)   → Promise<Session>
 *   remove(id)          → Promise<void>
 *   bulkPut(sessions)   → Promise<void>
 *   clear()             → Promise<void>
 *
 * A Session is:
 *   { id, date: 'YYYY-MM-DD', focus, exercises: Exercise[], updatedAt }
 * An Exercise is:
 *   { name, sets: [{ r, w, done? }], ss?: boolean }
 */

const DB_VERSION = 2;
const STORE = 'sessions';

function dbNameFor(userId) {
  return userId ? `lifttrack_${userId}` : 'lifttrack';
}

/**
 * Open (and if needed upgrade) the IndexedDB database for one user.
 * v1 → v2 adds the `updatedAt` index that sync will need to resolve
 * conflicts; existing rows are backfilled during the upgrade so no
 * previously logged session is lost.
 */
function openDatabase(userId) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbNameFor(userId), DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      const tx = event.target.transaction;

      let store;
      if (!db.objectStoreNames.contains(STORE)) {
        store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
      } else {
        store = tx.objectStore(STORE);
      }

      if (!store.indexNames.contains('updatedAt')) {
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        // Backfill so the new index is populated for pre-existing rows.
        store.openCursor().onsuccess = (e) => {
          const cursor = e.target.result;
          if (!cursor) return;
          const row = cursor.value;
          if (!row.updatedAt) {
            row.updatedAt = new Date(`${row.date}T12:00:00`).getTime() || Date.now();
            cursor.update(row);
          }
          cursor.continue();
        };
      }
    };

    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

/** Promisify a single IndexedDB transaction. */
function runTx(db, mode, fn) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    let result;
    try {
      result = fn(store);
    } catch (err) {
      reject(err);
      return;
    }
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function getAll(store) {
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = (e) => resolve(e.target.result || []);
    req.onerror = (e) => reject(e.target.error);
  });
}

/** Local IndexedDB-backed implementation. */
class LocalSessionRepository {
  constructor(userId) {
    this.userId = userId;
    this._db = null;
  }

  async _open() {
    if (!this._db) this._db = await openDatabase(this.userId);
    return this._db;
  }

  async list() {
    const db = await this._open();
    const tx = db.transaction(STORE, 'readonly');
    const rows = await getAll(tx.objectStore(STORE));
    return rows
      .map((r) => ({ ...r, exercises: r.exercises || [] }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async add(session) {
    const db = await this._open();
    const record = {
      ...session,
      id: session.id || crypto.randomUUID(),
      updatedAt: Date.now(),
    };
    await runTx(db, 'readwrite', (store) => store.put(record));
    return record;
  }

  async update(id, patch) {
    const db = await this._open();
    const existing = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
    if (!existing) throw new Error(`Session ${id} not found`);
    const record = { ...existing, ...patch, id, updatedAt: Date.now() };
    await runTx(db, 'readwrite', (store) => store.put(record));
    return record;
  }

  async remove(id) {
    const db = await this._open();
    await runTx(db, 'readwrite', (store) => store.delete(id));
  }

  async bulkPut(sessions) {
    const db = await this._open();
    await runTx(db, 'readwrite', (store) => {
      sessions.forEach((s) =>
        store.put({
          ...s,
          id: s.id || crypto.randomUUID(),
          updatedAt: s.updatedAt || Date.now(),
        }),
      );
    });
  }

  async clear() {
    const db = await this._open();
    await runTx(db, 'readwrite', (store) => store.clear());
  }

  close() {
    if (this._db) {
      this._db.close();
      this._db = null;
    }
  }
}

let active = null;

/**
 * Get the repository for a user, reusing the open connection when the
 * user has not changed. Switching users closes the previous database.
 */
export function getRepository(userId) {
  if (active && active.userId === userId) return active;
  if (active) active.close();
  active = new LocalSessionRepository(userId);
  return active;
}

export function closeRepository() {
  if (active) {
    active.close();
    active = null;
  }
}
