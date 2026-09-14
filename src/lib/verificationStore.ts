import fs from 'fs';
import path from 'path';

export interface PendingRegistration {
  token: string;
  email: string;
  role: 'student' | 'teacher';
  name: string;
  userData: Record<string, any>;
  status: 'pending_verification' | 'verified';
  createdAt: number;
  expiresAt: number;
}

const STORE_FILE_PATH = path.join(process.cwd(), 'data', 'pending_registrations.json');

declare global {
  // eslint-disable-next-line no-var
  var __learngraph_pending_reg_map: Map<string, PendingRegistration> | undefined;
}

function loadPersistedStore(): Map<string, PendingRegistration> {
  const map = new Map<string, PendingRegistration>();
  try {
    if (fs.existsSync(STORE_FILE_PATH)) {
      const raw = fs.readFileSync(STORE_FILE_PATH, 'utf-8');
      const items: PendingRegistration[] = JSON.parse(raw);
      for (const item of items) {
        if (Date.now() < item.expiresAt) {
          map.set(item.token, item);
        }
      }
    }
  } catch (err) {
    console.error('Error reading pending registrations from disk:', err);
  }
  return map;
}

function persistStore(map: Map<string, PendingRegistration>): void {
  try {
    const dir = path.dirname(STORE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(Array.from(map.values()), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting pending registrations to disk:', err);
  }
}

const pendingMap: Map<string, PendingRegistration> =
  globalThis.__learngraph_pending_reg_map ?? loadPersistedStore();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__learngraph_pending_reg_map = pendingMap;
}

export function savePendingRegistration(
  token: string,
  email: string,
  role: 'student' | 'teacher',
  name: string,
  userData: Record<string, any>,
  ttlMs = 24 * 60 * 60 * 1000
): PendingRegistration {
  const record: PendingRegistration = {
    token,
    email: email.trim().toLowerCase(),
    role,
    name,
    userData,
    status: 'pending_verification',
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  };

  pendingMap.set(token, record);
  persistStore(pendingMap);
  return record;
}

export function getPendingRegistration(token: string): PendingRegistration | undefined {
  if (!token) return undefined;
  const record = pendingMap.get(token);
  if (!record) return undefined;

  if (Date.now() > record.expiresAt) {
    pendingMap.delete(token);
    persistStore(pendingMap);
    return undefined;
  }

  return record;
}

export function consumePendingRegistration(token: string): PendingRegistration | null {
  const record = getPendingRegistration(token);
  if (!record) return null;

  record.status = 'verified';
  pendingMap.delete(token);
  persistStore(pendingMap);
  return record;
}
