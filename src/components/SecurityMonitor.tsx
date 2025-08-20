import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Eye } from 'lucide-react';
import { securityMonitor } from '@/lib/securityMonitoring';

interface SecurityEvent {
  event_type: 'auth_failure' | 'suspicious_activity' | 'rate_limit_exceeded';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, any>;
}

export default function SecurityMonitor() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateEvents = () => {
      setEvents(securityMonitor.getRecentEvents(10));
    };

    updateEvents();
    const interval = setInterval(updateEvents, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="flex items-center gap-2 bg-card text-card-foreground px-3 py-2 rounded-lg shadow-lg border hover:bg-accent"
        >
          <Shield className="h-4 w-4" />
          <span className="text-sm">Security</span>
          {events.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {events.length}
            </Badge>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="max-h-96 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Monitor
            </CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-64">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent security events</p>
          ) : (
            <div className="space-y-2">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-lg bg-muted/50"
                >
                  <AlertTriangle className="h-3 w-3 mt-0.5 text-destructive" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          event.event_type === 'auth_failure'
                            ? 'destructive'
                            : event.event_type === 'rate_limit_exceeded'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="text-xs"
                      >
                        {event.event_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {event.details.email || 'Unknown user'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.details.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}