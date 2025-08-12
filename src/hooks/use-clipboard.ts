import { useCallback, useState } from "react";

export function useClipboard(duration = 2000) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), duration);
        return true;
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        return false;
      }
    },
    [duration]
  );

  return { copied, copyToClipboard };
}
