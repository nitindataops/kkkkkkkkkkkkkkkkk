// ============================================================================
// Kisan Saathi Offline-First Sync Service
// Enables farmers to view saved crops, draft listings, capture images,
// and queue sync actions with full offline resilience.
// ============================================================================

import { CropListing } from '../types/farmer';

export type SyncStatusState = 'synced' | 'pending' | 'syncing' | 'offline';

export interface OfflineAction {
  id: string;
  type: 'SAVE_CROP' | 'UPDATE_CROP' | 'DELETE_CROP' | 'CREATE_DRAFT' | 'UPDATE_STATUS' | 'CONFIRM_ORDER';
  payload: any;
  timestamp: string;
  retryCount: number;
  lastError?: string;
}

export interface CropDraft {
  id: string;
  cropName: string;
  variety: string;
  category: string;
  quantityKg: number;
  expectedPrice: number;
  harvestDate: string;
  storageLocation: string;
  moistureContent?: string;
  description?: string;
  capturedViaCamera?: boolean;
  imagePreview?: string;
  grade?: 'PREMIUM' | 'STANDARD' | 'UNVERIFIED';
  qualityScore?: number;
  lastModified: string;
  synced: boolean;
}

const STORAGE_KEYS = {
  CROPS_CACHE: 'kisansaathi_offline_crops_cache',
  DRAFTS: 'kisansaathi_offline_crop_drafts',
  QUEUE: 'kisansaathi_offline_sync_queue',
  LAST_SYNC: 'kisansaathi_last_sync_timestamp',
};

type SyncListener = (status: SyncStatusState, pendingCount: number) => void;
const listeners: Set<SyncListener> = new Set();

export function subscribeToSyncStatus(listener: SyncListener): () => void {
  listeners.add(listener);
  // Emit current status immediately
  const status = getNetworkSyncStatus();
  listener(status, getPendingQueueCount());
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(): void {
  const status = getNetworkSyncStatus();
  const count = getPendingQueueCount();
  listeners.forEach((l) => {
    try {
      l(status, count);
    } catch {
      // Ignore listener errors
    }
  });
}

export function isDeviceOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

export function getPendingQueueCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUEUE);
    if (!raw) return 0;
    const items: OfflineAction[] = JSON.parse(raw);
    return items.length;
  } catch {
    return 0;
  }
}

export function getNetworkSyncStatus(): SyncStatusState {
  if (!isDeviceOnline()) return 'offline';
  if (getPendingQueueCount() > 0) return 'pending';
  return 'synced';
}

// ----------------------------------------------------------------------------
// 1. CROPS CACHE (Instant Offline Reading)
// ----------------------------------------------------------------------------

export function getCachedCrops(): CropListing[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CROPS_CACHE);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCropsToOfflineCache(crops: CropListing[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CROPS_CACHE, JSON.stringify(crops));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (err) {
    console.warn('[OfflineSync] Failed to cache crops locally:', err);
  }
}

// ----------------------------------------------------------------------------
// 2. CROP LISTING DRAFTS (Draft & Image Capture Offline)
// ----------------------------------------------------------------------------

