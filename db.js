// ── VStok IndexedDB ──────────────────────────────────────────────
// Tablolar: depolar → alanlar → urunler

const DB_NAME    = 'vstok_db';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = e => {
      const db = e.target.result;

      // depolar
      if (!db.objectStoreNames.contains('depolar')) {
        const s = db.createObjectStore('depolar', { keyPath: 'id', autoIncrement: true });
        s.createIndex('uid', 'uid', { unique: false });
      }

      // alanlar
      if (!db.objectStoreNames.contains('alanlar')) {
        const s = db.createObjectStore('alanlar', { keyPath: 'id', autoIncrement: true });
        s.createIndex('depo_id', 'depo_id', { unique: false });
      }

      // urunler
      if (!db.objectStoreNames.contains('urunler')) {
        const s = db.createObjectStore('urunler', { keyPath: 'id', autoIncrement: true });
        s.createIndex('alan_id', 'alan_id', { unique: false });
      }
    };

    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

// ── Depolar ──────────────────────────────────────────────────────

export async function depoEkle(uid, ad) {
  const db  = await openDB();
  const tx  = db.transaction('depolar', 'readwrite');
  const id  = await new Promise((res, rej) => {
    const req = tx.objectStore('depolar').add({
      uid,
      ad,
      olusturma_tarihi: Date.now()
    });
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e.target.error);
  });
  return id;
}

export async function depolariGetir(uid) {
  const db = await openDB();
  const tx = db.transaction('depolar', 'readonly');
  return new Promise((res, rej) => {
    const req = tx.objectStore('depolar').index('uid').getAll(uid);
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e.target.error);
  });
}

export async function depoSil(id) {
  const db = await openDB();
  const tx = db.transaction('depolar', 'readwrite');
  return new Promise((res, rej) => {
    const req = tx.objectStore('depolar').delete(id);
    req.onsuccess = () => res();
    req.onerror   = e => rej(e.target.error);
  });
}

// ── Alanlar ──────────────────────────────────────────────────────

export async function alanEkle(depo_id, ad) {
  const db = await openDB();
  const tx = db.transaction('alanlar', 'readwrite');
  return new Promise((res, rej) => {
    const req = tx.objectStore('alanlar').add({
      depo_id,
      ad,
      olusturma_tarihi: Date.now()
    });
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e.target.error);
  });
}

export async function alanlariGetir(depo_id) {
  const db = await openDB();
  const tx = db.transaction('alanlar', 'readonly');
  return new Promise((res, rej) => {
    const req = tx.objectStore('alanlar').index('depo_id').getAll(depo_id);
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e.target.error);
  });
}

export async function alanSil(id) {
  const db = await openDB();
  const tx = db.transaction('alanlar', 'readwrite');
  return new Promise((res, rej) => {
    const req = tx.objectStore('alanlar').delete(id);
    req.onsuccess = () => res();
    req.onerror   = e => rej(e.target.error);
  });
}

// ── Ürünler ──────────────────────────────────────────────────────

export async function urunEkle(alan_id, { ad, miktar, birim, skt = null, notlar = '' }) {
  const db = await openDB();
  const tx = db.transaction('urunler', 'readwrite');
  return new Promise((res, rej) => {
    const req = tx.objectStore('urunler').add({
      alan_id,
      ad,
      miktar,
      birim,
      skt,
      notlar,
      olusturma_tarihi: Date.now()
    });
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e.target.error);
  });
}

export async function urunleriGetir(alan_id) {
  const db = await openDB();
  const tx = db.transaction('urunler', 'readonly');
  return new Promise((res, rej) => {
    const req = tx.objectStore('urunler').index('alan_id').getAll(alan_id);
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e.target.error);
  });
}

export async function urunGuncelle(id, degisiklikler) {
  const db  = await openDB();
  const tx  = db.transaction('urunler', 'readwrite');
  const store = tx.objectStore('urunler');
  return new Promise((res, rej) => {
    const getReq = store.get(id);
    getReq.onsuccess = e => {
      const urun = { ...e.target.result, ...degisiklikler };
      const putReq = store.put(urun);
      putReq.onsuccess = () => res();
      putReq.onerror   = e => rej(e.target.error);
    };
    getReq.onerror = e => rej(e.target.error);
  });
}

export async function urunSil(id) {
  const db = await openDB();
  const tx = db.transaction('urunler', 'readwrite');
  return new Promise((res, rej) => {
    const req = tx.objectStore('urunler').delete(id);
    req.onsuccess = () => res();
    req.onerror   = e => rej(e.target.error);
  });
}
