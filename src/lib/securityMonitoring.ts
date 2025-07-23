import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  event_type: 'auth_failure' | 'suspicious_activity' | 'rate_limit_exceeded';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, any>;
}

class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: SecurityEvent[] = [];
  private rateLimitMap = new Map<string, { count: number; lastReset: number }>();

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  // Log authentication failures
  logAuthFailure(email: string, error: string, userAgent?: string) {
    const event: SecurityEvent = {
      event_type: 'auth_failure',
      ip_address: this.getClientIP(),
      user_agent: userAgent || navigator.userAgent,
      details: {
        email,
        error: error.substring(0, 200), // Limit error message length
        timestamp: new Date().toISOString()
      }
    };

    this.recordEvent(event);
    console.warn('[SECURITY] Authentication failure:', { email, error: error.substring(0, 50) });
  }

  // Check for rate limiting
  checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    const current = this.rateLimitMap.get(key);

    if (!current || now - current.lastReset > windowMs) {
      this.rateLimitMap.set(key, { count: 1, lastReset: now });
      return false; // Not rate limited
    }

    if (current.count >= maxAttempts) {
      this.logSuspiciousActivity('rate_limit_exceeded', {
        identifier,
        attempts: current.count,
        windowMs
      });
      return true; // Rate limited
    }

    current.count++;
    return false;
  }

  // Log suspicious activities
  logSuspiciousActivity(type: string, details: Record<string, any>) {
    const event: SecurityEvent = {
      event_type: 'suspicious_activity',
      ip_address: this.getClientIP(),
      user_agent: navigator.userAgent,
      details: {
        type,
        ...details,
        timestamp: new Date().toISOString()
      }
    };

    this.recordEvent(event);
    console.warn('[SECURITY] Suspicious activity detected:', { type, details });
  }

  // Record security events
  private recordEvent(event: SecurityEvent) {
    this.events.push(event);
    
    // Keep only last 100 events in memory
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }

    // In a production environment, you would send this to a security monitoring service
    // For now, we'll just log to console
    if (event.event_type === 'auth_failure' || event.event_type === 'suspicious_activity') {
      this.sendToSecurityLog(event);
    }
  }

  // Send to security monitoring system (placeholder)
  private async sendToSecurityLog(event: SecurityEvent) {
    try {
      // In production, this would be sent to a security monitoring service
      // For now, we'll store in localStorage for demonstration
      const existingLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      existingLogs.push({
        ...event,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 50 security events
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      
      localStorage.setItem('security_logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Get client IP (limited in browser environment)
  private getClientIP(): string {
    // In a real application, this would be handled server-side
    return 'client-ip-not-available';
  }

  // Get recent security events for monitoring
  getRecentEvents(limit: number = 10): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  // Clear old events (for cleanup)
  clearOldEvents(olderThanMs: number = 24 * 60 * 60 * 1000) {
    const cutoff = Date.now() - olderThanMs;
    this.events = this.events.filter(event => {
      const eventTime = new Date(event.details.timestamp).getTime();
      return eventTime > cutoff;
    });
  }
}

export const securityMonitor = SecurityMonitor.getInstance();

// Validation helpers for preventing common security issues
export const validateAndSanitizeUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    // Only allow https and http protocols
    if (!['https:', 'http:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
};

export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  return { valid: true };
};
