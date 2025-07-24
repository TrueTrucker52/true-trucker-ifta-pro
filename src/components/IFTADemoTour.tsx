import { useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw } from 'lucide-react';

interface IFTADemoTourProps {
  onTourStart?: () => void;
  onTourEnd?: () => void;
}

const IFTADemoTour = ({ onTourStart, onTourEnd }: IFTADemoTourProps) => {
  const [runTour, setRunTour] = useState(false);
  const [tourKey, setTourKey] = useState(0);

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div>
          <h2 className="text-lg font-bold mb-2">Welcome to TrueTrucker IFTA Pro!</h2>
          <p>This interactive demo will show you how our app simplifies IFTA fuel tax reporting for truckers. Let's take a quick tour!</p>
        </div>
      ),
      placement: 'center',
    },
    {
      target: '[data-tour="overview-tab"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Dashboard Overview</h3>
          <p>The Overview tab shows your key metrics at a glance - total miles, fuel used, taxes owed, and average MPG.</p>
        </div>
      ),
    },
    {
      target: '[data-tour="key-metrics"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Key Performance Metrics</h3>
          <p>Monitor your fleet's performance with real-time data on mileage, fuel consumption, tax calculations, and efficiency trends.</p>
        </div>
      ),
    },
    {
      target: '[data-tour="fuel-summary"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">State-by-State Breakdown</h3>
          <p>See detailed fuel tax calculations for each IFTA jurisdiction. Track miles driven, fuel used, and taxes owed per state.</p>
        </div>
      ),
    },
    {
      target: '[data-tour="drivers-tab"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Driver Management</h3>
          <p>Track individual driver performance, fuel efficiency, and compliance metrics across your fleet.</p>
        </div>
      ),
    },
    {
      target: '[data-tour="vehicles-tab"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Fleet Management</h3>
          <p>Monitor fuel consumption and performance data for each vehicle in your fleet.</p>
        </div>
      ),
    },
    {
      target: '[data-tour="ifta-tab"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">IFTA Tax Summary</h3>
          <p>Generate quarterly IFTA reports automatically. View total taxes owed, payments made, and remaining balance.</p>
        </div>
      ),
    },
    {
      target: '[data-tour="trips-tab"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Trip Reports</h3>
          <p>Detailed breakdown of all recorded trips with mileage, fuel consumption, and efficiency calculations.</p>
        </div>
      ),
    },
    {
      target: 'body',
      content: (
        <div>
          <h2 className="text-lg font-bold mb-2">Tour Complete!</h2>
          <p>You've seen how TrueTrucker IFTA Pro simplifies fuel tax compliance. Ready to try it yourself?</p>
          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary font-medium">
              💡 Click through the tabs above to explore the interactive demo, or scroll up to watch our video walkthrough!
            </p>
          </div>
        </div>
      ),
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      onTourEnd?.();
    }
  };

  const startTour = () => {
    setRunTour(true);
    onTourStart?.();
  };

  const restartTour = () => {
    setRunTour(false);
    setTourKey(prev => prev + 1);
    setTimeout(() => {
      setRunTour(true);
      onTourStart?.();
    }, 100);
  };

  return (
    <>
      <Joyride
        key={tourKey}
        steps={steps}
        run={runTour}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: 'hsl(var(--primary))',
            backgroundColor: 'hsl(var(--background))',
            textColor: 'hsl(var(--foreground))',
            overlayColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1000,
          },
          tooltip: {
            borderRadius: 8,
            padding: 20,
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          tooltipTitle: {
            color: 'hsl(var(--foreground))',
          },
          tooltipContent: {
            color: 'hsl(var(--muted-foreground))',
          },
          buttonNext: {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            borderRadius: 6,
            padding: '8px 16px',
          },
          buttonBack: {
            color: 'hsl(var(--muted-foreground))',
            borderRadius: 6,
            padding: '8px 16px',
          },
          buttonSkip: {
            color: 'hsl(var(--muted-foreground))',
          },
        }}
      />
      
      <div className="flex gap-3 mb-6">
        <Button 
          onClick={startTour} 
          className="flex items-center gap-2"
          disabled={runTour}
        >
          <Play className="h-4 w-4" />
          Start Guided Tour
        </Button>
        <Button 
          variant="outline" 
          onClick={restartTour}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Restart Tour
        </Button>
      </div>
    </>
  );
};

export default IFTADemoTour;