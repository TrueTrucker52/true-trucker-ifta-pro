import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTrialConversion } from '@/hooks/useTrialConversion';
import { useSubscription } from '@/hooks/useSubscription';
import { Target, Check, ArrowRight } from 'lucide-react';

const PersonalizedRecommendation: React.FC = () => {
  const { tracking, getRecommendedPlan } = useTrialConversion();
  const { trial_active, subscribed, createCheckout } = useSubscription();

  if (subscribed || !trial_active) return null;

  const recommended = getRecommendedPlan();
  const features = tracking.featuresUsed;

  const usageHighlights = [
    features['truck_added'] && `You tracked ${features['truck_added']} truck${features['truck_added'] > 1 ? 's' : ''} this trial`,
    features['eld_status_change'] && `You used ELD compliance ${features['eld_status_change']} times`,
    features['bol_scan'] && `You scanned ${features['bol_scan']} BOLs`,
    features['mileage_logged'] && `You logged ${features['mileage_logged']}+ miles`,
    features['voice_command'] && `You used Hey Trucker ${features['voice_command']} times`,
    features['ifta_report'] && `You generated ${features['ifta_report']} IFTA reports`,
  ].filter(Boolean);

  if (usageHighlights.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-5 w-5 text-primary" /> Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Based on how you used TrueTrucker during your trial:
        </p>

        <div className="p-3 rounded-lg bg-background border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-lg">🎯 TrueTrucker {recommended.name}</span>
            <Badge variant="secondary">${recommended.price}/mo</Badge>
          </div>
          <div className="space-y-1.5">
            {usageHighlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1 gap-1" onClick={() => createCheckout(recommended.plan)}>
            Start {recommended.name} — ${recommended.price}/mo <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/pricing'}>
            See Other Plans
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalizedRecommendation;
