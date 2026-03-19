import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Smartphone, Monitor } from 'lucide-react';

const Install = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">Install TrueTrucker</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        <div className="text-center">
          <div className="text-5xl mb-3">📲</div>
          <h2 className="text-xl font-bold">Install TrueTrucker on Your Phone</h2>
          <p className="text-sm text-muted-foreground mt-1">Get faster access right from your home screen</p>
        </div>

        {/* Android */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-5 w-5 text-emerald-500" />
              <h3 className="font-bold">Android (Chrome)</h3>
            </div>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="font-bold text-foreground">1.</span> Open Chrome browser</li>
              <li className="flex gap-2"><span className="font-bold text-foreground">2.</span> Go to <span className="font-medium text-foreground">true-trucker-ifta-pro.lovable.app</span></li>
              <li className="flex gap-2"><span className="font-bold text-foreground">3.</span> Tap the 3 dots menu ⋮</li>
              <li className="flex gap-2"><span className="font-bold text-foreground">4.</span> Tap "Add to Home Screen"</li>
              <li className="flex gap-2"><span className="font-bold text-foreground">5.</span> Tap "Install"</li>
              <li className="flex gap-2"><span className="font-bold text-foreground">6.</span> TrueTrucker appears on your home screen! ✅</li>
            </ol>
          </CardContent>
        </Card>

        {/* iOS */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-5 w-5 text-blue-500" />
              <h3 className="font-bold">iPhone (Safari)</h3>
            </div>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="font-bold text-foreground">1.</span> Open Safari browser</li>
              <li className="flex gap-2"><span className="font-bold text-foreground">2.</span> Go to <span className="font-medium text-foreground">true-trucker-ifta-pro.lovable.app</span></li>
              <li className="flex gap-2"><span className="font-bold text-foreground">3.</span> Tap the Share button ↗</li>
              <li className="flex gap-2"><span className="font-bold text-foreground">4.</span> Scroll down and tap "Add to Home Screen"</li>
              <li className="flex gap-2"><span className="font-bold text-foreground">5.</span> Tap "Add"</li>
              <li className="flex gap-2"><span className="font-bold text-foreground">6.</span> TrueTrucker appears on your home screen! ✅</li>
            </ol>
          </CardContent>
        </Card>

        {/* Desktop */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Desktop (Chrome/Edge)</h3>
            </div>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="font-bold text-foreground">1.</span> Look for the install icon in the address bar</li>
              <li className="flex gap-2"><span className="font-bold text-foreground">2.</span> Click "Install"</li>
              <li className="flex gap-2"><span className="font-bold text-foreground">3.</span> TrueTrucker opens as a standalone app! ✅</li>
            </ol>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground">Takes less than 30 seconds! 🚛</p>
      </div>
    </div>
  );
};

export default Install;
