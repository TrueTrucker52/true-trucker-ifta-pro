import { useMemo } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface Step {
  label: string;
  fields: string[];
}

interface FormProgressBarProps {
  steps: Step[];
  formData: Record<string, string>;
  hasAttemptedSubmit?: boolean;
}

const FormProgressBar = ({ steps, formData, hasAttemptedSubmit }: FormProgressBarProps) => {
  const stepCompletion = useMemo(() => {
    return steps.map(step => {
      const filled = step.fields.filter(f => !!formData[f]).length;
      return step.fields.length === 0 ? 1 : filled / step.fields.length;
    });
  }, [steps, formData]);

  const completedSteps = stepCompletion.filter(c => c === 1).length;
  const overallPercent = Math.round(
    (stepCompletion.reduce((sum, c) => sum + c, 0) / steps.length) * 100
  );

  const currentStepIndex = stepCompletion.findIndex(c => c < 1);
  const activeStep = currentStepIndex === -1 ? steps.length - 1 : currentStepIndex;

  const barColor =
    overallPercent === 100
      ? 'bg-green-500'
      : hasAttemptedSubmit && overallPercent < 100
        ? 'bg-destructive'
        : 'bg-primary';

  const getMessage = () => {
    if (overallPercent <= 25) return "Let's get started! 🚛";
    if (overallPercent <= 50) return 'Good progress, keep going! 💪';
    if (overallPercent <= 75) return 'Almost there! 🔥';
    if (overallPercent < 100) return 'One last step! ⭐';
    return 'Ready to submit! ✅';
  };

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border pb-4 pt-4 -mx-4 px-4 md:-mx-0 md:px-0 md:rounded-xl md:border md:p-5 mb-6">
      {/* Step label and percentage */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-foreground">
          Step {activeStep + 1} of {steps.length} — {overallPercent}% Complete
        </span>
        <span className="text-sm text-muted-foreground hidden sm:block">
          {getMessage()}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-secondary rounded-full h-3 mb-4">
        <div
          className={`h-3 rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${overallPercent}%` }}
        />
      </div>

      {/* Motivational message on mobile */}
      <p className="text-sm text-muted-foreground mb-3 sm:hidden">{getMessage()}</p>

      {/* Step indicators */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto">
        {steps.map((step, i) => {
          const isComplete = stepCompletion[i] === 1;
          const isCurrent = i === activeStep;

          return (
            <div
              key={i}
              className={`flex items-center gap-1.5 text-xs whitespace-nowrap px-2 py-1 rounded-full transition-colors ${
                isComplete
                  ? 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/40'
                  : isCurrent
                    ? 'text-primary font-semibold bg-primary/10'
                    : 'text-muted-foreground'
              }`}
            >
              {isComplete ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
              ) : isCurrent ? (
                <div className="h-4 w-4 rounded-full bg-primary shrink-0 flex items-center justify-center">
                  <span className="text-[10px] text-primary-foreground font-bold">{i + 1}</span>
                </div>
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              )}
              <span className="hidden md:inline">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormProgressBar;