import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Types for offline queue items
interface OfflineQueueItem {
  id: string;
  type: 'trip' | 'receipt' | 'trip_log';
  data: any;
  createdAt: string;
  retryCount: number;
}

interface OfflineQueue {
  items: OfflineQueueItem[];
  lastSyncAttempt: string | null;
}

const STORAGE_KEY = 'truetrucker_offline_queue';
const MAX_RETRY_COUNT = 3;

export const useOfflineSync = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Load queue from localStorage
  const getQueue = useCallback((): OfflineQueue => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
    return { items: [], lastSyncAttempt: null };
  }, []);

  // Save queue to localStorage
  const saveQueue = useCallback((queue: OfflineQueue) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      setPendingCount(queue.items.length);
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }, []);

  // Add item to offline queue
  const addToQueue = useCallback((type: OfflineQueueItem['type'], data: any): string => {
    const queue = getQueue();
    const id = crypto.randomUUID();
    
    const newItem: OfflineQueueItem = {
      id,
      type,
      data: { ...data, user_id: user?.id },
      createdAt: new Date().toISOString(),
      retryCount: 0
    };
    
    queue.items.push(newItem);
    saveQueue(queue);
    
    toast({
      title: "Saved Offline",
      description: `Your ${type.replace('_', ' ')} has been saved locally and will sync when online.`,
    });
    
    return id;
  }, [getQueue, saveQueue, user?.id, toast]);

  // Remove item from queue
  const removeFromQueue = useCallback((id: string) => {
    const queue = getQueue();
    queue.items = queue.items.filter(item => item.id !== id);
    saveQueue(queue);
  }, [getQueue, saveQueue]);

  // Sync a single trip to Supabase
  const syncTrip = async (item: OfflineQueueItem): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('trips')
        .insert([item.data]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error syncing trip:', error);
      return false;
    }
  };

  // Sync a single receipt to Supabase
  const syncReceipt = async (item: OfflineQueueItem): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('receipts')
        .insert([item.data]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error syncing receipt:', error);
      return false;
    }
  };

  // Sync a single trip log to Supabase
  const syncTripLog = async (item: OfflineQueueItem): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('trip_logs')
        .insert([item.data]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error syncing trip log:', error);
      return false;
    }
  };

  // Process the offline queue
  const processQueue = useCallback(async () => {
    if (!isOnline || !user || isSyncing) return;
    
    const queue = getQueue();
    if (queue.items.length === 0) return;

    setIsSyncing(true);
    let syncedCount = 0;
    let failedCount = 0;

    for (const item of [...queue.items]) {
      let success = false;

      switch (item.type) {
        case 'trip':
          success = await syncTrip(item);
          break;
        case 'receipt':
          success = await syncReceipt(item);
          break;
        case 'trip_log':
          success = await syncTripLog(item);
          break;
      }

      if (success) {
        removeFromQueue(item.id);
        syncedCount++;
      } else {
        // Increment retry count
        const currentQueue = getQueue();
        const itemIndex = currentQueue.items.findIndex(i => i.id === item.id);
        if (itemIndex !== -1) {
          currentQueue.items[itemIndex].retryCount++;
          
          // Remove if max retries exceeded
          if (currentQueue.items[itemIndex].retryCount >= MAX_RETRY_COUNT) {
            currentQueue.items.splice(itemIndex, 1);
            failedCount++;
          }
          
          saveQueue(currentQueue);
        }
      }
    }

    setIsSyncing(false);
    setLastSyncTime(new Date());

    // Update queue state
    const updatedQueue = getQueue();
    updatedQueue.lastSyncAttempt = new Date().toISOString();
    saveQueue(updatedQueue);

    // Show toast with results
    if (syncedCount > 0 || failedCount > 0) {
      if (syncedCount > 0 && failedCount === 0) {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${syncedCount} item${syncedCount > 1 ? 's' : ''}.`,
        });
      } else if (failedCount > 0) {
        toast({
          title: "Sync Partially Complete",
          description: `Synced ${syncedCount} item(s), ${failedCount} failed after retries.`,
          variant: "destructive",
        });
      }
    }
  }, [isOnline, user, isSyncing, getQueue, removeFromQueue, saveQueue, toast]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Connection restored. Syncing pending data...",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're Offline",
        description: "Data will be saved locally and synced when connection is restored.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial queue count
    setPendingCount(getQueue().items.length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [getQueue, toast]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && user) {
      const timer = setTimeout(() => {
        processQueue();
      }, 2000); // Wait 2 seconds after coming online

      return () => clearTimeout(timer);
    }
  }, [isOnline, user, processQueue]);

  // Wrapper function to save data (tries Supabase first, falls back to offline queue)
  const saveWithOfflineSupport = useCallback(async (
    type: OfflineQueueItem['type'],
    data: any,
    onlineAction: () => Promise<{ success: boolean; data?: any; error?: any }>
  ): Promise<{ success: boolean; offline: boolean; data?: any }> => {
    if (!isOnline) {
      const id = addToQueue(type, data);
      return { success: true, offline: true, data: { id, ...data } };
    }

    try {
      const result = await onlineAction();
      
      if (result.success) {
        return { success: true, offline: false, data: result.data };
      } else {
        // If online action failed, try to save offline
        const id = addToQueue(type, data);
        return { success: true, offline: true, data: { id, ...data } };
      }
    } catch (error) {
      // Network error - save offline
      const id = addToQueue(type, data);
      return { success: true, offline: true, data: { id, ...data } };
    }
  }, [isOnline, addToQueue]);

  // Manual sync trigger
  const triggerSync = useCallback(() => {
    if (isOnline) {
      processQueue();
    }
  }, [isOnline, processQueue]);

  // Clear the entire queue
  const clearQueue = useCallback(() => {
    saveQueue({ items: [], lastSyncAttempt: null });
  }, [saveQueue]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncTime,
    addToQueue,
    saveWithOfflineSupport,
    triggerSync,
    clearQueue,
    processQueue
  };
};
