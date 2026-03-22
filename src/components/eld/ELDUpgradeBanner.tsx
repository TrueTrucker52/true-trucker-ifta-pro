import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ELD_CHECKOUT_LINKS, ELD_DISMISS_KEY, ELD_DISMISS_MS } from '@/lib/eldUpgrade';

export const ELDUpgradeBanner = () => {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const until = Number(localStorage.getItem(ELD_DISMISS_KEY) || '0');
    setDismissed(until > Date.now());
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(ELD_DISMISS_KEY, String(Date.now() + ELD_DISMISS_MS));
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-foreground">⚖️ Stay DOT Compliant</h3>
          <p className="text-sm text-muted-foreground">Add ELD compliance to your account — $10/truck/month.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <a href={ELD_CHECKOUT_LINKS.monthly} target="_blank" rel="noreferrer">Upgrade to ELD</a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href="/pricing#eld-addon">Learn More</a>
          </Button>
          <Button size="icon" variant="ghost" onClick={handleDismiss} aria-label="Dismiss ELD banner">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ELDUpgradeBanner;