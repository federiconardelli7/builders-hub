import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import type { Notification } from '@/types/console-history';

const LOCAL_STORAGE_KEY = 'console-history-local';

export const useHistory = () => {
  // Handle SSR/SSG - useSession might return undefined during build
  const sessionData = typeof window !== 'undefined' ? useSession() : null;
  const session = sessionData?.data ?? null;
  const status = sessionData?.status ?? 'unauthenticated';
  const [history, setHistory] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load history based on auth status
  const loadHistory = useCallback(async () => {
    // Don't load during SSR/SSG
    if (typeof window === 'undefined') return;
    
    setLoading(true);
    
    if (status === 'loading') return; // Wait for auth status
    
    try {
      if (session?.user) {
        // User is logged in - use database
        const response = await fetch('/api/console-history');
        if (response.ok) {
          const data = await response.json();
          const transformedHistory = data.map((item: any) => ({
            id: item.id,
            timestamp: new Date(item.created_at),
            status: item.status,
            title: item.title,
            description: item.description,
            eventType: item.event_type,
            data: item.data
          }));
          setHistory(transformedHistory);
        }
      } else {
        // User not logged in - use localStorage
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert stored timestamps back to Date objects
          const transformedHistory = parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
          setHistory(transformedHistory);
        }
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  // Load history when auth status changes
  useEffect(() => {
    // Don't run during SSR/SSG
    if (typeof window === 'undefined') return;
    
    loadHistory();
    
    // If user just logged in and has local history, offer to migrate it
    if (session?.user && status === 'authenticated') {
      const localHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localHistory) {
        // Clear local storage after login since user now uses database
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, [loadHistory, session, status]);

  const addToHistory = async (item: Omit<Notification, 'id' | 'timestamp'>) => {
    // Don't add during SSR/SSG
    if (typeof window === 'undefined') return;
    
    const newItem: Notification = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    if (session?.user) {
      // User is logged in - save to database
      try {
        const response = await fetch('/api/console-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: item.title,
            description: item.description,
            status: item.status,
            eventType: item.eventType,
            data: item.data
          })
        });

        if (response.ok) {
          const savedItem = await response.json();
          const dbItem: Notification = {
            id: savedItem.id,
            timestamp: new Date(savedItem.created_at),
            status: savedItem.status,
            title: savedItem.title,
            description: savedItem.description,
            eventType: savedItem.event_type,
            data: savedItem.data
          };
          setHistory(prev => [dbItem, ...prev]);
        }
      } catch (error) {
        console.error('Error saving to database:', error);
        // Fallback to local update
        setHistory(prev => [newItem, ...prev]);
      }
    } else {
      // User not logged in - save to localStorage
      const updated = [newItem, ...history];
      setHistory(updated);
      
      // Keep only last 100 items in localStorage
      const toStore = updated.slice(0, 100);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toStore));
    }
  };

  const clearHistory = () => {
    // Don't clear during SSR/SSG
    if (typeof window === 'undefined') return;
    
    // Only allow clearing localStorage history (for non-logged-in users)
    if (!session?.user) {
      setHistory([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const getExplorerUrl = (id: string, type: 'tx' | 'address', network: string, chain: string = 'P'): string => {
    const base = network === 'mainnet' 
      ? 'https://subnets.avax.network' 
      : 'https://subnets-test.avax.network';
    
    if (chain === 'P') {
      return `${base}/p-chain/${type}/${id}`;
    }
    return `${base}/c-chain/${type}/${id}`;
  };

  return {
    history,
    loading: loading || status === 'loading',
    addToHistory,
    clearHistory,
    getExplorerUrl,
    isUsingLocalStorage: !session?.user
  };
};