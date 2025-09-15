import { useState, useEffect, useCallback } from 'react';
import type { Notification } from '@/types/console-history';

export const useHistory = () => {
  const [history, setHistory] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load history from API
  const loadHistory = useCallback(async () => {
    // Don't load during SSR/SSG
    if (typeof window === 'undefined') return;
    
    setLoading(true);
    
    try {
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
      } else if (response.status === 401) {
        // User not authenticated - this is expected, don't log error
        setHistory([]);
      } else {
        // Other errors should be logged
        console.error('Error loading history:', response.statusText);
        setHistory([]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load history on mount
  useEffect(() => {
    // Don't run during SSR/SSG
    if (typeof window === 'undefined') return;
    
    loadHistory();
  }, [loadHistory]);

  const addToHistory = async (item: Omit<Notification, 'id' | 'timestamp'>) => {
    // Don't add during SSR/SSG
    if (typeof window === 'undefined') return;
    
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
      } else if (response.status === 401) {
        // User not authenticated - silently fail
        // The UI will show the login prompt
      } else {
        console.error('Failed to save to history:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const clearHistory = async () => {
    // This function is kept for interface compatibility but doesn't do anything
    // since we no longer support clearing history from the client
    console.warn('clearHistory is deprecated - history can only be managed server-side');
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
    loading,
    addToHistory,
    clearHistory,
    getExplorerUrl
  };
};