import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { cn } from '@/lib/utils';

interface OfflineBannerProps {
  className?: string;
}

export const OfflineBanner = ({ className }: OfflineBannerProps) => {
  const { isOnline, isSyncing, pendingCount, triggerSync } = useOfflineSync();

  // Don't show banner if online and no pending items
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-2 text-sm",
      !isOnline 
        ? "bg-destructive/10 border-b border-destructive/20 text-destructive" 
        : isSyncing
          ? "bg-blue-500/10 border-b border-blue-500/20 text-blue-700 dark:text-blue-400"
          : "bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-700 dark:text-yellow-400",
      className
    )}>
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="font-medium">You're offline</span>
            <span className="text-muted-foreground">
              — Changes will be saved locally and synced when connection is restored
            </span>
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="font-medium">Syncing data...</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            <span className="font-medium">{pendingCount} item{pendingCount > 1 ? 's' : ''} pending sync</span>
          </>
        )}
      </div>
      
      {isOnline && pendingCount > 0 && !isSyncing && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={triggerSync}
          className="h-7 text-xs"
        >
          Sync Now
        </Button>
      )}
    </div>
  );
};
