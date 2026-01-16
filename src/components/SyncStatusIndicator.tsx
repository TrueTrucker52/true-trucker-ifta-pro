import { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { cn } from '@/lib/utils';

interface SyncStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

export const SyncStatusIndicator = ({ 
  className, 
  showLabel = true,
  compact = false 
}: SyncStatusIndicatorProps) => {
  const { isOnline, isSyncing, pendingCount, lastSyncTime, triggerSync } = useOfflineSync();
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  // Show success checkmark briefly after sync
  useEffect(() => {
    if (lastSyncTime && !isSyncing && pendingCount === 0) {
      setShowSyncSuccess(true);
      const timer = setTimeout(() => setShowSyncSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSyncTime, isSyncing, pendingCount]);

  const getStatusIcon = () => {
    if (isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (!isOnline) {
      return <CloudOff className="h-4 w-4 text-destructive" />;
    }
    if (showSyncSuccess) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    if (pendingCount > 0) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    return <Cloud className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (isSyncing) return 'Syncing...';
    if (!isOnline) return 'Offline';
    if (showSyncSuccess) return 'Synced!';
    if (pendingCount > 0) return `${pendingCount} pending`;
    return 'Online';
  };

  const getStatusColor = () => {
    if (isSyncing) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    if (!isOnline) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (showSyncSuccess) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (pendingCount > 0) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-1", className)}>
              {getStatusIcon()}
              {pendingCount > 0 && (
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingCount}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getStatusText()}</p>
            {pendingCount > 0 && isOnline && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="mt-1 w-full"
                onClick={triggerSync}
              >
                Sync Now
              </Button>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
        getStatusColor()
      )}>
        {getStatusIcon()}
        {showLabel && <span>{getStatusText()}</span>}
      </div>
      
      {pendingCount > 0 && isOnline && !isSyncing && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8"
                onClick={triggerSync}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Sync
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sync {pendingCount} pending item{pendingCount > 1 ? 's' : ''}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
