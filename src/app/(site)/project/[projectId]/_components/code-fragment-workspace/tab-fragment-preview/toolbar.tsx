"use client";

import Hint from "@/components/hint";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCcw } from "lucide-react";

type Props = {
  sandboxUrl: string;
  onRefresh: () => void;
  onCopyUrl: () => void;
  onOpenExternal: () => void;
  copied: boolean;
};

export default function Toolbar({
  sandboxUrl,
  onRefresh,
  onCopyUrl,
  onOpenExternal,
  copied,
}: Props) {
  return (
    <div className="flex items-center gap-2 p-2 border-b bg-sidebar">
      <Hint text="Refresh preview">
        <Button size="sm" variant="outline" onClick={onRefresh}>
          <RefreshCcw className="size-4" />
        </Button>
      </Hint>

      <Hint text={copied ? "Copied!" : "Copy URL"}>
        <Button
          size="sm"
          variant="outline"
          onClick={onCopyUrl}
          disabled={!sandboxUrl || copied}
          className="flex-1 justify-start text-left font-normal min-w-0"
        >
          <span className="truncate text-sm">
            {sandboxUrl || "No URL available"}
          </span>
        </Button>
      </Hint>

      <Hint text="Open in new tab">
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenExternal}
          disabled={!sandboxUrl}
        >
          <ExternalLink className="size-4" />
        </Button>
      </Hint>
    </div>
  );
}
