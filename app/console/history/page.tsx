"use client";

import { useSession } from 'next-auth/react';

import { useState, useMemo } from 'react';
import { useConsoleNotifications } from '@/hooks/use-console-notifications';
import type { Notification } from '@/types/console-history';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  ExternalLink,
  Copy,
  Check,
  Download,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/cn';

export default function ConsoleHistoryPage() {
  const { data: session, status } = useSession();
  const { history: fullHistory, clearHistory, getExplorerUrl, loading, isUsingLocalStorage } = useConsoleNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter history based on search
  const filteredHistory = useMemo(() => {
    if (!searchTerm) return fullHistory;
    
    const search = searchTerm.toLowerCase();
    return fullHistory.filter(notification => 
      notification.title.toLowerCase().includes(search) ||
      notification.description?.toLowerCase().includes(search) ||
      JSON.stringify(notification.data).toLowerCase().includes(search)
    );
  }, [fullHistory, searchTerm]);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredHistory, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `console-history-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getExplorerLink = (notification: Notification): string | null => {
    const data = notification.data as any;
    const network = data.network || 'testnet';
    
    // Helper to convert chain ID to chain identifier
    const getChainIdentifier = (chainId: string | undefined): string => {
      if (!chainId) return 'C';
      // C-Chain IDs: 43114 (mainnet), 43113 (testnet/fuji)
      if (chainId === '43114' || chainId === '43113') return 'C';
      // For other chains, return the chain ID itself
      return chainId;
    };
    
    // Check for transaction IDs/hashes
    if (data.txID) {
      return getExplorerUrl(data.txID, 'tx', network, 'P');
    }
    if (data.txHash) {
      const chain = getChainIdentifier(data.chainID);
      return getExplorerUrl(data.txHash, 'tx', network, chain);
    }
    
    // Check for contract addresses
    if (data.contractAddress) {
      const chain = getChainIdentifier(data.chainID);
      return getExplorerUrl(data.contractAddress, 'address', network, chain);
    }
    
    // For subnet/chain creation, use the ID as transaction ID
    if (data.subnetID && (notification.eventType === 'subnet_created')) {
      return getExplorerUrl(data.subnetID, 'tx', network, 'P');
    }
    if (data.blockchainID && (notification.eventType === 'chain_created')) {
      return getExplorerUrl(data.blockchainID, 'tx', network, 'P');
    }
    if (data.txID && (notification.eventType === 'l1_conversion')) {
      return getExplorerUrl(data.txID, 'tx', network, 'P');
    }
    
    return null;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Simple Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">
          History {isUsingLocalStorage && <span className="text-sm text-muted-foreground ml-2">(Local)</span>}
        </h1>
        {fullHistory.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              disabled={filteredHistory.length === 0}
              title="Export history as JSON"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {isUsingLocalStorage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (confirm('Clear local history? This cannot be undone.')) {
                    await clearHistory();
                  }
                }}
                title="Clear local history"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Simple Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* History List */}
      {status === 'loading' || loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {fullHistory.length === 0 
              ? "No history yet"
              : "No results found"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredHistory.map((notification) => {
            const explorerUrl = getExplorerLink(notification);
            const data = notification.data as any;
            
            // Extract the main identifier (tx hash, address, etc)
            const mainId = data.txHash || data.txID || data.contractAddress || data.subnetID || data.blockchainID;
            const mainIdStr = mainId ? String(mainId) : '';
            const shortId = mainIdStr.length > 14 ? `${mainIdStr.slice(0, 8)}...${mainIdStr.slice(-6)}` : mainIdStr;
            
            return (
              <div
                key={notification.id}
                className={cn(
                  "p-4 rounded-lg border bg-card/50 transition-all",
                  explorerUrl && "hover:bg-card cursor-pointer",
                  notification.status === 'error' && "border-destructive/20"
                )}
                onClick={(e) => {
                  if (explorerUrl && !(e.target as HTMLElement)?.closest('button')) {
                    window.open(explorerUrl, '_blank');
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-sm font-medium",
                        notification.status === 'error' && "text-destructive"
                      )}>
                        {notification.title}
                      </span>
                      {data.network && (
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded-full font-medium",
                          data.network === 'mainnet' 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        )}>
                          {data.network === 'mainnet' ? 'Mainnet' : 'Testnet'}
                        </span>
                      )}
                      {shortId && (
                        <code className="text-xs text-muted-foreground font-mono">
                          {shortId}
                        </code>
                      )}
                    </div>
                    {notification.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(notification.timestamp), 'HH:mm')}
                    </span>
                    {mainIdStr && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(mainIdStr, notification.id);
                        }}
                        className="p-1 hover:bg-accent rounded transition-colors"
                        title="Copy"
                      >
                        {copiedId === notification.id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        )}
                      </button>
                    )}
                    {explorerUrl && (
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Info message about storage */}
      {isUsingLocalStorage && fullHistory.length > 0 && (
        <div className="mt-8 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <p>
            ℹ️ History is currently stored locally in your browser. 
            <span className="text-foreground"> Sign in</span> to save history to your account and access it across devices.
          </p>
        </div>
      )}
    </div>
  );
}

