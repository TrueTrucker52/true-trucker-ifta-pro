import { toast } from "@/hooks/use-toast";

export interface ErrorWithMessage {
  message: string;
}

export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

export function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message;
}

export function handleError(error: unknown, context: string = "An error occurred"): void {
  const errorMessage = getErrorMessage(error);
  console.error(`[${context}]:`, errorMessage);
  
  // Only show user-friendly messages in production
  if (process.env.NODE_ENV === 'production') {
    toast({
      title: "Error",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
  } else {
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  }
}

export function handleAsyncError<T>(
  promise: Promise<T>,
  context: string = "Async operation"
): Promise<T | undefined> {
  return promise.catch((error) => {
    handleError(error, context);
    return undefined;
  });
}