const DB_NAME = 'madrasti-shabwah';
const STORE_NAME = 'pdfs';
const DB_VERSION = 1;

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('التخزين المحلي غير مدعوم في هذا المتصفح.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('تعذر فتح التخزين المحلي.'));
  });
}

export async function savePdf(id, file) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ id, file, savedAt: Date.now() });
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error('تعذر حفظ الملف.')); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error('تم إلغاء حفظ الملف.')); };
  });
}

export async function getPdf(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
    request.onsuccess = () => { const result = request.result; db.close(); resolve(result?.file || null); };
    request.onerror = () => { db.close(); reject(request.error || new Error('تعذر فتح الملف.')); };
  });
}

export async function removePdf(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error('تعذر حذف الملف المحفوظ.')); };
  });
}

export async function listSavedPdfIds() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAllKeys();
    request.onsuccess = () => { const keys = request.result; db.close(); resolve(keys); };
    request.onerror = () => { db.close(); reject(request.error || new Error('تعذر قراءة الملفات المحفوظة.')); };
  });
}
