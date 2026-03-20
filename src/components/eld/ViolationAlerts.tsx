import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HOSViolation } from '@/hooks/useHOSEngine';
import { AlertTriangle, AlertOctagon, Info } from 'lucide-react';

interface Props {
  violations: HOSViolation[];
}

const ViolationAlerts: React.FC<Props> = ({ violations }) => {
  if (violations.length === 0) return null;

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertOctagon className="h-5 w-5 animate-pulse" />;
      case 'major': return <AlertOctagon className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getVariant = (severity: string) => {
    return severity === 'critical' || severity === 'major' ? 'destructive' as const : 'default' as const;
  };

  return (
    <div className="space-y-2">
      {violations.map((v, i) => (
        <Alert key={i} variant={getVariant(v.severity)} className={v.severity === 'critical' ? 'animate-pulse border-2' : ''}>
          {getIcon(v.severity)}
          <AlertTitle className="uppercase text-xs font-bold">
            {v.severity === 'critical' ? '🚨 ' : v.severity === 'major' ? '🔴 ' : '⚠️ '}
            HOS {v.severity.toUpperCase()}
          </AlertTitle>
          <AlertDescription className="text-sm">{v.detail}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default ViolationAlerts;