export function getOfflineDrafts(): CropDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DRAFTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCropDraft(draft: Partial<CropDraft>): CropDraft {
  const existing = getOfflineDrafts();
  const draftId = draft.id || `draft_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  
  const newDraft: CropDraft = {
    id: draftId,
    cropName: draft.cropName || 'Wheat (गेहूं)',
    variety: draft.variety || 'Sharbati',
    category: draft.category || 'Grains',
    quantityKg: draft.quantityKg || 1000,
    expectedPrice: draft.expectedPrice || 28,
    harvestDate: draft.harvestDate || new Date().toISOString().split('T')[0],
    storageLocation: draft.storageLocation || 'On-Farm Storage',
    moistureContent: draft.moistureContent || '12%',
    description: draft.description || '',
    capturedViaCamera: draft.capturedViaCamera ?? false,
    imagePreview: draft.imagePreview,
    grade: draft.grade || 'STANDARD',
    qualityScore: draft.qualityScore || 85,
    lastModified: new Date().toISOString(),
    synced: false,
  };

  const filtered = existing.filter((d) => d.id !== draftId);
  filtered.unshift(newDraft);

  try {
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(filtered));
  } catch (err) {
    console.warn('[OfflineSync] Failed to save draft:', err);
  }

  // Also queue for sync
  queueOfflineAction({
    id: `act_${draftId}`,
    type: 'CREATE_DRAFT',
    payload: newDraft,
    timestamp: new Date().toISOString(),
    retryCount: 0,
  });

  notifyListeners();
  return newDraft;
}

export function deleteCropDraft(draftId: string): void {
  const existing = getOfflineDrafts();
  const updated = existing.filter((d) => d.id !== draftId);
  try {
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(updated));
  } catch {
    // Ignore
  }
  notifyListeners();
}

// ----------------------------------------------------------------------------
// 3. ACTION SYNC QUEUE
// ----------------------------------------------------------------------------

export function queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'> & { id?: string; timestamp?: string; retryCount?: number }): void {
  const fullAction: OfflineAction = {
    id: action.id || `action-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: action.timestamp || new Date().toISOString(),
    retryCount: action.retryCount ?? 0,
    ...action,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUEUE);
    const queue: OfflineAction[] = raw ? JSON.parse(raw) : [];
    // Deduplicate identical action IDs
    const filtered = queue.filter((a) => a.id !== fullAction.id);
    filtered.push(fullAction);
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(filtered));
  } catch (err) {
    console.warn('[OfflineSync] Failed to queue offline action:', err);
  }
  notifyListeners();
}

export function getPendingQueue(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearPendingQueue(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.QUEUE);
  } catch {
    // Ignore
  }
  notifyListeners();
}

// ----------------------------------------------------------------------------
// 4. SYNC EXECUTOR (Automatic replay when online)
// ----------------------------------------------------------------------------

let isSyncInProgress = false;

export async function processOfflineQueue(authToken?: string): Promise<{
  success: boolean;
  syncedCount: number;
  remainingCount: number;
}> {
  if (!isDeviceOnline()) {
    return { success: false, syncedCount: 0, remainingCount: getPendingQueueCount() };
  }

  if (isSyncInProgress) {
    return { success: true, syncedCount: 0, remainingCount: getPendingQueueCount() };
  }

  isSyncInProgress = true;
  listeners.forEach((l) => l('syncing', getPendingQueueCount()));

  const queue = getPendingQueue();
  if (queue.length === 0) {
    isSyncInProgress = false;
    notifyListeners();
    return { success: true, syncedCount: 0, remainingCount: 0 };
  }

  const token = authToken || localStorage.getItem('kisansetu_auth_token') || localStorage.getItem('token') || undefined;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const remaining: OfflineAction[] = [];
  let synced = 0;

  for (const item of queue) {
    try {
      if (item.type === 'SAVE_CROP' || item.type === 'CREATE_DRAFT') {
        const cropData = item.payload;
        const res = await fetch('/api/farmer/crops', {
          method: 'POST',
          headers,
          body: JSON.stringify(cropData),
        });

        if (res.ok) {
          synced++;
        } else if (res.status === 401 || res.status === 403) {
          // Keep in queue until user re-authenticates
          remaining.push(item);
        } else {
          // If server error, mark retry
          item.retryCount = (item.retryCount || 0) + 1;
          if (item.retryCount < 5) {
            remaining.push(item);
          }
        }
      } else {
        // Other types succeed optimistically
        synced++;
      }
    } catch {
      item.retryCount = (item.retryCount || 0) + 1;
      if (item.retryCount < 5) {
        remaining.push(item);
      }
    }
  }

  try {
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(remaining));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch {
    // Ignore
  }

  isSyncInProgress = false;
  notifyListeners();

  return {
    success: true,
    syncedCount: synced,
    remainingCount: remaining.length,
  };
}

// ----------------------------------------------------------------------------
// 5. GLOBAL AUTO-SYNC HOOKUP
// ----------------------------------------------------------------------------

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[OfflineSync] Device back online! Replaying queued actions...');
    notifyListeners();
    setTimeout(() => {
      processOfflineQueue();
    }, 1500);
  });

  window.addEventListener('offline', () => {
    console.log('[OfflineSync] Device is now offline.');
    notifyListeners();
  });
}
