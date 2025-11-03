import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function LoadingFallback({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center justify-center p-8 h-full">
      <div className="flex flex-col justify-center items-center gap-3">
        <div className="flex space-x-1">
          <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="size-2 bg-primary rounded-full animate-bounce" />
        </div>
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    </div>
  );
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error?: Error;
  resetErrorBoundary?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-red-500">
      <AlertTriangle className="size-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>
      {resetErrorBoundary && (
        <Button onClick={resetErrorBoundary} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}
