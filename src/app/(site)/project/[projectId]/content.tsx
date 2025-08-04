"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Chatbox from "./chatbox";

type Props = {
  projectId: string;
};

export default function Content({ projectId }: Props) {
  const trpc = useTRPC();
  const project = useSuspenseQuery(
    trpc.project.getById.queryOptions({ projectId })
  );

  return (
    <div className="h-screen overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={50}
          minSize={20}
          className="flex flex-col min-h-0"
        >
          <ErrorBoundary fallback={<div>An Error occur...</div>}>
            <Suspense fallback={<div>Loading chatbox...</div>}>
              <Chatbox projectId={projectId} />
            </Suspense>
          </ErrorBoundary>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={50}>
          <div>[CODE VIEW]</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
