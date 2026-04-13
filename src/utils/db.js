import { openDB } from 'idb';

const DB_NAME = 'mind-orbit-db';
const DB_VERSION = 1;
const STORE_NAME = 'mindmaps';

let dbPromise;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt');
        }
      },
    });
  }

  return dbPromise;
}

export async function getAllMaps() {
  const db = await getDb();
  const maps = await db.getAll(STORE_NAME);
  return maps.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

export async function getMap(id) {
  const db = await getDb();
  return db.get(STORE_NAME, id);
}

export async function putMap(map) {
  const db = await getDb();
  const now = Date.now();
  const normalizedMap = {
    ...map,
    createdAt: map.createdAt ?? now,
    updatedAt: now,
  };

  await db.put(STORE_NAME, normalizedMap);
  return normalizedMap;
}

export async function deleteMap(id) {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

