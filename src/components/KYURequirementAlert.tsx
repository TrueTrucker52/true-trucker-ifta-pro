import { useState } from 'react';
import { AlertTriangle, Info, X, ExternalLink, Scale, DollarSign } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface KYUAlertProps {
  miles?: number;
  showCalculation?: boolean;
  className?: string;
}

// Kentucky Weight Distance Tax rate
const KYU_RATE = 0.0285; // $0.0285 per mile

const KYURequirementAlert = ({ miles, showCalculation = false, className = '' }: KYUAlertProps) => {
  const [dismissed, setDismissed] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  if (dismissed) return null;

  const estimatedTax = miles ? (miles * KYU_RATE).toFixed(2) : null;

  return (
    <Alert className={`border-2 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 ${className}`}>
      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-800 dark:text-amber-200 font-bold flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Scale className="h-4 w-4" />
          Kentucky KYU Requirement
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 -mr-2"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-amber-700 dark:text-amber-300 font-medium">
          Kentucky KYU is a <strong>weight-distance tax separate from IFTA</strong>. 
          Ensure your KYU permit is active for this trip.
        </p>

        {showCalculation && miles && (
          <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-800 dark:text-amber-200">
                Estimated KYU Tax ({miles.toLocaleString()} mi × $0.0285):
              </span>
              <Badge variant="secondary" className="bg-amber-200 text-amber-900 font-bold text-base">
                <DollarSign className="h-4 w-4 mr-1" />
                {estimatedTax}
              </Badge>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-amber-500 text-amber-700 hover:bg-amber-100">
                <Info className="h-4 w-4 mr-2" />
                Learn More About KYU
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Scale className="h-6 w-6 text-amber-600" />
                  Kentucky Weight Distance Tax (KYU)
                </DialogTitle>
                <DialogDescription>
                  Understanding Kentucky's weight-distance tax requirements
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-2">What is KYU?</h4>
                  <p className="text-sm text-muted-foreground">
                    Kentucky's Weight Distance Tax (commonly called "KYU") is a mileage-based tax 
                    on heavy vehicles operating on Kentucky highways. It is <strong>separate from 
                    and in addition to IFTA fuel taxes</strong>.
                  </p>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Current Rate</p>
                      <p className="text-2xl font-black text-primary">$0.0285 <span className="text-sm font-normal text-muted-foreground">per mile</span></p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Scale className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Applies To</p>
                      <p className="text-sm text-muted-foreground">
                        Vehicles with a combined licensed weight of <strong>60,000 lbs or more</strong>, 
                        or declared gross weight of 60,000 lbs or more.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                  <h4 className="font-bold text-destructive mb-2">⚠️ Important</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• KYU <strong>cannot</strong> be paid through IFTA</li>
                    <li>• Requires separate registration with Kentucky</li>
                    <li>• Must be reported and paid quarterly</li>
                    <li>• Failure to pay may result in vehicle impoundment</li>
                  </ul>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => window.open('https://drive.ky.gov/Motor-Carriers/Pages/KYU.aspx', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Kentucky KYU Portal
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="ghost" 
            size="sm"
            className="text-amber-700"
            onClick={() => window.open('https://drive.ky.gov/Motor-Carriers/Pages/KYU.aspx', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            KY Portal
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

// Helper function to check if route includes Kentucky
export const routeIncludesKentucky = (
  originState?: string, 
  destinationState?: string, 
  statesTraversed?: string[]
): boolean => {
  const allStates = [
    originState?.toUpperCase(),
    destinationState?.toUpperCase(),
    ...(statesTraversed?.map(s => s.toUpperCase()) || [])
  ].filter(Boolean);
  
  return allStates.some(state => state === 'KY' || state === 'KENTUCKY');
};

export default KYURequirementAlert;
