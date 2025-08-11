"use client";

import Hint from "@/components/hint";
import { Button } from "@/components/ui/button";
import { Fragment } from "@prisma/client";
import { ExternalLink, RefreshCcw } from "lucide-react";
import { useState } from "react";

type Props = {
  data: Fragment;
};

export default function FragmentWeb({ data }: Props) {
  const [fragmentKey, setFragmentKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleExternalLink = () => {
    if (!data.sandboxUrl) return;
    window.open(data.sandboxUrl, "_blank");
  };

  const handleRefresh = () => {
    setFragmentKey((prev) => prev + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.sandboxUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col size-full">
      <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
        <Hint text="Click to refresh" side="bottom" align="start">
          <Button size={"sm"} variant={"outline"} onClick={handleRefresh}>
            <RefreshCcw />
          </Button>
        </Hint>

        <Hint text="Click to copy" side="bottom" align="start">
          <Button
            size={"sm"}
            variant={"outline"}
            className="flex-1 justify-start text-start font-normal"
            onClick={handleCopy}
            disabled={!data.sandboxUrl || copied}
          >
            <span className="truncate">{data.sandboxUrl}</span>
          </Button>
        </Hint>
        <Hint text="Open in a new tab" side="bottom" align="start">
          <Button
            size={"sm"}
            variant={"outline"}
            disabled={!data.sandboxUrl}
            onClick={handleExternalLink}
          >
            <ExternalLink />
          </Button>
        </Hint>
      </div>

      <iframe
        key={fragmentKey}
        className="size-full"
        sandbox="allow-forms allow-scripts allow-same-origin"
        loading="lazy"
        src={data.sandboxUrl}
      />
    </div>
  );
}
