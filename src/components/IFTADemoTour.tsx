import { useState, useRef } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface IFTADemoTourProps {
  onTourStart?: () => void;
  onTourEnd?: () => void;
}

const IFTADemoTour = ({ onTourStart, onTourEnd }: IFTADemoTourProps) => {
  const [runTour, setRunTour] = useState(false);
  const [tourKey, setTourKey] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Function to generate and play speech
  const generateSpeech = async (text: string) => {
    if (!voiceEnabled) return;
    
    try {
      setIsGeneratingAudio(true);
      
      // Extract plain text from JSX content
      const plainText = text.replace(/<[^>]*>/g, '').replace(/💡/g, '');
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: plainText, voice: 'alloy' }
      });

      if (error) {
        console.error('TTS Error:', error);
        return;
      }

      if (data?.audioContent) {
        // Create audio element and play
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        audioRef.current = audio;
        await audio.play();
      }
    } catch (error) {
      console.error('Speech generation failed:', error);
      toast({
        title: "Voice Error",
        description: "Failed to generate speech. Continuing tour silently.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Extract text content from JSX
  const extractTextFromStep = (step: Step): string => {
    if (typeof step.content === 'string') return step.content;
    
    // Convert JSX to text by extracting common patterns
    const stepTexts: { [key: string]: string } = {
      'Welcome to TrueTrucker IFTA Pro!': 'Welcome to TrueTrucker IFTA Pro! This interactive demo will show you how our app simplifies IFTA fuel tax reporting for truckers. Let us take a quick tour!',
      'Dashboard Overview': 'Dashboard Overview. The Overview tab shows your key metrics at a glance - total miles, fuel used, taxes owed, and average MPG.',
      'Key Performance Metrics': 'Key Performance Metrics. Monitor your fleet performance with real-time data on mileage, fuel consumption, tax calculations, and efficiency trends.',
      'State-by-State Breakdown': 'State-by-State Breakdown. See detailed fuel tax calculations for each IFTA jurisdiction. Track miles driven, fuel used, and taxes owed per state.',
      'Driver Management': 'Driver Management. Track individual driver performance, fuel efficiency, and compliance metrics across your fleet.',
      'Fleet Management': 'Fleet Management. Monitor fuel consumption and performance data for each vehicle in your fleet.',
      'IFTA Tax Summary': 'IFTA Tax Summary. Generate quarterly IFTA reports automatically. View total taxes owed, payments made, and remaining balance.',
      'Trip Reports': 'Trip Reports. Detailed breakdown of all recorded trips with mileage, fuel consumption, and efficiency calculations.',
      'Tour Complete!': 'Tour Complete! You have seen how TrueTrucker IFTA Pro simplifies fuel tax compliance. Ready to try it yourself? Click through the tabs above to explore the interactive demo, or scroll up to watch our video walkthrough!'
    };
    
    // Find matching text based on step target or content
    const stepTarget = step.target as string;
    if (stepTarget === 'body' && step.placement === 'center') {
      if (step === steps[0]) return stepTexts['Welcome to TrueTrucker IFTA Pro!'];
      if (step === steps[steps.length - 1]) return stepTexts['Tour Complete!'];
    }
    
    if (stepTarget.includes('overview-tab')) return stepTexts['Dashboard Overview'];
    if (stepTarget.includes('key-metrics')) return stepTexts['Key Performance Metrics'];
    if (stepTarget.includes('fuel-summary')) return stepTexts['State-by-State Breakdown'];
    if (stepTarget.includes('drivers-tab')) return stepTexts['Driver Management'];
    if (stepTarget.includes('vehicles-tab')) return stepTexts['Fleet Management'];
    if (stepTarget.includes('ifta-tab')) return stepTexts['IFTA Tax Summary'];
    if (stepTarget.includes('trips-tab')) return stepTexts['Trip Reports'];
    
    return '';
  };

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
      disableBeacon: true,
    },
    {
      target: '[data-tour="overview-tab"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Dashboard Overview</h3>
          <p>The Overview tab shows your key metrics at a glance - total miles, fuel used, taxes owed, and average MPG.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="key-metrics"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Key Performance Metrics</h3>
          <p>Monitor your fleet's performance with real-time data on mileage, fuel consumption, tax calculations, and efficiency trends.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="fuel-summary"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">State-by-State Breakdown</h3>
          <p>See detailed fuel tax calculations for each IFTA jurisdiction. Track miles driven, fuel used, and taxes owed per state.</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="drivers-tab"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Driver Management</h3>
          <p>Track individual driver performance, fuel efficiency, and compliance metrics across your fleet.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="vehicles-tab"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Fleet Management</h3>
          <p>Monitor fuel consumption and performance data for each vehicle in your fleet.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="ifta-tab"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">IFTA Tax Summary</h3>
          <p>Generate quarterly IFTA reports automatically. View total taxes owed, payments made, and remaining balance.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="trips-tab"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Trip Reports</h3>
          <p>Detailed breakdown of all recorded trips with mileage, fuel consumption, and efficiency calculations.</p>
        </div>
      ),
      placement: 'bottom',
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

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status, type, index, action } = data;
    
    // Generate speech when a new step is shown
    if (type === 'step:after' && action === 'next') {
      const currentStep = steps[index];
      if (currentStep) {
        const speechText = extractTextFromStep(currentStep);
        if (speechText) {
          await generateSpeech(speechText);
        }
      }
    }
    
    // Generate speech for the first step when tour starts
    if (type === 'tour:start') {
      const firstStep = steps[0];
      if (firstStep) {
        const speechText = extractTextFromStep(firstStep);
        if (speechText) {
          await generateSpeech(speechText);
        }
      }
    }
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      // Stop any playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      onTourEnd?.();
    }
  };

  const startTour = () => {
    console.log('Starting tour...');
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
          disabled={runTour || isGeneratingAudio}
        >
          <Play className="h-4 w-4" />
          {isGeneratingAudio ? 'Preparing Audio...' : 'Start Guided Tour'}
        </Button>
        <Button 
          variant="outline" 
          onClick={restartTour}
          className="flex items-center gap-2"
          disabled={isGeneratingAudio}
        >
          <RotateCcw className="h-4 w-4" />
          Restart Tour
        </Button>
      </div>
    </>
  );
};

export default IFTADemoTour;