import Image from "next/image";
import { useEffect, useState } from "react";

const LOADING_MESSAGES = [
  "Analyzing your request...",
  "Generating code structure...",
  "Building components...",
  "Optimizing layout...",
  "Adding functionality...",
  "Applying styling...",
  "Running final checks...",
  "Almost ready...",
] as const;

export default function LoadingIndicator() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col group px-2 pb-4">
      <div className="flex items-center gap-2 pl-2 mb-2">
        <Image
          src="/unlovable-logo.png"
          alt="Logo"
          width={18}
          height={18}
          className="shrink-0"
        />
        <span className="text-sm font-medium">Unlovable</span>
      </div>

      <div className="pl-8.5">
        <div className="flex items-center gap-3">
          <div className="flex space-x-1">
            <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="size-2 bg-primary rounded-full animate-bounce" />
          </div>
          <span className="text-sm text-muted-foreground">
            {LOADING_MESSAGES[messageIndex]}
          </span>
        </div>
      </div>
    </div>
  );
}
