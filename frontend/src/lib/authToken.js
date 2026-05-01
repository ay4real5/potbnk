let memoryToken = null;

function safeGet(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage, key, value) {
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemove(storage, key) {
  try {
    storage.removeItem(key);
  } catch {
    // no-op
  }
}

export function getAuthToken() {
  return (
    memoryToken ||
    safeGet(localStorage, 'token') ||
    safeGet(sessionStorage, 'token') ||
    null
  );
}

export function setAuthToken(token) {
  memoryToken = token;
  const wroteLocal = safeSet(localStorage, 'token', token);
  if (!wroteLocal) {
    safeSet(sessionStorage, 'token', token);
  }
}

export function clearAuthToken() {
  memoryToken = null;
  safeRemove(localStorage, 'token');
  safeRemove(sessionStorage, 'token');
}
