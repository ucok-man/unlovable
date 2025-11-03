"use client";

import { useClipboard } from "@/hooks/use-clipboard";
import { Fragment } from "@prisma/client";
import { useState } from "react";
import Toolbar from "./toolbar";

type Props = {
  fragment: Fragment;
};

export default function TabFragmentPreview({ fragment }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { copied, copyToClipboard } = useClipboard();

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleCopyUrl = () => {
    if (fragment.sandboxUrl) {
      copyToClipboard(fragment.sandboxUrl);
    }
  };

  const handleOpenExternal = () => {
    if (fragment.sandboxUrl) {
      window.open(fragment.sandboxUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-col size-full">
      <Toolbar
        sandboxUrl={fragment.sandboxUrl}
        onRefresh={handleRefresh}
        onCopyUrl={handleCopyUrl}
        onOpenExternal={handleOpenExternal}
        copied={copied}
      />

      <div className="flex-1 bg-white">
        <iframe
          key={refreshKey}
          className="size-full border-0"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          loading="lazy"
          src={fragment.sandboxUrl}
          title={`Preview: ${fragment.title}`}
        />
      </div>
    </div>
  );
}
