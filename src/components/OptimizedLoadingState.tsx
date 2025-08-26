import { Truck } from "lucide-react";

interface OptimizedLoadingStateProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export const OptimizedLoadingState = ({ size = "md", message }: OptimizedLoadingStateProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Truck className={`${sizeClasses[size]} text-primary animate-pulse`} />
      {message && <span className="text-sm text-muted-foreground">{message}</span>}
    </div>
  );
};